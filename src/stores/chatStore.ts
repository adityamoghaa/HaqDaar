// Zustand Store — Chat-specific state
import { create } from "zustand";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatState {
  messages: ChatMessage[];
  conversationHistory: ChatMessage[];
  loading: boolean;
  streaming: boolean;
  streamingText: string;

  addMessage: (msg: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addToHistory: (msg: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  setStreamingText: (streamingText: string) => void;

  pendingMessage: string | null;
  setPendingMessage: (msg: string) => void;
  clearPendingMessage: () => void;

  initChat: (language: string, pendingMsg?: string | null) => void;
  resetChat: () => void;
}

const useChatStore = create<ChatState>((set) => ({
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

  pendingMessage: null,
  setPendingMessage: (msg) => set({ pendingMessage: msg }),
  clearPendingMessage: () => set({ pendingMessage: null }),

  initChat: (language, pendingMsg = null) => {
    const greeting =
      language === "hi"
        ? "नमस्ते! मैं HaqDaar हूँ 🙏\n\nआप अपनी स्थिति बताइए — जैसे कहाँ रहते हैं, क्या काम करते हैं, उम्र कितनी है, परिवार कैसा है। मैं आपको सरकारी योजनाएं खोजने में मदद करूंगा।"
        : "Hello! I'm HaqDaar 🙏\n\nTell me about yourself — where you live, what you do, your age, your family situation. I'll find government schemes you qualify for.";
    set({
      messages: [{ role: "assistant", content: greeting }],
      conversationHistory: [],
      pendingMessage: pendingMsg ?? null,
      loading: false,
      streaming: false,
      streamingText: "",
    });
  },

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
