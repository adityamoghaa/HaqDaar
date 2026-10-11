// VoicePage — Full-screen voice conversation interface with Gemini Live API
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, MessageSquare, Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useVoiceStore from "@/stores/voiceStore";
import useAppStore from "@/stores/appStore";
import useVoiceSession from "@/hooks/useVoiceSession";
import ProfileBadges from "@/components/shared/ProfileBadges";

// ─── Voice Orb — animated visual feedback ───────────────────
function VoiceOrb({ state }) {
  // state: idle | connecting | listening | thinking | speaking
  const orbColors = {
    idle: "from-gray-600 to-gray-700",
    connecting: "from-orange-500 to-orange-600",
    listening: "from-emerald-400 to-emerald-600",
    thinking: "from-indigo-400 to-purple-600",
    speaking: "from-orange-400 to-orange-600",
  };

  const ringColors = {
    idle: "border-gray-600/20",
    connecting: "border-orange-500/20",
    listening: "border-emerald-400/30",
    thinking: "border-indigo-400/20",
    speaking: "border-orange-400/30",
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer rings */}
      {(state === "listening" || state === "speaking") && (
        <>
          <motion.div
            className={`absolute w-48 h-48 rounded-full border-2 ${ringColors[state]}`}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className={`absolute w-40 h-40 rounded-full border-2 ${ringColors[state]}`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.1, 0.4],
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </>
      )}

      {/* Thinking spinner */}
      {state === "thinking" && (
        <motion.div
          className="absolute w-36 h-36 rounded-full border-2 border-t-indigo-400 border-r-purple-400 border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Connecting spinner */}
      {state === "connecting" && (
        <motion.div
          className="absolute w-36 h-36 rounded-full border-2 border-t-orange-400 border-r-transparent border-b-transparent border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Main orb */}
      <motion.div
        className={`w-28 h-28 rounded-full bg-gradient-to-br ${orbColors[state]} shadow-2xl flex items-center justify-center`}
        animate={
          state === "listening"
            ? { scale: [1, 1.08, 1] }
            : state === "speaking"
            ? { scale: [1, 1.05, 0.97, 1] }
            : state === "thinking"
            ? { scale: [1, 1.02, 1] }
            : {}
        }
        transition={
          state === "listening"
            ? { duration: 1.5, repeat: Infinity }
            : state === "speaking"
            ? { duration: 0.8, repeat: Infinity }
            : state === "thinking"
            ? { duration: 2, repeat: Infinity }
            : {}
        }
      >
        <Mic size={36} className="text-white" />
      </motion.div>
    </div>
  );
}

// ─── Transcript Overlay ──────────────────────────────────────
function TranscriptOverlay({ inputText, outputText }) {
  return (
    <div className="w-full max-w-sm space-y-3 min-h-[100px]">
      <AnimatePresence mode="popLayout">
        {inputText && (
          <motion.div
            key="input"
            className="text-right"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span className="inline-block gradient-saffron text-white text-sm px-4 py-2 rounded-2xl rounded-br-md max-w-[80%]">
              {inputText}
            </span>
          </motion.div>
        )}
        {outputText && (
          <motion.div
            key="output"
            className="text-left"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <span className="inline-block glass text-gray-200 text-sm px-4 py-2 rounded-2xl rounded-bl-md max-w-[80%]">
              {outputText}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Voice Page ─────────────────────────────────────────
export default function VoicePage() {
  const navigate = useNavigate();
  const { startSession, stopSession } = useVoiceSession();
  const { sessionState, isListening, isSpeaking, isThinking, inputTranscript, outputTranscript } = useVoiceStore();
  const { profile, matchedSchemes } = useAppStore();

  // Navigate to results when schemes matched
  useEffect(() => {
    if (matchedSchemes.length > 0) {
      // Small delay to let the AI finish speaking about results
      const timer = setTimeout(() => {
        stopSession();
        navigate("/results");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [matchedSchemes, navigate, stopSession]);

  const getOrbState = () => {
    if (sessionState === "connecting") return "connecting";
    if (isThinking) return "thinking";
    if (isSpeaking) return "speaking";
    if (isListening) return "listening";
    return "idle";
  };

  const getStatusText = () => {
    if (sessionState === "connecting") return "Connecting...";
    if (sessionState === "error") return "Connection error";
    if (isThinking) return "Finding your schemes...";
    if (isSpeaking) return "Speaking...";
    if (isListening) return "Listening... speak now";
    if (sessionState === "connected") return "Ready — tap to start";
    return "Tap to begin voice conversation";
  };

  const handleToggle = () => {
    if (sessionState === "idle" || sessionState === "error" || sessionState === "disconnected") {
      startSession();
    } else {
      stopSession();
    }
  };

  const isActive = sessionState === "connected" || isListening || isSpeaking || isThinking;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-indigo-950 flex flex-col">
      {/* Header */}
      <div className="glass-strong px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="text-lg font-black">
          <span className="text-gradient-saffron">Haq</span>
          <span className="text-white">Daar</span>
        </button>
        <button
          onClick={() => {
            stopSession();
            navigate("/chat");
          }}
          className="text-gray-500 hover:text-gray-300 text-xs flex items-center gap-1.5 border border-white/10 px-2.5 py-1.5 rounded-lg hover:border-white/20 transition-all"
        >
          <MessageSquare size={12} />
          Text Chat
        </button>
      </div>

      {/* Profile badges */}
      {Object.keys(profile).length > 0 && (
        <div className="px-4 py-2">
          <div className="max-w-sm mx-auto">
            <ProfileBadges profile={profile} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
        {/* Voice Orb */}
        <VoiceOrb state={getOrbState()} />

        {/* Status */}
        <motion.div
          className="text-center"
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`text-sm font-medium ${
            sessionState === "error" ? "text-red-400" :
            isListening ? "text-emerald-400" :
            isSpeaking ? "text-orange-400" :
            "text-gray-400"
          }`}>
            {getStatusText()}
          </div>
        </motion.div>

        {/* Transcript */}
        <TranscriptOverlay
          inputText={inputTranscript}
          outputText={outputTranscript}
        />
      </div>

      {/* Bottom controls */}
      <div className="p-6 flex items-center justify-center gap-4">
        {/* Main toggle button */}
        <motion.button
          onClick={handleToggle}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isActive
              ? "bg-red-500 shadow-red-500/30 hover:bg-red-600"
              : "gradient-saffron shadow-orange-500/30 hover:opacity-90"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isActive ? (
            <PhoneOff size={24} className="text-white" />
          ) : (
            <Phone size={24} className="text-white" />
          )}
        </motion.button>
      </div>

      {/* Footer hint */}
      <div className="text-center pb-6 text-gray-600 text-[10px]">
        {isActive
          ? "Speak naturally • AI understands Hindi, English & more"
          : "Powered by Gemini Live API • Real-time voice AI"}
      </div>
    </div>
  );
}
