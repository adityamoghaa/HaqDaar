// server.js — HaqDaar v2 API Proxy
// Gemini 3.5 Flash (Google AI Pro) — single provider, clean architecture
// Run: node server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

const GEMINI_MODEL = "gemini-3.5-flash";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isTransientError(err, statusCode) {
  if (statusCode === 429 || statusCode === 503) return true;
  const msg = (err?.message || err || "").toString().toLowerCase();
  return msg.includes("high demand") || msg.includes("overloaded") || msg.includes("rate limit") || msg.includes("resource exhausted");
}

// ─── Gemini API Call (with retry) ────────────────────────────────────────────
async function callGemini(systemPrompt, messages, maxTokens = 2000) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set in .env");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  // Convert messages to Gemini format
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
        if (attempt < MAX_RETRIES && isTransientError(data.error.message, res.status)) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          console.warn(`[Gemini] Transient error (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms:`, data.error.message);
          await sleep(delay);
          continue;
        }
        throw new Error(data.error.message);
      }

      if (!res.ok) {
        if (attempt < MAX_RETRIES && isTransientError("", res.status)) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          console.warn(`[Gemini] HTTP ${res.status} (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms`);
          await sleep(delay);
          continue;
        }
        throw new Error(`Gemini API returned HTTP ${res.status}`);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      return { content: [{ type: "text", text }] };
    } catch (err) {
      if (attempt < MAX_RETRIES && isTransientError(err, 0)) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(`[Gemini] Network error (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${delay}ms:`, err.message);
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }
}

// ─── Chat Endpoint (Profile Extraction) ──────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { system, messages } = req.body;

  if (!system || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing required fields: system, messages" });
  }

  try {
    const result = await callGemini(system, messages);
    res.json(result);
  } catch (err) {
    console.error("[Gemini Chat] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── RAG Match Endpoint ──────────────────────────────────────────────────────
app.post("/api/match", async (req, res) => {
  const { profile, candidates } = req.body;

  if (!profile || !candidates) {
    return res.status(400).json({ error: "Missing required fields: profile, candidates" });
  }

  const systemPrompt = `You are an expert Indian government scheme matcher. Given a user profile and a list of candidate schemes, rank and score each scheme by relevance.

Return a JSON array of objects with:
- id: scheme ID
- score: 0-99 (relevance score)
- reason: one-line explanation of why this scheme matches (in the user's language if Hindi, else English)
- relevant: true/false

Only include schemes with score >= 30. Sort by score descending. Return at most 15 schemes.

User Profile:
${JSON.stringify(profile, null, 2)}`;

  const message = {
    role: "user",
    content: `Here are the candidate schemes to evaluate:\n\n${JSON.stringify(candidates.map(c => ({
      id: c.id, name: c.name, category: c.category, state: c.state, level: c.level,
      benefit: c.benefit, eligibility: c.eligibility, tags: c.tags
    })), null, 2)}`
  };

  try {
    const result = await callGemini(systemPrompt, [message], 3000);
    res.json(result);
  } catch (err) {
    console.error("[Gemini Match] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Explain Endpoint ────────────────────────────────────────────────────────
app.post("/api/explain", async (req, res) => {
  const { profile, scheme, language } = req.body;

  const lang = language === "hi" ? "Hindi" : "English";
  const systemPrompt = `You are HaqDaar, explaining a government scheme to an Indian citizen in simple ${lang}.

Explain:
1. Why they qualify for this scheme
2. How much benefit they'll get
3. Step-by-step how to apply
4. Documents they need to keep ready

Be warm, simple, and encouraging. No bureaucratic jargon. Return JSON: { "explanation": "your explanation text" }`;

  const message = {
    role: "user",
    content: `User Profile: ${JSON.stringify(profile)}\n\nScheme: ${JSON.stringify(scheme)}`
  };

  try {
    const result = await callGemini(systemPrompt, [message], 1500);
    res.json(result);
  } catch (err) {
    console.error("[Gemini Explain] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/health", (_, res) =>
  res.json({ status: "ok", model: GEMINI_MODEL, service: "HaqDaar v2 API" })
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ HaqDaar v2 API → http://localhost:${PORT}  [model: ${GEMINI_MODEL}]`);
});
