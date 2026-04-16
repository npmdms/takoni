import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Membership } from "@/models/Membership";
import { Chatbot } from "@/models/Chatbot";
import { Knowledge } from "@/models/Knowledge";
import { Message } from "@/models/Message";
import { updateChatbotSchema } from "@/lib/validation/chatbot";
import slugify from "slugify";

interface Props {
  params: Promise<{ organizationId: string; chatbotId: string }>;
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const { organizationId, chatbotId } = await params;

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();

    const membership = await Membership.findOne({
      user: session.user.id,
      organization: organizationId,
      role: "owner",
    });
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const parsed = updateChatbotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, description, systemPrompt, welcomeMessage, isActive, requirePreChat } = parsed.data;
    const slug = slugify(name, { lower: true, strict: true });

    const existing = await Chatbot.findOne({
      slug,
      organization: organizationId,
      _id: { $ne: chatbotId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A chatbot with this name already exists" },
        { status: 409 }
      );
    }

    const chatbot = await Chatbot.findByIdAndUpdate(
      chatbotId,
      { name, slug, description, systemPrompt, welcomeMessage, isActive, requirePreChat },
      { new: true }
    ).lean();

    return NextResponse.json(chatbot, { status: 200 });
  } catch (error) {
    console.error("[chatbot PATCH]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const { organizationId, chatbotId } = await params;

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();

    const membership = await Membership.findOne({
      user: session.user.id,
      organization: organizationId,
      role: "owner",
    });
    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const chatbot = await Chatbot.findOneAndDelete({
      _id: chatbotId,
      organization: organizationId,
    });
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    await Knowledge.deleteMany({ organizationId, chatbotId });
    await Message.deleteMany({ chatbot: chatbotId });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[chatbot DELETE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
