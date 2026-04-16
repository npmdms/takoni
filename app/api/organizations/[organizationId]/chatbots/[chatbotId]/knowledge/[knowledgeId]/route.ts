import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Chatbot } from "@/models/Chatbot";
import { Knowledge } from "@/models/Knowledge";
import { Membership } from "@/models/Membership";
import { createKnowledgeSchema } from "@/lib/validation/knowledge";

interface Props {
  params: Promise<{
    organizationId: string;
    chatbotId: string;
    knowledgeId: string;
  }>;
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const { organizationId, chatbotId, knowledgeId } = await params;

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const body = await req.json();
    const parsed = createKnowledgeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const knowledge = await Knowledge.findOneAndUpdate(
      { _id: knowledgeId, organizationId, chatbotId },
      { ...parsed.data },
      { new: true },
    ).lean();

    if (!knowledge)
      return NextResponse.json(
        { error: "Knowledge not found" },
        { status: 404 },
      );

    return NextResponse.json(knowledge, { status: 200 });
  } catch (error) {
    console.error("[knowledge PATCH]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const { organizationId, chatbotId, knowledgeId } = await params;

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const knowledge = await Knowledge.findOneAndDelete({
      _id: knowledgeId,
      organizationId,
      chatbotId,
    }).lean();

    if (!knowledge)
      return NextResponse.json(
        { error: "Knowledge not found" },
        { status: 404 },
      );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[knowledge DELETE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
