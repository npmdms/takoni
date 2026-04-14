import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Chatbot } from "@/models/Chatbot";
import { Knowledge } from "@/models/Knowledge";
import { Membership } from "@/models/Membership";
import { createKnowledgeSchema } from "@/lib/validation/knowledge";

const MAX_KNOWLEDGE_DOCUMENTS = 10;

interface Props {
  params: Promise<{ chatbotId: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  const { chatbotId } = await params;

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();

    const chatbot = await Chatbot.findById(chatbotId).lean();
    if (!chatbot)
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });

    const membership = await Membership.findOne({
      user: session.user.id,
      organization: chatbot.organization,
    }).lean();
    if (!membership)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const knowledge = await Knowledge.find({ chatbot: chatbotId }).lean();

    return NextResponse.json(knowledge, { status: 200 });
  } catch (error) {
    console.error("[knowledge GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Props) {
  const { chatbotId } = await params;

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();

    const chatbot = await Chatbot.findById(chatbotId).lean();
    if (!chatbot)
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });

    const body = await req.json();
    const parsed = createKnowledgeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const totalKnowledge = await Knowledge.countDocuments({ chatbot: chatbotId });
    if (totalKnowledge >= MAX_KNOWLEDGE_DOCUMENTS) {
      return NextResponse.json(
        {
          error: `Knowledge limit reached. You can only save up to ${MAX_KNOWLEDGE_DOCUMENTS} documents.`,
        },
        { status: 400 },
      );
    }

    const knowledge = await Knowledge.create({
      ...parsed.data,
      chatbot: chatbotId,
      createdBy: session.user.id,
    });

    return NextResponse.json(knowledge, { status: 201 });
  } catch (error) {
    console.error("[knowledge POST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
