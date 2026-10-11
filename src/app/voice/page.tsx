"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mic,
  Square,
  MessageSquare,
  Sparkles,
  Volume2,
  AlertCircle,
  ArrowRight,
  Shield,
  RotateCcw,
  Send,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import useVoiceStore from "@/stores/voiceStore";
import useAppStore from "@/stores/appStore";
import useChatStore from "@/stores/chatStore";
import useVoiceSession from "@/hooks/useVoiceSession";
import ProfileBadges from "@/components/shared/ProfileBadges";
import AudioVisualizer from "@/components/ui/AudioVisualizer";
import { GlowEffect } from "@/components/ui/GlowEffect";
import { TextShimmer } from "@/components/ui/TextShimmer";
import ToolbarDynamic from "@/components/ui/ToolbarDynamic";

export default function VoicePage() {
  const router = useRouter();
  const { language, profile, matchedSchemes } = useAppStore();
  const { messages: chatMessages } = useChatStore();
  const {
    sessionState,
    isListening,
    isSpeaking,
    isThinking,
    inputTranscript,
    outputTranscript,
    resetVoice,
  } = useVoiceStore();

  const { startSession, stopSession, toggleRecording, recordingDuration, speakText } = useVoiceSession();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fallbackText, setFallbackText] = useState("");

  const handleToggle = async () => {
    setErrorMsg(null);
    try {
      toggleRecording();
    } catch (err: any) {
      console.error("Voice recording error:", err);
      setErrorMsg(err.message || "Microphone access error");
    }
  };

  const handleTextFallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fallbackText.trim() || isThinking) return;

    const text = fallbackText.trim();
    setFallbackText("");

    const voiceStore = useVoiceStore.getState();
    voiceStore.setInputTranscript(text);
    voiceStore.setIsThinking(true);

    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          language,
        }),
      });

      if (!res.ok) throw new Error("Processing failed");
      const data = await res.json();
      const reply = data.message || "";
      voiceStore.setOutputTranscript(reply);
      if (data.profile) {
        useAppStore.getState().mergeProfile(data.profile);
      }

      if (data.ready_to_match) {
        const { matchSchemesRuleBased } = await import("@/lib/schemeSearch");
        const currentProfile = useAppStore.getState().profile;
        const matches = matchSchemesRuleBased(currentProfile);
        useAppStore.getState().setMatchedSchemes(matches as any);
      }

      voiceStore.setIsThinking(false);

      if (reply) {
        speakText(reply, data.audioBase64);
      }
    } catch (err) {
      voiceStore.setIsThinking(false);
      setErrorMsg("Could not process request. Please try again.");
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col selection:bg-orange-500 selection:text-white pb-24 pt-4">

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col items-center justify-between">
        {/* Top Status Header */}
        <div className="text-center space-y-2 mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isListening
                  ? "bg-red-500 animate-ping"
                  : isSpeaking
                  ? "bg-emerald-400 animate-pulse"
                  : isThinking
                  ? "bg-amber-400 animate-pulse"
                  : "bg-orange-400"
              }`}
            />
            <span>
              {isListening ? (
                <span className="text-red-400 font-bold">
                  Recording Audio ({formatTimer(recordingDuration)}) — Tap to Finish
                </span>
              ) : isThinking ? (
                <TextShimmer>Gemini 2.5 Flash is analyzing your voice...</TextShimmer>
              ) : isSpeaking ? (
                <span className="text-emerald-400 font-medium">HaqDaar is speaking aloud...</span>
              ) : (
                <span>One-Way Push to Talk • Tap to Speak</span>
              )}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {language === "hi" ? "आवाज़ में बात करें" : "Speak In Your Mother Tongue"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
            Tap the button, tell us your situation in Hindi, English, or your regional language, and tap done when finished.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 max-w-md">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ─── Main Voice Orb with GlowEffect ─────────────────────── */}
        <div className="my-6 relative flex flex-col items-center justify-center">
          <GlowEffect
            active={isListening || isThinking}
            glowColor={isListening ? "saffron" : "rainbow"}
            blur={28}
          >
            <button
              onClick={handleToggle}
              disabled={isThinking}
              className={`w-40 h-40 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl relative cursor-pointer ${
                isListening
                  ? "bg-gradient-to-tr from-red-600 to-orange-600 scale-105 shadow-red-500/50"
                  : isThinking
                  ? "bg-gradient-to-tr from-amber-600 to-indigo-600 animate-pulse"
                  : isSpeaking
                  ? "bg-gradient-to-tr from-emerald-600 to-teal-600 shadow-emerald-500/40"
                  : "bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 hover:scale-105 shadow-orange-500/40"
              }`}
            >
              {isListening ? (
                <>
                  <Square className="w-9 h-9 text-white mb-2 fill-white animate-pulse" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Tap When Done
                  </span>
                  <span className="text-[10px] text-white/80 font-mono mt-0.5">
                    {formatTimer(recordingDuration)}
                  </span>
                </>
              ) : isThinking ? (
                <>
                  <Sparkles className="w-9 h-9 text-white mb-2 animate-pulse" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Analyzing...
                  </span>
                </>
              ) : isSpeaking ? (
                <>
                  <Volume2 className="w-9 h-9 text-white mb-2 animate-bounce" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Speaking
                  </span>
                </>
              ) : (
                <>
                  <Mic className="w-10 h-10 text-white mb-2" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Tap to Speak
                  </span>
                  <span className="text-[10px] text-white/80 mt-0.5 font-medium">
                    {language === "hi" ? "बोलना शुरू करें" : "Hindi / English"}
                  </span>
                </>
              )}
            </button>
          </GlowEffect>

          {/* Audio Visualizer Wave */}
          <div className="mt-8">
            <AudioVisualizer
              isActive={isListening || isSpeaking}
              barCount={18}
              className="h-8"
            />
          </div>
        </div>

        {/* ─── Transcripts Card ────────────────────────────────────── */}
        <div className="w-full max-w-xl space-y-3 mb-6">
          {/* Preserved Chat Context Indicator */}
          {!inputTranscript && chatMessages.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-400" />
                <span className="text-gray-300">
                  {language === "hi"
                    ? `पिछली बातचीत सुरक्षित है (${chatMessages.length} संदेश)`
                    : `Active chat context connected (${chatMessages.length} messages)`}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                Synced
              </span>
            </div>
          )}

          {/* Eligible Schemes Ready Banner */}
          {matchedSchemes.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/10 border border-emerald-500/30 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🎯</span>
                <div>
                  <p className="text-xs font-bold text-white">
                    {language === "hi"
                      ? `${matchedSchemes.length} योजनाएं आपके लिए पाई गईं`
                      : `${matchedSchemes.length} Eligible Schemes Found`}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {language === "hi"
                      ? "आप बात जारी रख सकते हैं या परिणाम देख सकते हैं"
                      : "Continue speaking or review your matches"}
                  </p>
                </div>
              </div>
              <Link
                href="/results"
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Results</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* User Transcript */}
          {inputTranscript && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block mb-1">
                You said (आपकी बात):
              </span>
              <p className="text-gray-100 leading-relaxed font-medium">{inputTranscript}</p>
            </div>
          )}

          {/* AI Response */}
          {outputTranscript && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/5 border border-orange-500/20 text-xs">
              <span className="text-[10px] text-orange-400 uppercase tracking-wider font-bold block mb-1 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                HaqDaar Voice Guide:
              </span>
              <p className="text-orange-100 leading-relaxed">{outputTranscript}</p>
            </div>
          )}

          {/* Extracted Profile Preview */}
          {Object.keys(profile).length > 0 && (
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Extracted Profile
                </span>
                <Link
                  href="/results"
                  className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                >
                  <span>See Matching Schemes</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <ProfileBadges profile={profile} />
            </div>
          )}
        </div>

        {/* ─── Type Instead Fallback ───────────────────────────────── */}
        <div className="w-full max-w-xl">
          <form onSubmit={handleTextFallbackSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={fallbackText}
              onChange={(e) => setFallbackText(e.target.value)}
              placeholder="Or type here if microphone is not available..."
              className="flex-1 bg-gray-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!fallbackText.trim() || isThinking}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>

      {/* Motion Primitives Dynamic Toolbar */}
      <ToolbarDynamic />

      <Footer />
    </div>
  );
}
