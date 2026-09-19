// Custom hook for Web Speech API (Speech-to-Text)
import { useState, useRef, useEffect, useCallback } from "react";

export default function useSpeechRecognition(language = "hi") {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    setSupported(true);
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;

    const langMap = {
      hi: "hi-IN", en: "en-IN", ta: "ta-IN", te: "te-IN",
      bn: "bn-IN", mr: "mr-IN", gu: "gu-IN", kn: "kn-IN",
      ml: "ml-IN", pa: "pa-IN", or: "or-IN",
    };
    recognition.lang = langMap[language] || "hi-IN";

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;

    return () => {
      try { recognition.abort(); } catch {}
    };
  }, [language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !listening) {
      setTranscript("");
      setListening(true);
      recognitionRef.current.start();
    }
  }, [listening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  }, []);

  return { listening, transcript, supported, startListening, stopListening };
}
