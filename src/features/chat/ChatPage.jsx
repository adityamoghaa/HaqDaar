// ChatPage v3 — Full chat interface with messages, input, voice toggle, and markdown
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Mic2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAppStore from "@/stores/appStore";
import useChatStore from "@/stores/chatStore";
import useChat from "@/hooks/useChat";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import useTextToSpeech from "@/hooks/useTextToSpeech";
import Header from "@/components/layout/Header";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import ProfileBadges from "@/components/shared/ProfileBadges";

function MessageBubble({ message, isUser }) {
  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "gradient-saffron text-white rounded-br-md shadow-lg shadow-orange-500/10"
            : "glass text-gray-100 rounded-bl-md"
        }`}
      >
        {isUser ? (
          <span className="whitespace-pre-line">{message.content}</span>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="glass px-5 py-3.5 rounded-2xl rounded-bl-md">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { language, profile, matchedSchemes } = useAppStore();
  const { messages, loading, pendingMessage, clearPendingMessage } = useChatStore();
  const { sendMessage } = useChat();
  const { listening, transcript, supported, startListening } = useSpeechRecognition(language);
  const { speak } = useTextToSpeech(language);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const pendingHandled = useRef(false);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Navigate to results when schemes are matched
  useEffect(() => {
    if (matchedSchemes.length > 0) {
      navigate("/results");
    }
  }, [matchedSchemes, navigate]);

  // Auto-send pending message
  useEffect(() => {
    if (pendingMessage && !pendingHandled.current) {
      pendingHandled.current = true;
      const timer = setTimeout(() => {
        sendMessage(pendingMessage);
        clearPendingMessage();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pendingMessage, sendMessage, clearPendingMessage]);

  // Auto-fill transcript from voice
  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  // Speak assistant messages
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "assistant") speak(last.content);
  }, [messages.length, speak]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col">
      <Header showBack rightAction="reset" />

      {/* Profile badges */}
      {Object.keys(profile).length > 0 && (
        <div className="border-b border-white/[0.04] px-4 py-2">
          <div className="max-w-lg mx-auto">
            <ProfileBadges profile={profile} />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-lg mx-auto w-full">
        <AnimatePresence mode="popLayout">
          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} isUser={m.role === "user"} />
          ))}
        </AnimatePresence>
        {loading && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div className="glass-strong border-t border-white/[0.06] p-3">
        <div className="max-w-lg mx-auto flex gap-2">
          {/* Voice mode shortcut */}
          <button
            onClick={() => navigate("/voice")}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 glass glass-hover text-orange-400 hover:text-orange-300"
            title="Switch to Voice Mode"
          >
            <Mic2 size={18} />
          </button>

          {/* Legacy voice input (Web Speech API fallback) */}
          {supported && (
            <button
              onClick={startListening}
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                listening
                  ? "bg-red-500 shadow-lg shadow-red-500/30 animate-pulse text-white"
                  : "glass glass-hover text-gray-400 hover:text-white"
              }`}
            >
              <Mic size={18} />
            </button>
          )}

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={language === "hi" ? "अपनी बात लिखें..." : "Type your message..."}
            className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-11 h-11 gradient-saffron hover:opacity-90 disabled:opacity-30 disabled:bg-gray-700 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all shadow-lg shadow-orange-500/20 disabled:shadow-none"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
