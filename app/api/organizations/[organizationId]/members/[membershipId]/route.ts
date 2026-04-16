import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Membership } from "@/models/Membership";

interface Props {
  params: Promise<{ organizationId: string; membershipId: string }>;
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const { organizationId, membershipId } = await params;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const requester = await Membership.findOne({
      user: session.user.id,
      organization: organizationId,
      role: "owner",
    }).lean();
    if (!requester) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const target = await Membership.findOne({
      _id: membershipId,
      organization: organizationId,
    }).lean();
    if (!target) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (String(target.user) === String(session.user.id)) {
      return NextResponse.json(
        { error: "You can't remove yourself" },
        { status: 400 },
      );
    }

    if (target.role === "owner") {
      return NextResponse.json(
        { error: "You can't remove an owner" },
        { status: 400 },
      );
    }

    await Membership.deleteOne({ _id: membershipId });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[member DELETE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

