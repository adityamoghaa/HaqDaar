"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  ArrowRight,
  User,
  Bot,
  RotateCcw,
  Info,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import ProfileBadges from "@/components/shared/ProfileBadges";
import useAppStore from "@/stores/appStore";
import useChatStore from "@/stores/chatStore";
import useChat from "@/hooks/useChat";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import GlowEffect from "@/components/ui/GlowEffect";
import ToolbarDynamic from "@/components/ui/ToolbarDynamic";

const quickSuggestions = [
  "Main UP ka kisan hoon, ₹80,000 saal ki kamai hai",
  "College student in Maharashtra looking for scholarships",
  "महिला हूँ, 35 वर्ष, सिलाई का काम शुरू करने के लिए लोन चाहिए",
  "Daily wage construction laborer, want health insurance",
];

export default function ChatPage() {
  const router = useRouter();
  const { language, profile, matchedSchemes } = useAppStore();
  const {
    messages,
    loading,
    initChat,
    resetChat,
    pendingMessage,
    clearPendingMessage,
  } = useChatStore();
  const { sendMessage } = useChat();
  const { listening, transcript, supported, startListening, stopListening } =
    useSpeechRecognition(language);

  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pendingHandled = useRef(false);

  // Initialize greeting if chat is empty
  useEffect(() => {
    if (messages.length === 0) {
      initChat(language, null);
    }
  }, [messages.length, initChat, language]);

  // Handle pending message from landing page
  useEffect(() => {
    if (pendingMessage && !pendingHandled.current) {
      pendingHandled.current = true;
      const t = setTimeout(() => {
        sendMessage(pendingMessage);
        clearPendingMessage();
      }, 300);
      return () => clearTimeout(t);
    }
  }, [pendingMessage, sendMessage, clearPendingMessage]);

  // Scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Sync mic transcript to input
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    sendMessage(msg);
  };

  const handleMicToggle = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col pb-20">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col lg:flex-row gap-6">
        {/* ─── Chat Message Column ─────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md h-[calc(100vh-105px)]">
          {/* Chat Header Bar */}
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">
                🤖
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  HaqDaar Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h2>
                <p className="text-[11px] text-gray-400">
                  {language === "hi" ? "पात्रता और योजना सहायक" : "Scheme Eligibility Guide"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/voice"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 transition-all"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Switch to Voice Mode</span>
              </Link>

              <button
                onClick={() => resetChat()}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Reset Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m, idx) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white"
                        : "bg-white/10 text-gray-200"
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-tr-none shadow-md shadow-orange-500/10"
                        : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-none"
                    }`}
                  >
                    {isUser ? (
                      <span className="whitespace-pre-line">{m.content}</span>
                    ) : (
                      <MarkdownRenderer content={m.content} />
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 text-gray-200 flex items-center justify-center shrink-0 text-xs font-bold">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions pills */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-white/5 bg-white/[0.01] flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-gray-400 shrink-0">Try asking:</span>
              {quickSuggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(suggestion)}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="p-4 border-t border-white/10 bg-gray-950/80">
            <GlowEffect active={loading} color="orange" className="rounded-xl w-full">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    language === "hi"
                      ? "अपनी स्थिति बताइए (उदा. मैं यूपी का किसान हूँ, ₹1 लाख आय)..."
                      : "Tell about yourself (e.g., student from MH, looking for scholarship)..."
                  }
                  disabled={loading}
                  className="flex-1 bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                />

                {supported && (
                  <button
                    type="button"
                    onClick={handleMicToggle}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      listening
                        ? "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse"
                        : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white"
                    }`}
                    title={listening ? "Listening... click to stop" : "Voice input"}
                  >
                    {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 text-white shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </GlowEffect>
          </div>
        </div>

        {/* ─── Profile Extraction & Schemes Sidebar ─────────────────── */}
        <div className="w-full lg:w-80 space-y-4">
          {/* Extracted Profile Card */}
          <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Live Extracted Profile
              </h3>
              <span className="text-[10px] text-gray-400">Silent Extraction</span>
            </div>

            <ProfileBadges profile={profile} />

            {/* Direct match CTA button */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={() => router.push("/results")}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Matching Results</span>
                <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
              </button>
            </div>
          </div>

          {/* Privacy & Direct Guide Note */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-[11px] text-gray-400 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Info className="w-3.5 h-3.5" />
              <span>How HaqDaar Extracts Facts</span>
            </div>
            <p className="leading-relaxed">
              As you chat, Gemini extracts key demographic data like state, occupation, age, and estimated income in the background to filter official criteria.
            </p>
          </div>
        </div>
      </main>

      {/* Floating Dynamic Toolbar */}
      <ToolbarDynamic />

      <Footer />
    </div>
  );
}
