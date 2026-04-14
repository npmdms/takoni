import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Membership } from "@/models/Membership";
import { Chatbot } from "@/models/Chatbot";
import { appearanceSchema } from "@/lib/validation/appearance";

interface Props {
  params: Promise<{ organizationId: string; chatbotId: string }>;
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const { organizationId, chatbotId } = await params;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const membership = await Membership.findOne({
      user: session.user.id,
      organization: organizationId,
      role: "owner",
    }).lean();

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = appearanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const chatbot = await Chatbot.findOneAndUpdate(
      { _id: chatbotId, organization: organizationId },
      { appearance: parsed.data },
      { new: true },
    ).lean();

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    return NextResponse.json(chatbot, { status: 200 });
  } catch (error) {
    console.error("[chatbot appearance PATCH]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
