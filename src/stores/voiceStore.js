// Zustand Store — Voice session state (Gemini Live API)
import { create } from "zustand";

const useVoiceStore = create((set) => ({
  // ─── Session State ──────────────────────────────────────
  sessionState: "idle", // idle | connecting | connected | error
  isListening: false,   // mic is active
  isSpeaking: false,    // AI is outputting audio
  isThinking: false,    // AI is processing

  // ─── Transcription ──────────────────────────────────────
  inputTranscript: "",      // what user is saying (interim)
  outputTranscript: "",     // what AI is saying
  conversationLog: [],      // full transcript history [{role, text}]

  // ─── Setters ────────────────────────────────────────────
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

  // ─── Reset ──────────────────────────────────────────────
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
