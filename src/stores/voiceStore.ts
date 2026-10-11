// Zustand Store — Voice session state (Gemini Live API)
import { create } from "zustand";

export type SessionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface LogEntry {
  role: "user" | "assistant" | "system";
  text: string;
}

interface VoiceState {
  sessionState: SessionState;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  inputTranscript: string;
  outputTranscript: string;
  conversationLog: LogEntry[];

  setSessionState: (state: SessionState) => void;
  setIsListening: (val: boolean) => void;
  setIsSpeaking: (val: boolean) => void;
  setIsThinking: (val: boolean) => void;
  setInputTranscript: (text: string) => void;
  setOutputTranscript: (text: string) => void;
  addToLog: (entry: LogEntry) => void;
  resetVoice: () => void;
}

const useVoiceStore = create<VoiceState>((set) => ({
  sessionState: "idle",
  isListening: false,
  isSpeaking: false,
  isThinking: false,
  inputTranscript: "",
  outputTranscript: "",
  conversationLog: [],

  setSessionState: (sessionState) => set({ sessionState }),
  setIsListening: (isListening) => set({ isListening }),
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
  setIsThinking: (isThinking) => set({ isThinking }),
  setInputTranscript: (inputTranscript) => set({ inputTranscript }),
  setOutputTranscript: (outputTranscript) => set({ outputTranscript }),
  addToLog: (entry) =>
    set((state) => ({
      conversationLog: [...state.conversationLog, entry],
    })),
  resetVoice: () =>
    set({
      sessionState: "idle",
      isListening: false,
      isSpeaking: false,
      isThinking: false,
      inputTranscript: "",
      outputTranscript: "",
      conversationLog: [],
    }),
}));

export default useVoiceStore;
