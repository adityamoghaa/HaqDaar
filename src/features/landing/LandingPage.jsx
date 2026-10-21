// LandingPage v3 — Premium hero, voice-first CTA, how-it-works
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mic, MessageSquare, ArrowRight, Shield, Globe, Zap } from "lucide-react";
import useAppStore from "@/stores/appStore";
import useChatStore from "@/stores/chatStore";
import { LANGUAGES } from "@/data/states";
import Button from "@/components/ui/Button";

const stats = [
  ["150+", "Schemes"],
  ["16", "Categories"],
  ["15+", "States"],
  ["₹0", "Cost"],
];

const samplePrompts = [
  { text: "Main UP ka kisan hoon, 3 bacche hain, income 80,000 saal ki hai", lang: "hi" },
  { text: "I'm a college student in Maharashtra, SC category, family income 1.5 lakh", lang: "en" },
  { text: "मैं दिल्ली में काम करती हूँ, घर नहीं है, 35 साल की हूँ", lang: "hi" },
  { text: "मैं राजस्थान से हूँ, बेरोजगार हूँ, OBC category, 22 साल", lang: "hi" },
];

const howItWorks = [
  { icon: <Mic size={24} />, title: "बोलें / Speak", desc: "Tell us about yourself in any language" },
  { icon: <Zap size={24} />, title: "AI Matches", desc: "Gemini AI finds your eligible schemes" },
  { icon: <Shield size={24} />, title: "Apply", desc: "Get step-by-step guidance to apply" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { setLanguage } = useAppStore();
  const { initChat } = useChatStore();

  const primaryLangs = LANGUAGES.filter((l) => l.btnLabel);
  const secondaryLangs = LANGUAGES.filter((l) => !l.btnLabel);

  const handleStartChat = (lang, pendingMsg = null) => {
    setLanguage(lang);
    initChat(lang, pendingMsg);
    navigate("/chat");
  };

  const handleStartVoice = (lang = "hi") => {
    setLanguage(lang);
    navigate("/voice");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 flex flex-col items-center justify-center p-5 overflow-hidden relative">
      {/* Background orbs */}
      <div className="absolute top-20 -left-32 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-32 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/3 rounded-full blur-3xl" />

      <motion.div
        className="max-w-md w-full relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <motion.div
            className="text-5xl font-black tracking-tight mb-1"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="text-gradient-saffron">Haq</span>
            <span className="text-white">Daar</span>
          </motion.div>
          <div className="text-gray-500 text-lg font-light tracking-wide">हक़दार</div>
          <motion.p
            className="mt-3 text-gray-400 text-sm leading-relaxed max-w-xs mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Discover every government scheme you qualify for — in your language, in your voice.
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-4 gap-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {stats.map(([n, l], i) => (
            <motion.div
              key={l}
              className="glass rounded-xl p-2.5 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <div className="text-orange-400 font-black text-base">{n}</div>
              <div className="text-gray-500 text-[10px] uppercase tracking-wider">{l}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Voice-first CTA */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => handleStartVoice("hi")}
            className="w-full group relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600"
          >
            <div className="bg-gray-950/90 backdrop-blur-xl rounded-2xl px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full gradient-saffron flex items-center justify-center shadow-lg shadow-orange-500/30 animate-pulse-glow">
                  <Mic size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold text-sm">Start Voice Conversation</div>
                  <div className="text-gray-400 text-xs mt-0.5">🎙️ Speak in Hindi, English, or any language</div>
                </div>
              </div>
              <ArrowRight size={18} className="text-orange-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </motion.div>

        {/* Language selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="mb-3 text-center text-gray-500 text-xs tracking-wide uppercase flex items-center gap-2 justify-center">
            <div className="h-px bg-white/10 flex-1" />
            <span>Or type in your language</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {primaryLangs.map((lang) => (
              <Button
                key={lang.code}
                variant={lang.code === "hi" ? "primary" : "secondary"}
                size="lg"
                onClick={() => handleStartChat(lang.code)}
                className="w-full"
              >
                <MessageSquare size={16} />
                {lang.code === "hi" ? "हिंदी में चैट करें" : "Chat in English"}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {secondaryLangs.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleStartChat(lang.code)}
                className="glass glass-hover text-gray-400 hover:text-white text-xs font-medium py-2.5 rounded-lg transition-all"
              >
                {lang.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="grid grid-cols-3 gap-3">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.title}
                className="text-center"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mx-auto mb-2 text-orange-400">
                  {step.icon}
                </div>
                <div className="text-white text-xs font-semibold">{step.title}</div>
                <div className="text-gray-600 text-[10px] mt-0.5">{step.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sample prompts */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="text-gray-600 text-[10px] text-center mb-2.5 uppercase tracking-widest">
            Try saying...
          </div>
          <div className="space-y-1.5">
            {samplePrompts.map((s, i) => (
              <motion.div
                key={i}
                onClick={() => handleStartChat(s.lang, s.text)}
                className="glass glass-hover rounded-lg px-3 py-2.5 text-[11px] text-gray-500 cursor-pointer hover:text-gray-300 transition-all duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 + i * 0.1 }}
              >
                💬 &quot;{s.text}&quot;
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-8 text-center space-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <div className="flex items-center justify-center gap-2 text-gray-600 text-[10px]">
            <Globe size={10} />
            Powered by Gemini AI
            <span className="text-gray-700">•</span>
            Data from MyScheme.gov.in
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
