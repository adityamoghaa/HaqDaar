// POST /api/chat — Profile extraction via Gemini
import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { chatRequestSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const limiter = rateLimit(`chat:${ip}`, { maxRequests: 30, windowMs: 60000 });
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please slow down." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { system, messages } = parsed.data;
    const result = await callGemini(system, messages);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[API /chat] Error:", (err as Error).message);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
