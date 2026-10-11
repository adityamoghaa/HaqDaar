// Chat Service — handles communication with backend chat API
// Supports both streaming (SSE) and non-streaming modes

const SYSTEM_PROMPT = `You are HaqDaar's AI assistant — a friendly, empathetic guide helping Indian citizens discover government schemes they qualify for.

Your job:
1. Have a warm, conversational chat in WHATEVER LANGUAGE the user writes in (Hindi, English, Hinglish, Tamil, etc.)
2. Silently extract a profile JSON from the conversation
3. Ask at most 2-3 follow-up questions to fill missing critical fields (state, income range, occupation, age, caste category)
4. ALWAYS be simple, warm, respectful — never bureaucratic

After each user message, respond with a JSON object like this (always valid JSON, no markdown):
{
  "message": "Your friendly conversational response to the user (in their language)",
  "profile": {
    "state": null or "UP" or "MH" or "TN" or "RJ" or "WB" or state abbreviation,
    "age": null or number,
    "gender": null or "male" or "female",
    "occupation": null or "farmer" or "student" or "daily_wage" or "self_employed" or "unemployed" or "retired",
    "income": null or annual income in rupees (estimate from description),
    "caste": null or "SC" or "ST" or "OBC" or "general" or "minority",
    "bpl": null or true or false,
    "widow": null or true or false,
    "area": null or "rural" or "urban",
    "raw_text": "cumulative summary of all facts user has shared"
  },
  "ready_to_match": true or false (true when you have enough info to find schemes — at least occupation + state OR income),
  "follow_up": null or "the next question to ask if more info needed"
}

Key rules:
- If user writes in Hindi, respond in Hindi
- If Hinglish, respond in Hinglish
- Be warm and say things like "मुझे आपकी मदद करने में खुशी होगी"
- When ready_to_match is true, say you're finding their schemes now
- Never ask more than 3 questions total across the conversation
- Income: if they say "80 hazaar" that's ₹80,000. "2 lakh" = ₹200,000
- Occupation hints: "kisan/farmer/kheti" = farmer, "padh raha/student/college" = student, "majduri/daily wage/construction" = daily_wage
- State hints: "UP/Lucknow/Kanpur" = UP, "Mumbai/Pune/Maharashtra" = MH, "Chennai/Tamil Nadu" = TN, "Jaipur/Rajasthan" = RJ
- Area: "gaon/village" = rural, "shehar/city" = urban`;

export { SYSTEM_PROMPT };

/**
 * Send a chat message (non-streaming).
 * Returns parsed { message, profile, ready_to_match, follow_up }
 */
export async function sendChat(messages) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server returned ${response.status}`);
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error);

  const rawText = data.content?.[0]?.text || "{}";
  return parseAIResponse(rawText);
}

/**
 * Stream a chat message via SSE.
 * Calls onChunk(partialText) as text arrives, onComplete(parsed) when done.
 */
export async function streamChat(messages, { onChunk, onComplete, onError }) {
  try {
    const response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Stream failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      // Parse SSE events
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullText += parsed.text;
              onChunk?.(fullText);
            }
          } catch {
            // Partial JSON, accumulate
            fullText += data;
            onChunk?.(fullText);
          }
        }
      }
    }

    const parsed = parseAIResponse(fullText);
    onComplete?.(parsed);
    return parsed;
  } catch (err) {
    onError?.(err);
    throw err;
  }
}

/**
 * Parse AI response — handles both clean JSON and JSON embedded in text
 */
function parseAIResponse(rawText) {
  try {
    return JSON.parse(rawText);
  } catch {
    // Try to extract JSON from text
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    return { message: rawText, profile: {}, ready_to_match: false };
  }
}

/**
 * Request scheme matching via RAG
 */
export async function matchSchemesRAG(profile, candidates) {
  const response = await fetch("/api/match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile, candidates }),
  });

  if (!response.ok) {
    throw new Error(`Match API returned ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.content?.[0]?.text;
  if (!rawText) throw new Error("Empty match response");

  return JSON.parse(rawText);
}

/**
 * Request AI explanation of a scheme for a profile
 */
export async function explainScheme(profile, scheme, language = "en") {
  const response = await fetch("/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile, scheme, language }),
  });

  if (!response.ok) {
    throw new Error(`Explain API returned ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.content?.[0]?.text || "{}";

  try {
    const parsed = JSON.parse(rawText);
    return parsed.explanation || rawText;
  } catch {
    return rawText;
  }
}
