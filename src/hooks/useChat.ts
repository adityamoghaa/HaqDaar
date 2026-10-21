// Chat hook — handles conversation with Gemini and profile extraction
import { useCallback } from "react";
import useAppStore, { MatchedScheme } from "@/stores/appStore";
import useChatStore from "@/stores/chatStore";
import { schemes, matchSchemesRuleBased } from "@/lib/schemeSearch";
import { useRouter } from "next/navigation";

export const CHAT_SYSTEM_PROMPT = `You are HaqDaar's AI assistant — a friendly, empathetic guide helping Indian citizens discover government schemes they qualify for.

Your job:
1. Have a warm, conversational chat in WHATEVER LANGUAGE the user writes in (Hindi, English, Hinglish, Tamil, Bengali, Marathi, etc.)
2. Silently extract a profile JSON from the conversation
3. Ask at most 2-3 follow-up questions to fill missing critical fields (state, income range, occupation, age, caste category)
4. ALWAYS be simple, warm, respectful — never bureaucratic

After each user message, respond with a JSON object like this (always valid JSON, no markdown outside):
{
  "message": "Your friendly conversational response to the user (in their language)",
  "profile": {
    "state": null,
    "age": null,
    "gender": null,
    "occupation": null,
    "income": null,
    "caste": null,
    "bpl": null,
    "widow": null,
    "area": null,
    "raw_text": "cumulative summary of all facts user has shared"
  },
  "ready_to_match": true or false,
  "follow_up": null
}

Rules:
- If user writes in Hindi, respond in Hindi. If Hinglish, respond in Hinglish.
- Income conversion: "80 hazaar" = 80000. "2 lakh" = 200000.
- State conversion: UP/Uttar Pradesh = UP, Maharashtra/Mumbai = MH, Rajasthan = RJ, Tamil Nadu = TN, etc.
- When ready_to_match is true, let the user know you've matched their profile to eligible schemes.`;

export default function useChat() {
  const router = useRouter();

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const chatState = useChatStore.getState();
      const appState = useAppStore.getState();
      if (chatState.loading) return;

      const userMsg = { role: "user" as const, content: text };
      chatState.addMessage(userMsg);
      chatState.setLoading(true);

      // Gather full chronological message history from the store
      const messagesToSend = chatState.messages
        .filter((m) => m.content && m.content.trim())
        .map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        }));
      messagesToSend.push(userMsg);

      // Build context of already extracted profile facts
      const currentProfile = appState.profile || {};
      const knownEntries = Object.entries(currentProfile).filter(
        ([k, v]) => v !== null && v !== undefined && v !== "" && k !== "raw_text"
      );
      const knownProfileText =
        knownEntries.length > 0
          ? knownEntries.map(([k, v]) => `${k}: ${v}`).join(", ")
          : "None yet";

      const dynamicSystemPrompt = `${CHAT_SYSTEM_PROMPT}

CURRENT KNOWN CITIZEN PROFILE FACTS:
${knownProfileText}

MANDATORY RULES:
1. The facts listed above have ALREADY been shared by the citizen in this session (voice or chat).
2. NEVER ask the citizen again for any fact that is already known!
3. If the citizen provides an update or correction (e.g. "Haryana se hu na ki Rajasthan"), update that specific field immediately and acknowledge the correction warmly.
4. In your returned "profile" JSON, RETAIN all existing known facts and merge them with any updates.
5. If the citizen asks if you remember what they told you, confirm their details warmly and accurately.`;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system: dynamicSystemPrompt,
            messages: messagesToSend.slice(-10),
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.content?.[0]?.text || "{}";

        let parsed: {
          message?: string;
          profile?: Record<string, unknown>;
          ready_to_match?: boolean;
        };

        try {
          parsed = JSON.parse(rawText);
        } catch {
          const match = rawText.match(/\{[\s\S]*\}/);
          parsed = match
            ? JSON.parse(match[0])
            : { message: rawText, profile: {}, ready_to_match: false };
        }

        const assistantMsg = {
          role: "assistant" as const,
          content: parsed.message || "I'm checking your eligibility...",
        };

        chatState.addMessage(assistantMsg);
        chatState.addToHistory({ role: "assistant", content: rawText });

        if (parsed.profile) {
          appState.mergeProfile(parsed.profile);
        }

        const currentProfile = useAppStore.getState().profile;

        if (parsed.ready_to_match) {
          // Perform scheme matching
          setTimeout(async () => {
            try {
              const matchRes = await fetch("/api/match", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  profile: currentProfile,
                  candidates: schemes.slice(0, 35),
                }),
              });

              if (matchRes.ok) {
                const matchData = await matchRes.json();
                if (Array.isArray(matchData.matches) && matchData.matches.length > 0) {
                  const enriched: MatchedScheme[] = matchData.matches
                    .map((m: { id: string; score: number; reason?: string }) => {
                      const base = schemes.find((s) => s.id === m.id);
                      if (!base) return null;
                      return {
                        ...base,
                        score: m.score,
                        aiReason: m.reason,
                      } as unknown as MatchedScheme;
                    })
                    .filter(Boolean) as MatchedScheme[];

                  if (enriched.length > 0) {
                    appState.setMatchedSchemes(enriched);
                    router.push("/results");
                    return;
                  }
                }
              }
            } catch (matchErr) {
              console.warn("API match failed, fallback to rule-based:", matchErr);
            }

            // Fallback match
            const fallback = matchSchemesRuleBased(currentProfile);
            appState.setMatchedSchemes(fallback as unknown as MatchedScheme[]);
            router.push("/results");
          }, 500);
        }
      } catch (err) {
        console.error("Chat error:", err);
        const lang = useAppStore.getState().language;
        const errMsg =
          lang === "hi"
            ? "माफ़ करें, उत्तर प्राप्त करने में समस्या हुई। कृपया पुनः प्रयास करें।"
            : "Sorry, unable to process your request. Please try again.";
        chatState.addMessage({ role: "assistant", content: errMsg });
      } finally {
        chatState.setLoading(false);
      }
    },
    [router]
  );

  return { sendMessage };
}
