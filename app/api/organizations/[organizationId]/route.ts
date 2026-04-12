import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Organization } from "@/models/Organization";
import { Membership } from "@/models/Membership";
import { Chatbot } from "@/models/Chatbot";
import { updateOrganizationSchema } from "@/lib/validation/organization";
import slugify from "slugify";

interface Props {
  params: Promise<{ organizationId: string }>;
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
    const slug = slugify(name, { lower: true, strict: true });

    const existing = await Organization.findOne({
      slug,
      _id: { $ne: organizationId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Organization name already taken" },
        { status: 409 },
      );
    }

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

    await Chatbot.deleteMany({ organization: organizationId });

    await Membership.deleteMany({ organization: organizationId });

    await Organization.findByIdAndDelete(organizationId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[organization DELETE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
