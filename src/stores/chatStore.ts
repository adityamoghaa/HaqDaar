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

function getInitialMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = sessionStorage.getItem("haqdaar_chat_messages");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* empty */
  }
  return [];
}

function saveMessagesToStorage(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("haqdaar_chat_messages", JSON.stringify(messages));
  } catch {
    /* empty */
  }
}

const initialMsgs = getInitialMessages();

const useChatStore = create<ChatState>((set) => ({
  messages: initialMsgs,
  conversationHistory: initialMsgs,
  loading: false,
  streaming: false,
  streamingText: "",

  addMessage: (msg) =>
    set((state) => {
      const updatedMessages = [...state.messages, msg];
      const updatedHistory = [...state.conversationHistory, msg];
      saveMessagesToStorage(updatedMessages);
      return {
        messages: updatedMessages,
        conversationHistory: updatedHistory,
      };
    }),

  setMessages: (messages) => {
    saveMessagesToStorage(messages);
    set({ messages, conversationHistory: messages });
  },

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
    set((state) => {
      // Do NOT overwrite existing active conversation from voice or previous turns
      if (state.messages.length > 0) {
        return {
          pendingMessage: pendingMsg ?? state.pendingMessage,
          loading: false,
        };
      }

      const greeting =
        language === "hi"
          ? "नमस्ते! मैं HaqDaar हूँ 🙏\n\nआप अपनी स्थिति बताइए — जैसे कहाँ रहते हैं, क्या काम करते हैं, उम्र कितनी है, परिवार कैसा है। मैं आपको सरकारी योजनाएं खोजने में मदद करूंगा।"
          : "Hello! I'm HaqDaar 🙏\n\nTell me about yourself — where you live, what you do, your age, your family situation. I'll find government schemes you qualify for.";

      const initial = [{ role: "assistant" as const, content: greeting }];
      saveMessagesToStorage(initial);

      return {
        messages: initial,
        conversationHistory: initial,
        pendingMessage: pendingMsg ?? null,
        loading: false,
        streaming: false,
        streamingText: "",
      };
    });
  },

  resetChat: () => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("haqdaar_chat_messages");
      } catch {}
    }
    set({
      messages: [],
      conversationHistory: [],
      loading: false,
      streaming: false,
      streamingText: "",
      pendingMessage: null,
    });
  },
}));

export default useChatStore;
