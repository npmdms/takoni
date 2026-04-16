import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Membership } from "@/models/Membership";
import { User } from "@/models/User";

interface Props {
  params: Promise<{ organizationId: string }>;
}

export async function GET(_req: NextRequest, { params }: Props) {
  const { organizationId } = await params;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const membership = await Membership.findOne({
      user: session.user.id,
      organization: organizationId,
    });
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const members = await Membership.find({ organization: organizationId })
      .populate("user", "email username")
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(members, { status: 200 });
  } catch (error) {
    console.error("[members GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Props) {
  const { organizationId } = await params;

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
    });
    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return NextResponse.json(
        { error: "User with that email was not found" },
        { status: 404 },
      );
    }

    const existing = await Membership.findOne({
      user: user._id,
      organization: organizationId,
    }).lean();
    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const created = await Membership.create({
      user: user._id,
      organization: organizationId,
      role: "member",
    });

    const populated = await Membership.findById(created._id)
      .populate("user", "email username")
      .lean();

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error("[members POST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

