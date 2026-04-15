import { NextRequest, NextResponse } from "next/server";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Terjadi kesalahan internal server";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 },
      );
    }

    const response = await fetch(
      "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.QWEN_MODEL,
          messages: [
            {
              role: "system",
              content:
                "Jawab dengan singkat.",
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
        enable_thinking: false,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("DashScope Error:", data);
      return NextResponse.json(
        { error: data.error?.message || "Gagal menghubungi AI" },
        { status: response.status },
      );
    }

    const reply =
      data.choices?.[0]?.message?.content ||
      "Maaf, saya tidak bisa menjawab saat ini.";

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
