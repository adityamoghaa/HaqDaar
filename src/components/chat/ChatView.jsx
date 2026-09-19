// ChatView — Full chat interface with messages, input, and voice
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, RotateCcw } from "lucide-react";
import useAppStore from "../../stores/appStore";
import useChat from "../../hooks/useChat";
import useSpeechRecognition from "../../hooks/useSpeechRecognition";
import useTextToSpeech from "../../hooks/useTextToSpeech";

export default function ChatView() {
  const { messages, loading, language, pendingMessage, clearPendingMessage, resetApp } = useAppStore();
  const { sendMessage } = useChat();
  const { listening, transcript, supported, startListening } =
    useSpeechRecognition(language);
  const { speak } = useTextToSpeech(language);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const pendingHandled = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-send pending message from sample prompt click
  useEffect(() => {
    if (pendingMessage && !pendingHandled.current) {
      pendingHandled.current = true;
      // Small delay to let the greeting render first
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
  }, [messages.length]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-lg border-b border-white/[0.06] px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="text-lg font-black">
          <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
            Haq
          </span>
          <span className="text-white">Daar</span>
        </div>
        <button
          onClick={resetApp}
          className="text-gray-500 hover:text-gray-300 text-xs flex items-center gap-1.5 border border-white/10 px-2.5 py-1.5 rounded-lg hover:border-white/20 transition-all"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-lg mx-auto w-full">
        <AnimatePresence mode="popLayout">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-md shadow-lg shadow-orange-500/10"
                    : "bg-white/[0.06] backdrop-blur-sm text-gray-100 border border-white/[0.08] rounded-bl-md"
                }`}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] px-5 py-3.5 rounded-2xl rounded-bl-md">
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
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <div className="bg-gray-900/80 backdrop-blur-lg border-t border-white/[0.06] p-3">
        <div className="max-w-lg mx-auto flex gap-2">
          {supported && (
            <button
              onClick={startListening}
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                listening
                  ? "bg-red-500 shadow-lg shadow-red-500/30 animate-pulse"
                  : "bg-white/[0.06] hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              <Mic size={18} />
            </button>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              language === "hi" ? "अपनी बात लिखें..." : "Type your message..."
            }
            className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-11 h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 disabled:from-gray-700 disabled:to-gray-700 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all shadow-lg shadow-orange-500/20 disabled:shadow-none"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
