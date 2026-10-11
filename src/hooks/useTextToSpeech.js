// Custom hook for Text-to-Speech (Browser TTS)
import { useCallback } from "react";

export default function useTextToSpeech(language = "hi") {
  const speak = useCallback(
    (text) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) return;
      window.speechSynthesis.cancel();

      const utt = new SpeechSynthesisUtterance(text);
      const langMap = {
        hi: "hi-IN", en: "en-IN", ta: "ta-IN", te: "te-IN",
        bn: "bn-IN", mr: "mr-IN", gu: "gu-IN",
      };
      utt.lang = langMap[language] || "hi-IN";
      utt.rate = 0.9;
      utt.pitch = 1;
      window.speechSynthesis.speak(utt);
    },
    [language]
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
}
