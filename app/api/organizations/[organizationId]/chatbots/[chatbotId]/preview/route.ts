import { authOptions } from "@/lib/auth";
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

const QWEN_API_URL =
  process.env.QWEN_API_URL ??
  "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
const QWEN_MODEL = process.env.QWEN_MODEL ?? "qwen-plus";

export async function POST(req: NextRequest, { params }: Props) {
  const { organizationId, chatbotId } = await params;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "QWEN_API_KEY is not configured." },
      { status: 500 },
    );
  }

  try {
    await dbConnect();

    const membership = await Membership.findOne({
      user: session.user.id,
      organization: organizationId,
    }).lean();
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const organization = await Organization.findById(organizationId).lean();
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const chatbot = await Chatbot.findOne({
      _id: chatbotId,
      organization: organizationId,
    }).lean();
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const knowledgeEntries = await Knowledge.find({
      chatbot: chatbotId,
      isActive: true,
    })
      .select({ title: 1, content: 1, category: 1 })
      .sort({ updatedAt: -1 })
      .limit(8)
      .lean();

    const knowledgeContext = knowledgeEntries
      .map(
        (item, index) =>
          `[${index + 1}] ${item.title} (${item.category})\n${item.content}`,
      )
      .join("\n\n");

    const systemInstruction = `
You are ${chatbot.name}, an assistant for organization "${organization.name}".
${chatbot.systemPrompt?.trim() ? `Base behavior:\n${chatbot.systemPrompt.trim()}` : ""}

Use the provided knowledge context when relevant. If the answer is not in the context, say you are not sure and ask a follow-up question.
Do not fabricate policies or product details.

Knowledge context:
${knowledgeContext || "No knowledge entries available."}
    `.trim();

    const qwenResponse = await fetch(QWEN_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: message },
        ],
        temperature: 0.5,
      }),
    });

    if (!qwenResponse.ok) {
      const errorText = await qwenResponse.text();
      return NextResponse.json(
        { error: `Qwen request failed: ${errorText}` },
        { status: 502 },
      );
    }

    const data = await qwenResponse.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply || typeof reply !== "string") {
      return NextResponse.json(
        { error: "Qwen response format is invalid." },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply }, { status: 200 });
  } catch (error) {
    console.error("[chatbot preview POST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
