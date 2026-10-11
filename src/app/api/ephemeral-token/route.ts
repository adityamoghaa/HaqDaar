// POST /api/ephemeral-token — Server-side minting of short-lived tokens for Gemini Live WebSocket
import { NextRequest, NextResponse } from "next/server";
import { createLiveEphemeralToken } from "@/lib/gemini";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const limiter = rateLimit(`token:${ip}`, { maxRequests: 10, windowMs: 60000 });
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many token requests. Please wait a minute." },
      { status: 429 }
    );
  }

  try {
    const tokenData = await createLiveEphemeralToken();
    return NextResponse.json({
      token: tokenData.token,
      expiresIn: tokenData.expiresIn,
    });
  } catch (err) {
    console.warn("[API /ephemeral-token] Ephemeral token creation failed:", (err as Error).message);
    // In local development or preview environments where auth_tokens API isn't enabled,
    // we can provide fallback handling
    return NextResponse.json(
      {
        error: "Live voice requires a valid Gemini API key configured with auth token permissions.",
        detail: (err as Error).message,
      },
      { status: 502 }
    );
  }
}
