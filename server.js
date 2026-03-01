// server.js — HaqDaar API Proxy
// Supports: Anthropic Claude, Google Gemini, Groq
// Set LLM_PROVIDER in .env to switch between them
// Run: node server.js

import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4173"] }));
app.use(express.json());

const PROVIDER = process.env.LLM_PROVIDER || "gemini"; // gemini | anthropic | groq

// ─── GEMINI ───────────────────────────────────────────────────────────────────
async function callGemini(systemPrompt, messages) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set in .env");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

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
      maxOutputTokens: 1000,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  // Return in Anthropic-compatible format so frontend doesn't need changes
  return { content: [{ type: "text", text }] };
}

// ─── ANTHROPIC ────────────────────────────────────────────────────────────────
async function callAnthropic(systemPrompt, messages, model) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set in .env");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model, max_tokens: 1000, system: systemPrompt, messages }),
  });

  return res.json();
}

// ─── GROQ ─────────────────────────────────────────────────────────────────────
async function callGroq(systemPrompt, messages) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set in .env");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const text = data.choices?.[0]?.message?.content || "{}";
  return { content: [{ type: "text", text }] };
}

// ─── MAIN ROUTE ───────────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { system, messages, model } = req.body;

  try {
    let result;
    if (PROVIDER === "gemini") {
      result = await callGemini(system, messages);
    } else if (PROVIDER === "anthropic") {
      result = await callAnthropic(system, messages, model);
    } else if (PROVIDER === "groq") {
      result = await callGroq(system, messages);
    } else {
      throw new Error(`Unknown LLM_PROVIDER: ${PROVIDER}`);
    }

    res.json(result);
  } catch (err) {
    console.error(`[${PROVIDER}] Error:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (_, res) =>
  res.json({ status: "ok", provider: PROVIDER, service: "HaqDaar API Proxy" })
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ HaqDaar proxy → http://localhost:${PORT}  [provider: ${PROVIDER}]`);
});
