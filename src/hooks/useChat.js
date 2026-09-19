// Chat hook — handles conversation with Gemini 3.5 Flash
import { useCallback } from "react";
import useAppStore from "../stores/appStore";
import { matchSchemes, getCandidatesForRAG } from "../data/schemeSearch";

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

export default function useChat() {
  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    // Read fresh state to avoid stale closures
    const state = useAppStore.getState();
    if (state.loading) return;

    const { messages, conversationHistory, language } = state;
    const {
      setMessages, addToHistory, setLoading, mergeProfile,
      setMatchedSchemes, setPhase,
    } = state;

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    // Add user message to conversation history store
    addToHistory({ role: "user", content: text });
    const newHistory = [...conversationHistory, { role: "user", content: text }];

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: newHistory,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const rawText = data.content?.[0]?.text || "{}";

      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const match = rawText.match(/\{[\s\S]*\}/);
        parsed = match
          ? JSON.parse(match[0])
          : { message: rawText, profile: {}, ready_to_match: false };
      }

      const assistantMsg = {
        role: "assistant",
        content: parsed.message || "...",
      };
      setMessages([...newMessages, assistantMsg]);
      addToHistory({ role: "assistant", content: rawText });

      // Merge profile
      if (parsed.profile) {
        mergeProfile(parsed.profile);
      }

      // Get updated profile from store (fresh after merge)
      const updatedProfile = useAppStore.getState().profile;

      // Auto-match if ready
      if (parsed.ready_to_match) {
        setTimeout(async () => {
          try {
            // Try RAG matching via Gemini
            const candidates = getCandidatesForRAG(updatedProfile);
            const ragResponse = await fetch(
              "http://localhost:3001/api/match",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  profile: updatedProfile,
                  candidates,
                }),
              }
            );

            if (!ragResponse.ok) throw new Error(`Match API returned ${ragResponse.status}`);

            const ragData = await ragResponse.json();
            const ragText = ragData.content?.[0]?.text;

            if (ragText) {
              let ragResults;
              try {
                ragResults = JSON.parse(ragText);
              } catch (parseErr) {
                console.warn("RAG response not valid JSON:", parseErr.message);
                throw parseErr;
              }

              if (Array.isArray(ragResults) && ragResults.length > 0) {
                // Merge RAG scores with full scheme data
                const enriched = ragResults
                  .filter((r) => r.relevant !== false && r.score >= 30)
                  .map((r) => {
                    const fullScheme = candidates.find(
                      (c) => c.id === r.id
                    );
                    return fullScheme
                      ? { ...fullScheme, score: r.score, aiReason: r.reason }
                      : null;
                  })
                  .filter(Boolean);

                if (enriched.length > 0) {
                  setMatchedSchemes(enriched);
                  setPhase("results");
                  return;
                }
              }
            }
          } catch (ragErr) {
            console.warn("RAG matching failed, using client-side:", ragErr.message || ragErr);
          }

          // Fallback: client-side matching
          const matched = matchSchemes(updatedProfile);
          setMatchedSchemes(matched);
          setPhase("results");
        }, 600);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const lang = useAppStore.getState().language;
      const errMsg =
        lang === "hi"
          ? "माफ़ करें, कुछ गड़बड़ हुई। कृपया फिर से कोशिश करें।"
          : "Sorry, something went wrong. Please try again.";
      setMessages([
        ...newMessages,
        { role: "assistant", content: errMsg },
      ]);
    }

    setLoading(false);
  }, []); // No deps needed — we use getState() for fresh values

  return { sendMessage };
}
