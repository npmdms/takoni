import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { signUpSchema } from "@/lib/validation/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { email, username, password, emailPreferences } = parsed.data;

  try {
    await dbConnect();

    const exists = await User.exists({ $or: [{ email }, { username }] });
    if (exists) {
      return NextResponse.json(
        { error: "Email or username is already registered." },
        { status: 409 },
      );
    }

    await User.create({
      email,
      username,
      emailPreferences,
      password: await hash(password, 12),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 },
    );
  }
}
