import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Organization } from "@/models/Organization";
import { Membership } from "@/models/Membership";
import { Chatbot } from "@/models/Chatbot";
import { updateOrganizationSchema } from "@/lib/validation/organization";
import slugify from "slugify";
import { Knowledge } from "@/models/Knowledge";

interface Props {
  params: Promise<{ organizationId: string }>;
}

async function generateUniqueOrganizationSlug(
  name: string,
  organizationId?: string,
) {
  const base = slugify(name, { lower: true, strict: true });
  let slug = base;
  let counter = 1;

  while (
    await Organization.exists({
      slug,
      ...(organizationId ? { _id: { $ne: organizationId } } : {}),
    })
  ) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const { organizationId } = await params;

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();

    const membership = await Membership.findOne({
      user: session.user.id,
      organization: organizationId,
      role: "owner",
    });
    if (!membership)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const parsed = updateOrganizationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, description, supportEmail, address } = parsed.data;
    const slug = await generateUniqueOrganizationSlug(name, organizationId);

    const org = await Organization.findByIdAndUpdate(
      organizationId,
      { name, slug, description, supportEmail, address },
      { new: true },
    ).lean();

    return NextResponse.json(org, { status: 200 });
  } catch (error) {
    console.error("[organization PATCH]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  const { organizationId } = await params;

  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await dbConnect();

    const membership = await Membership.findOne({
      user: session.user.id,
      organization: organizationId,
      role: "owner",
    });
    if (!membership)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const chatbots = await Chatbot.find({
      organization: organizationId,
    }).lean();

    const chatbotIds = chatbots.map((c) => c._id);

    await Knowledge.deleteMany({
      organizationId,
      chatbotId: { $in: chatbotIds },
    });

    await Chatbot.deleteMany({ organization: organizationId });

    await Membership.deleteMany({ organization: organizationId });

    await Organization.findByIdAndDelete(organizationId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[organization DELETE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
