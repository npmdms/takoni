import { authOptions } from "@/lib/auth";
import {
  detectReplyLanguage,
  getNoContextReply,
  getReplyLanguageInstruction,
} from "@/lib/message-language";
import { dbConnect } from "@/lib/mongodb";
import { Membership } from "@/models/Membership";
import { Organization } from "@/models/Organization";
import { Chatbot } from "@/models/Chatbot";
import { Knowledge } from "@/models/Knowledge";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: Promise<{ organizationId: string; chatbotId: string }>;
}

interface ChatCompletionMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

const QWEN_MODEL = process.env.QWEN_MODEL || "qwen3.6-flash";
const QWEN_API_URL =
  "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";

export async function POST(req: NextRequest, { params }: Props) {
  const { organizationId, chatbotId } = await params;

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey)
    return NextResponse.json({ error: "API Key missing" }, { status: 500 });

  try {
    await dbConnect();

    const membership = await Membership.findOne({
      user: session.user.id,
      organization: organizationId,
    }).lean();

    if (!membership)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const chatbot = await Chatbot.findOne({
      _id: chatbotId,
      organization: organizationId,
    }).lean();

    if (!chatbot)
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });

    const org = await Organization.findById(organizationId)
      .select("name supportEmail")
      .lean();

    const supportEmail = org?.supportEmail || "support@company.com";

    const body = await req.json();
    const userMessage =
      typeof body?.message === "string" ? body.message.trim() : "";

    if (!userMessage) {
      return NextResponse.json(
        { error: "Message content is empty" },
        { status: 400 },
      );
    }

    const knowledges = await Knowledge.find({
      organizationId,
      chatbotId,
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
    const customSystemPrompt = chatbot.systemPrompt?.trim();
    const noContextReply = getNoContextReply(replyLanguage, supportEmail);
    const systemPrompt = [
      customSystemPrompt || `You are ${chatbot.name}.`,
      getReplyLanguageInstruction(replyLanguage),
      "Answer ONLY using the knowledge context below.",
      `If the answer is not in the context, say exactly: "${noContextReply}"`,
      "Keep the answer short, clear, and direct.",
      "",
      "KNOWLEDGE CONTEXT:",
      contextText,
    ].join("\n");

    const messages: ChatCompletionMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(QWEN_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: QWEN_MODEL,
          messages: messages,
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
        console.error("Qwen API Error:", errData);
        return NextResponse.json(
          {
            error: "AI Service Error",
            details: errData.error?.message || response.statusText,
          },
          { status: 502 },
        );
      }

      const data = await response.json();
      const reply =
        data.choices?.[0]?.message?.content || noContextReply;

      return NextResponse.json({ reply: reply.trim() });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (isAbortError(fetchError)) {
        return NextResponse.json(
          { error: "Request timed out" },
          { status: 504 },
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("[Chat API] Critical Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
