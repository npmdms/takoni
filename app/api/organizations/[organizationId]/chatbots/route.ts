import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Membership } from "@/models/Membership";
import { Chatbot } from "@/models/Chatbot";
import { createChatbotSchema } from "@/lib/validation/chatbot";
import slugify from "slugify";

interface Props {
  params: Promise<{ organizationId: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  const { organizationId } = await params;

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();

    const membership = await Membership.findOne({
      user: session.user.id,
      organization: organizationId,
    });
    if (!membership)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const chatbots = await Chatbot.find({
      organization: organizationId,
    }).lean();

    return NextResponse.json(chatbots, { status: 200 });
  } catch (error) {
    console.error("[chatbots GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Props) {
  const { organizationId } = await params;

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();

    const membership = await Membership.findOne({
      user: session.user.id,
      organization: organizationId,
    });
    if (!membership)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const parsed = createChatbotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const {
      name,
      description,
      systemPrompt,
      welcomeMessage,
      isActive,
      requirePreChat,
    } = parsed.data;

    const slug = slugify(name, { lower: true, strict: true });

    const existing = await Chatbot.findOne({
      slug,
      organization: organizationId,
    });
    if (existing) {
      return NextResponse.json(
        { error: "A chatbot with this name already exists" },
        { status: 409 },
      );
    }

    const chatbot = await Chatbot.create({
      name,
      slug,
      description,
      systemPrompt,
      welcomeMessage,
      isActive,
      requirePreChat,
      organization: organizationId,
      createdBy: session.user.id,
    });

    return NextResponse.json(chatbot, { status: 201 });
  } catch (error) {
    console.error("[chatbots POST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
