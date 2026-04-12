import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { addOrganizationSchema } from "@/lib/validation/organization";
import { Membership } from "@/models/Membership";
import { Organization } from "@/models/Organization";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function generateUniqueSlug(name: string) {
  const base = generateSlug(name);
  let slug = base;
  let counter = 1;

  while (await Organization.exists({ slug })) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const memberships = await Membership.find({ user: session.user.id })
      .populate("organization")
      .lean();

    const organizations = memberships.map((m) => ({
      organization: m.organization,
      role: m.role,
    }));

    return NextResponse.json(organizations, { status: 200 });
  } catch (error) {
    console.error("[organizations] Unexpected error:", error);
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = addOrganizationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { name, description, supportEmail, address } = parsed.data;

  try {
    await dbConnect();

    const slug = await generateUniqueSlug(name);

    const org = await Organization.create({
      name,
      description,
      supportEmail,
      address,
      slug,
      createdBy: session.user.id,
    });

    await Membership.create({
      user: session.user.id,
      organization: org._id,
      role: "owner",
    });

    return NextResponse.json(org, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Server error. Please try again later.",
      },
      { status: 500 },
    );
  }
}
