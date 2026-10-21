// Gemini AI client — centralized configuration with retry logic & streaming support
import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
export const LIVE_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY environment variable is not configured");
  }
  return key;
}

export function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: getApiKey() });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isTransientError(err: unknown, statusCode: number): boolean {
  if (statusCode === 429 || statusCode === 503) return true;
  const msg = (
    (err as { message?: string })?.message ||
    String(err) ||
    ""
  ).toLowerCase();
  return (
    msg.includes("high demand") ||
    msg.includes("overloaded") ||
    msg.includes("rate limit") ||
    msg.includes("resource exhausted")
  );
}

export async function callGemini(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  maxTokens = 2000
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const apiKey = getApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: maxTokens,
      responseMimeType: "application/json",
    },
  };

  const MAX_RETRIES = 3;
  const BASE_DELAY_MS = 1000;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.error) {
        if (
          attempt < MAX_RETRIES &&
          isTransientError(data.error.message, res.status)
        ) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          console.warn(
            `[Gemini] Transient error (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms:`,
            data.error.message
          );
          await sleep(delay);
          continue;
        }
        throw new Error(data.error.message);
      }

      if (!res.ok) {
        if (attempt < MAX_RETRIES && isTransientError("", res.status)) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          console.warn(
            `[Gemini] HTTP ${res.status} (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms`
          );
          await sleep(delay);
          continue;
        }
        throw new Error(`Gemini API returned HTTP ${res.status}`);
      }

      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      return { content: [{ type: "text", text }] };
    } catch (err) {
      if (attempt < MAX_RETRIES && isTransientError(err, 0)) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `[Gemini] Network error (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms:`,
          (err as Error).message
        );
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }

  throw new Error("Max retries exceeded");
}

export async function createLiveEphemeralToken(): Promise<{ token: string; expiresIn: number }> {
  const apiKey = getApiKey();
  const url = "https://generativelanguage.googleapis.com/v1beta/auth_tokens";

  const now = new Date();
  const expireTime = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
  const newSessionExpireTime = new Date(now.getTime() + 2 * 60 * 1000).toISOString();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      uses: 1,
      expireTime,
      newSessionExpireTime,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("[Gemini AuthToken] API error:", res.status, errorText);
    // If auth_tokens isn't enabled for the key or tier, provide clear error message
    throw new Error(`Failed to generate ephemeral token (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const token = data.name || data.token;
  return { token, expiresIn: 120 };
}
