// HaqDaar v2 — Root Application
// Phase router: landing → chat → results
import useAppStore from "./stores/appStore";
import LandingPage from "./components/landing/LandingPage";
import ChatView from "./components/chat/ChatView";
import ResultsView from "./components/results/ResultsView";
import { AnimatePresence, motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function App() {
  const phase = useAppStore((s) => s.phase);

  return (
    <AnimatePresence mode="wait">
      {phase === "landing" && (
        <motion.div key="landing" {...pageVariants} transition={{ duration: 0.3 }}>
          <LandingPage />
        </motion.div>
      )}
      {phase === "chat" && (
        <motion.div key="chat" {...pageVariants} transition={{ duration: 0.3 }}>
          <ChatView />
        </motion.div>
      )}
      {phase === "results" && (
        <motion.div key="results" {...pageVariants} transition={{ duration: 0.3 }}>
          <ResultsView />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
