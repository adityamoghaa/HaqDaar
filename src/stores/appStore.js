// Zustand Store — HaqDaar v2 Application State
import { create } from "zustand";

const useAppStore = create((set, get) => ({
  // ─── Phase ──────────────────────────────────────────────
  phase: "landing", // landing | chat | results
  setPhase: (phase) => set({ phase }),

  // ─── Language ───────────────────────────────────────────
  language: "hi",
  setLanguage: (language) => set({ language }),

  // ─── Profile (extracted from conversation) ─────────────
  profile: {},
  setProfile: (profile) => set({ profile }),
  mergeProfile: (partial) =>
    set((state) => {
      const updated = { ...state.profile };
      Object.entries(partial).forEach(([k, v]) => {
        if (v !== null && v !== undefined) updated[k] = v;
      });
      return { profile: updated };
    }),

  // ─── Chat ───────────────────────────────────────────────
  messages: [],
  conversationHistory: [],
  loading: false,
  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
  setMessages: (messages) => set({ messages }),
  addToHistory: (msg) =>
    set((state) => ({
      conversationHistory: [...state.conversationHistory, msg],
    })),
  setLoading: (loading) => set({ loading }),

  // ─── Results ────────────────────────────────────────────
  matchedSchemes: [],
  selectedScheme: null,
  activeFilter: "all",
  setMatchedSchemes: (matchedSchemes) => set({ matchedSchemes }),
  setSelectedScheme: (selectedScheme) => set({ selectedScheme }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),

  // ─── Reset ──────────────────────────────────────────────
  resetApp: () =>
    set({
      messages: [],
      conversationHistory: [],
      profile: {},
      matchedSchemes: [],
      selectedScheme: null,
      phase: "landing",
      loading: false,
      activeFilter: "all",
      pendingMessage: null,
    }),

  // ─── Start Chat ─────────────────────────────────────────
  pendingMessage: null,
  setPendingMessage: (msg) => set({ pendingMessage: msg }),
  clearPendingMessage: () => set({ pendingMessage: null }),

  startChat: (lang, pendingMsg = null) => {
    const greeting =
      lang === "hi"
        ? "नमस्ते! मैं HaqDaar हूँ 🙏\n\nआप अपनी स्थिति बताइए — जैसे कहाँ रहते हैं, क्या काम करते हैं, उम्र कितनी है, परिवार कैसा है। मैं आपको सरकारी योजनाएं खोजने में मदद करूंगा।"
        : "Hello! I'm HaqDaar 🙏\n\nTell me about yourself — where you live, what you do, your age, your family situation. I'll find government schemes you qualify for.";
    set({
      language: lang,
      phase: "chat",
      messages: [{ role: "assistant", content: greeting }],
      pendingMessage: pendingMsg,
    });
  },
}));

export default useAppStore;
