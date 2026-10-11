// POST /api/tts — Neural Text-to-Speech via Gemini 2.5 Flash TTS
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const limiter = rateLimit(`tts:${ip}`, { maxRequests: 30, windowMs: 60000 });
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many TTS requests. Please slow down." },
      { status: 429 }
    );
  }

  try {
    const { text, voice = "Kore" } = await request.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    // Clean text to avoid markdown artifacts in speech
    const cleanText = text
      .replace(/[*#_`~>\[\]\(\)]/g, "")
      .replace(/\n+/g, " ")
      .trim()
      .slice(0, 1000);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `Read this aloud clearly, naturally, and warmly: ${cleanText}` }],
          },
        ],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice,
              },
            },
          },
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[TTS API] Upstream error:", res.status, errText);
      return NextResponse.json({ error: `TTS failed with ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    const inline = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;

    if (!inline || !inline.data) {
      return NextResponse.json({ error: "No audio data returned" }, { status: 502 });
    }

    return NextResponse.json({
      audioBase64: inline.data,
      mimeType: inline.mimeType || "audio/L16;codec=pcm;rate=24000",
      sampleRate: 24000,
    });
  } catch (err: any) {
    console.error("[TTS API] Error:", err);
    return NextResponse.json(
      { error: err.message || "TTS processing error" },
      { status: 500 }
    );
  }
}
