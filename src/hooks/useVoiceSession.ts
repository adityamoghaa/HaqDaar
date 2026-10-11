// useVoiceSession — Robust Push-to-Talk Multimodal Voice Engine
// Records audio using MediaRecorder, sends to Gemini 2.5 Flash, speaks response aloud
import { useRef, useState, useCallback, useEffect } from "react";
import useVoiceStore from "@/stores/voiceStore";
import useAppStore from "@/stores/appStore";
import useChatStore from "@/stores/chatStore";
import { schemes, matchSchemesRuleBased } from "@/lib/schemeSearch";
import { useRouter } from "next/navigation";

export default function useVoiceSession() {
  const router = useRouter();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const conversationHistoryRef = useRef<Array<{ role: string; content: string }>>([]);

  const stopAudioTracks = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setRecordingDuration(0);
  };

  const playPCMBase64 = useCallback((base64PCM: string, onEnd?: () => void) => {
    try {
      if (typeof window === "undefined") return false;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return false;

      const audioCtx = new AudioCtx({ sampleRate: 24000 });
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const binaryString = atob(base64PCM);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768;
      }

      const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      useVoiceStore.getState().setIsSpeaking(true);
      useVoiceStore.getState().setIsListening(false);

      source.onended = () => {
        useVoiceStore.getState().setIsSpeaking(false);
        audioCtx.close().catch(() => {});
        onEnd?.();
      };

      source.start();
      return true;
    } catch (e) {
      console.warn("[Voice] Web Audio PCM playback failed:", e);
      return false;
    }
  }, []);

  const speakText = useCallback(
    async (text: string, audioBase64?: string, onEnd?: () => void) => {
      // 1. If neural audio was provided by Gemini TTS, play directly via Web Audio API!
      if (audioBase64) {
        const played = playPCMBase64(audioBase64, onEnd);
        if (played) return;
      }

      // 2. Fetch neural TTS audio from /api/tts
      if (text && text.trim()) {
        try {
          const ttsRes = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
          if (ttsRes.ok) {
            const ttsData = await ttsRes.json();
            if (ttsData.audioBase64) {
              const played = playPCMBase64(ttsData.audioBase64, onEnd);
              if (played) return;
            }
          }
        } catch (ttsFetchErr) {
          console.warn("[Voice] /api/tts fetch failed, trying speech synthesis fallback:", ttsFetchErr);
        }
      }

      // 3. Fallback: Only use window.speechSynthesis if REAL (non-dummy) voices exist on Linux!
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const voices = window.speechSynthesis.getVoices();
        const hasRealVoice = voices.some(
          (v) => !v.name.toLowerCase().includes("dummy") && !v.voiceURI.toLowerCase().includes("dummy")
        );

        // Do NOT call speechSynthesis if Linux speech-dispatcher is using the dummy fallback module!
        if (hasRealVoice && voices.length > 0) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          const language = useAppStore.getState().language;
          const langMap: Record<string, string> = {
            hi: "hi-IN",
            en: "en-IN",
            ta: "ta-IN",
            te: "te-IN",
            bn: "bn-IN",
            mr: "mr-IN",
          };
          utterance.lang = langMap[language] || "hi-IN";
          utterance.rate = 0.95;

          utterance.onstart = () => {
            useVoiceStore.getState().setIsSpeaking(true);
            useVoiceStore.getState().setIsListening(false);
          };

          utterance.onend = () => {
            useVoiceStore.getState().setIsSpeaking(false);
            onEnd?.();
          };

          utterance.onerror = () => {
            useVoiceStore.getState().setIsSpeaking(false);
            onEnd?.();
          };

          window.speechSynthesis.speak(utterance);
          return;
        }
      }

      // If no valid audio output is available, finish gracefully without playing dummy audio
      useVoiceStore.getState().setIsSpeaking(false);
      onEnd?.();
    },
    [playPCMBase64]
  );

  const sendAudioToGemini = useCallback(
    async (audioBlob: Blob) => {
      const voiceStore = useVoiceStore.getState();
      const appStore = useAppStore.getState();

      voiceStore.setIsListening(false);
      voiceStore.setIsThinking(true);

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string)?.split(",")[1];
          if (!base64Data) throw new Error("Audio conversion failed");

          // Combine chat history with voice turns so Gemini has full context!
          const chatMessages = useChatStore.getState().messages;
          const contextHistory = [
            ...chatMessages
              .filter((m) => m.content && m.content.trim())
              .map((m) => ({
                role: m.role === "assistant" ? "assistant" : "user",
                content: m.content,
              })),
            ...conversationHistoryRef.current,
          ];

          const response = await fetch("/api/voice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audioBase64: base64Data,
              mimeType: audioBlob.type || "audio/webm",
              language: appStore.language,
              history: contextHistory,
            }),
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.warn(`[Voice API] Status ${response.status}:`, err);
            voiceStore.setIsThinking(false);
            const fallbackMsg =
              appStore.language === "hi"
                ? "सर्वर अभी व्यस्त है। कृपया एक पल बाद फिर बोलें।"
                : "Voice service is momentarily busy. Please tap to speak again.";
            voiceStore.setOutputTranscript(fallbackMsg);
            speakText(fallbackMsg);
            return;
          }

          const result = await response.json();
          const transcript = result.transcript || "";
          const reply = result.message || "";

          if (transcript) {
            voiceStore.setInputTranscript(transcript);
            voiceStore.addToLog({ role: "user", text: transcript });
            conversationHistoryRef.current.push({ role: "user", content: transcript });
            useChatStore.getState().addMessage({ role: "user", content: transcript });
          }

          if (reply) {
            voiceStore.setOutputTranscript(reply);
            voiceStore.addToLog({ role: "assistant", text: reply });
            conversationHistoryRef.current.push({ role: "assistant", content: reply });
            useChatStore.getState().addMessage({ role: "assistant", content: reply });
          }

          if (result.profile && Object.keys(result.profile).length > 0) {
            appStore.mergeProfile(result.profile);
          }

          if (result.ready_to_match) {
            const currentProfile = useAppStore.getState().profile;
            const matches = matchSchemesRuleBased(currentProfile);
            appStore.setMatchedSchemes(matches as any);
          }

          voiceStore.setIsThinking(false);

          // Speak response using neural audio
          if (reply) {
            speakText(reply, result.audioBase64);
          }
        } catch (err: any) {
          console.error("[Voice] Processing error:", err);
          voiceStore.setIsThinking(false);
          const fallbackMsg =
            appStore.language === "hi"
              ? "माफ़ करें, आपकी आवाज़ स्पष्ट नहीं आई। कृपया फिर से बोलें।"
              : "Could not process audio clearly. Please tap to speak again.";
          voiceStore.setOutputTranscript(fallbackMsg);
          speakText(fallbackMsg);
        }
      };
    },
    [speakText]
  );

  const startRecording = useCallback(async () => {
    stopAudioTracks();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const voiceStore = useVoiceStore.getState();
    voiceStore.setIsSpeaking(false);
    voiceStore.setIsThinking(false);
    voiceStore.setSessionState("connecting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      // Audio analysis for volume levels
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyzerRef.current = analyser;
      }

      // MediaRecorder configuration
      const options = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? { mimeType: "audio/webm;codecs=opus" }
        : MediaRecorder.isTypeSupported("audio/webm")
        ? { mimeType: "audio/webm" }
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? { mimeType: "audio/mp4" }
        : {};

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        stopAudioTracks();
        if (audioBlob.size > 1000) {
          sendAudioToGemini(audioBlob);
        } else {
          voiceStore.setIsListening(false);
          voiceStore.setSessionState("connected");
        }
      };

      mediaRecorder.start(250); // collect chunks every 250ms
      voiceStore.setIsListening(true);
      voiceStore.setSessionState("connected");

      // Start timer
      setRecordingDuration(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("[Voice] Mic access error:", err);
      stopAudioTracks();
      voiceStore.setSessionState("error");
      throw new Error(
        err.name === "NotAllowedError"
          ? "Microphone permission was denied. Please allow microphone access in your browser settings."
          : "Could not access microphone."
      );
    }
  }, [sendAudioToGemini]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      stopAudioTracks();
      useVoiceStore.getState().setIsListening(false);
    }
  }, []);

  const toggleRecording = useCallback(() => {
    const isListening = useVoiceStore.getState().isListening;
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [startRecording, stopRecording]);

  useEffect(() => {
    return () => {
      stopAudioTracks();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    startSession: startRecording,
    stopSession: stopRecording,
    toggleRecording,
    recordingDuration,
    isListening: useVoiceStore((s) => s.isListening),
    speakText,
  };
}
