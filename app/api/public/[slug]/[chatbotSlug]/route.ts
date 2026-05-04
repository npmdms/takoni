import { dbConnect } from "@/lib/mongodb";
import {
  detectReplyLanguage,
  getNoContextReply,
  getReplyLanguageInstruction,
} from "@/lib/message-language";
import { buildPublicChatbotConfig } from "@/lib/chatbot-widget";
import { Chatbot } from "@/models/Chatbot";
import { Knowledge } from "@/models/Knowledge";
import { Message } from "@/models/Message";
import { Organization } from "@/models/Organization";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: Promise<{ slug: string; chatbotSlug: string }>;
}

function withCORS(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 200 }));
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

const QWEN_MODEL = process.env.QWEN_MODEL || "qwen3.5-flash";
const QWEN_API_URL =
  "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";

async function getPublicChatbot(slug: string, chatbotSlug: string) {
  const org = await Organization.findOne({ slug })
    .select("_id supportEmail")
    .lean();
  if (!org) return null;

  const chatbot = await Chatbot.findOne({
    slug: chatbotSlug,
    organization: org._id,
  }).lean();

  if (!chatbot) return null;

  return {
    organizationId: String(org._id),
    supportEmail: org.supportEmail || "support@company.com",
    chatbot,
  };
}

export async function GET(_: NextRequest, { params }: Props) {
  const { slug, chatbotSlug } = await params;

  try {
    await dbConnect();

    const data = await getPublicChatbot(slug, chatbotSlug);
    if (!data || !data.chatbot.isActive) {
      return withCORS(
        NextResponse.json({ error: "Chatbot not found" }, { status: 404 }),
      );
    }

    const knowledgeCount = await Knowledge.countDocuments({
      organizationId: data.organizationId,
      chatbotId: data.chatbot._id,
      isActive: true,
    });

    if (knowledgeCount < 1) {
      return withCORS(
        NextResponse.json({ error: "Chatbot not ready" }, { status: 404 }),
      );
    }

    return withCORS(
      NextResponse.json({
        chatbot: buildPublicChatbotConfig(data.chatbot),
        knowledgeCount,
      }),
    );
  } catch (error) {
    console.error("[public chatbot GET]", error);
    return withCORS(
      NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
    );
  }
}

export async function POST(req: NextRequest, { params }: Props) {
  const { slug, chatbotSlug } = await params;

  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    return withCORS(
      NextResponse.json({ error: "API Key missing" }, { status: 500 }),
    );
  }

  try {
    await dbConnect();

    const data = await getPublicChatbot(slug, chatbotSlug);
    if (!data || !data.chatbot.isActive) {
      return withCORS(
        NextResponse.json({ error: "Chatbot not found" }, { status: 404 }),
      );
    }

    const knowledgeCount = await Knowledge.countDocuments({
      organizationId: data.organizationId,
      chatbotId: data.chatbot._id,
      isActive: true,
    });

    if (knowledgeCount < 1) {
      return withCORS(
        NextResponse.json({ error: "Chatbot not ready" }, { status: 404 }),
      );
    }

    const body = await req.json();
    const userMessage =
      typeof body?.message === "string" ? body.message.trim() : "";
    const conversationId =
      typeof body?.conversationId === "string"
        ? body.conversationId.trim()
        : "";
    const visitorName =
      typeof body?.visitor?.name === "string" ? body.visitor.name.trim() : "";
    const visitorEmail =
      typeof body?.visitor?.email === "string" ? body.visitor.email.trim() : "";

    if (!userMessage || !conversationId) {
      return withCORS(
        NextResponse.json(
          { error: "Message content is empty" },
          { status: 400 },
        ),
      );
    }

    const knowledges = await Knowledge.find({
      organizationId: data.organizationId,
      chatbotId: data.chatbot._id,
      isActive: true,
    })
      .select({ title: 1, content: 1 })
      .limit(5)
      .lean();

    const contextText =
      knowledges.length > 0
        ? knowledges.map((k) => `[INFO] ${k.title}: ${k.content}`).join("\n")
        : "No knowledge base available.";

    const replyLanguage = detectReplyLanguage(userMessage);
    const customSystemPrompt = data.chatbot.systemPrompt?.trim();
    const noContextReply = getNoContextReply(replyLanguage, data.supportEmail);
    const systemPrompt = [
      customSystemPrompt || `You are ${data.chatbot.name}.`,
      getReplyLanguageInstruction(replyLanguage),
      "Answer ONLY using the knowledge context below.",
      `If the answer is not in the context, say exactly: "${noContextReply}"`,
      "Keep the answer short, clear, and direct.",
      "",
      "KNOWLEDGE CONTEXT:",
      contextText,
    ].join("\n");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    await Message.create({
      organization: data.organizationId,
      chatbot: data.chatbot._id,
      conversationId,
      role: "user",
      content: userMessage,
      source: "widget",
      visitor: {
        name: visitorName || undefined,
        email: visitorEmail || undefined,
      },
    });

    try {
      const response = await fetch(QWEN_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: QWEN_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.1,
          max_tokens: 512,
          top_p: 0.8,
          enable_thinking: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return withCORS(
          NextResponse.json(
            {
              error: "AI Service Error",
              details: errData.error?.message || response.statusText,
            },
            { status: 502 },
          ),
        );
      }

      const result = await response.json();
      const reply =
        result.choices?.[0]?.message?.content || noContextReply;

      await Message.create({
        organization: data.organizationId,
        chatbot: data.chatbot._id,
        conversationId,
        role: "assistant",
        content: reply.trim(),
        source: "widget",
        visitor: {
          name: visitorName || undefined,
          email: visitorEmail || undefined,
        },
      });

      return withCORS(NextResponse.json({ reply: reply.trim() }));
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (isAbortError(fetchError)) {
        return withCORS(
          NextResponse.json({ error: "Request timed out" }, { status: 504 }),
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("[public chatbot POST]", error);
    return withCORS(
      NextResponse.json({ error: "Internal Server Error" }, { status: 500 }),
    );
  }
}
