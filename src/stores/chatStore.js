// Zustand Store — Chat-specific state
import { create } from "zustand";

const useChatStore = create((set, get) => ({
  // ─── Messages ───────────────────────────────────────────
  messages: [],
  conversationHistory: [],
  loading: false,
  streaming: false,
  streamingText: "",

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
  setMessages: (messages) => set({ messages }),
  addToHistory: (msg) =>
    set((state) => ({
      conversationHistory: [...state.conversationHistory, msg],
    })),
  setLoading: (loading) => set({ loading }),
  setStreaming: (streaming) => set({ streaming }),
  setStreamingText: (streamingText) => set({ streamingText }),

  // ─── Pending message (from sample prompts) ──────────────
  pendingMessage: null,
  setPendingMessage: (msg) => set({ pendingMessage: msg }),
  clearPendingMessage: () => set({ pendingMessage: null }),

  // ─── Initialize chat with greeting ──────────────────────
  initChat: (language, pendingMsg = null) => {
    const greeting =
      language === "hi"
        ? "नमस्ते! मैं HaqDaar हूँ 🙏\n\nआप अपनी स्थिति बताइए — जैसे कहाँ रहते हैं, क्या काम करते हैं, उम्र कितनी है, परिवार कैसा है। मैं आपको सरकारी योजनाएं खोजने में मदद करूंगा।"
        : "Hello! I'm HaqDaar 🙏\n\nTell me about yourself — where you live, what you do, your age, your family situation. I'll find government schemes you qualify for.";
    set({
      messages: [{ role: "assistant", content: greeting }],
      conversationHistory: [],
      pendingMessage: pendingMsg,
      loading: false,
      streaming: false,
      streamingText: "",
    });
  },

  // ─── Reset ──────────────────────────────────────────────
  resetChat: () =>
    set({
      messages: [],
      conversationHistory: [],
      loading: false,
      streaming: false,
      streamingText: "",
      pendingMessage: null,
    }),
}));

export default useChatStore;
