// POST /api/voice — Multimodal Voice Audio Processing via Gemini 2.5 Flash
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { CHAT_SYSTEM_PROMPT } from "@/hooks/useChat";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const limiter = rateLimit(`voice:${ip}`, { maxRequests: 25, windowMs: 60000 });
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many voice requests. Please slow down." },
      { status: 429 }
    );
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const {
      audioBase64,
      mimeType = "audio/webm",
      history = [],
      language = "hi",
      profile = {},
      text: fallbackTextInput,
    } = body || {};

    if (!audioBase64 && !fallbackTextInput) {
      return NextResponse.json(
        { error: "audioBase64 or text field is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const knownProfileEntries = Object.entries(profile || {}).filter(
      ([k, v]) => v !== null && v !== undefined && v !== "" && k !== "raw_text"
    );
    const knownProfileStr =
      knownProfileEntries.length > 0
        ? knownProfileEntries.map(([k, v]) => `${k}: ${v}`).join(", ")
        : "None yet";

    const voicePrompt = `You are HaqDaar, an empathetic Indian government scheme guide.
Listen carefully to the citizen's recorded audio message.

ALREADY KNOWN DEMOGRAPHIC FACTS ABOUT THIS CITIZEN IN THIS SESSION:
${knownProfileStr}

Your task:
1. Accurately transcribe what the citizen said in their language (Hindi, English, Hinglish, Tamil, Bengali, Marathi, etc.)
2. Silently extract demographic facts into a profile object:
   - state: Indian state (UP, MH, RJ, TN, WB, etc.) or null
   - occupation: farmer, student, daily_wage, self_employed, unemployed, retired, or null
   - income: annual income number in rupees or null
   - age: number or null
   - gender: male or female or null
   - caste: SC, ST, OBC, general, minority or null
   - bpl: boolean or null
   - raw_text: summary of citizen's situation
3. Provide a warm, conversational audio reply directly addressing their situation in their spoken language.
4. Set "ready_to_match": true if you have occupation + (state OR income), else false.
5. MANDATORY RULES:
   - Do NOT re-ask for details already known!
   - In your output profile object, retain and merge all previously known facts.
   - If citizen corrects an already known detail, update it warmly.

Return valid JSON strictly matching this schema:
{
  "transcript": "Exact transcription of citizen's audio",
  "message": "Your conversational response to the user in their language (to be spoken aloud)",
  "profile": {
    "state": null,
    "occupation": null,
    "income": null,
    "age": null,
    "gender": null,
    "caste": null,
    "bpl": null,
    "raw_text": ""
  },
  "ready_to_match": false
}`;

    // Construct contents
    const userParts: any[] = [];

    // Sanitize MIME type (remove codecs params like ;codecs=opus)
    const cleanMimeType = (mimeType || "audio/webm").split(";")[0].trim();

    if (audioBase64) {
      userParts.push({
        inlineData: {
          mimeType: cleanMimeType,
          data: audioBase64,
        },
      });
      userParts.push({
        text: "Please transcribe the audio, extract demographic profile facts, and reply warmly in their spoken language.",
      });
    } else if (body.text) {
      userParts.push({
        text: `Citizen said: "${body.text}". Please extract profile and reply warmly.`,
      });
    } else {
      return NextResponse.json(
        { error: "Missing audioBase64 or text" },
        { status: 400 }
      );
    }

    // Convert past history to contents
    const pastContents = (history || []).slice(-6).map((m: { role: string; content?: string; text?: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content || m.text || "" }],
    }));

    const contents = [
      ...pastContents,
      {
        role: "user",
        parts: userParts,
      },
    ];

    // Resilient multi-model retry loop
    const candidateModels = ["gemini-2.5-flash", "gemini-flash-latest"];
    let rawText = "";
    let lastError: string | null = null;

    for (const model of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        systemInstruction: { parts: [{ text: voicePrompt }] },
        contents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      };

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            const data = await res.json();
            rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (rawText) break;
          } else {
            const errText = await res.text();
            lastError = `Model ${model} returned ${res.status}: ${errText.slice(0, 100)}`;
            console.warn(`[Voice API] ${model} attempt ${attempt + 1} status ${res.status}`);
            if (res.status === 503 || res.status === 429) {
              await new Promise((r) => setTimeout(r, 1000));
            } else {
              break; // Non-transient error, try next model
            }
          }
        } catch (fetchErr: any) {
          lastError = fetchErr.message;
          console.warn(`[Voice API] ${model} attempt ${attempt + 1} fetch error:`, fetchErr.message);
          await new Promise((r) => setTimeout(r, 800));
        }
      }

      if (rawText) break;
    }

    if (!rawText) {
      console.error("[Voice API] All models exhausted. Last error:", lastError);
      return NextResponse.json({
        transcript: "Audio received",
        message:
          language === "hi"
            ? "सर्वर पर अभी अधिक भार है। कृपया एक पल बाद दोबारा बोलें।"
            : "The voice service is momentarily busy. Please tap to speak again.",
        profile: {},
        ready_to_match: false,
      });
    }

    let outputObj: any = {
      transcript: "Voice received",
      message: rawText,
      profile: {},
      ready_to_match: false,
    };

    try {
      outputObj = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          outputObj = JSON.parse(match[0]);
        } catch {}
      }
    }

    // Merge previous known profile so facts are never lost
    outputObj.profile = {
      ...(profile || {}),
      ...(outputObj.profile || {}),
    };

    // Synthesize Neural Audio for output message
    let audioOutputBase64: string | null = null;
    if (outputObj.message) {
      try {
        const cleanSpeechText = String(outputObj.message)
          .replace(/[*#_`~>\[\]\(\)]/g, "")
          .replace(/\n+/g, " ")
          .trim()
          .slice(0, 1000);

        const ttsUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
        const ttsRes = await fetch(ttsUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `Read this aloud warmly, clearly, and naturally: ${cleanSpeechText}` }],
              },
            ],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Kore",
                  },
                },
              },
            },
          }),
        });

        if (ttsRes.ok) {
          const ttsData = await ttsRes.json();
          audioOutputBase64 =
            ttsData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
        }
      } catch (ttsErr) {
        console.warn("[Voice API] Background neural audio synthesis error:", ttsErr);
      }
    }

    return NextResponse.json({
      ...outputObj,
      audioBase64: audioOutputBase64,
      sampleRate: 24000,
    });
  } catch (err) {
    console.error("[Voice API] Uncaught error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
