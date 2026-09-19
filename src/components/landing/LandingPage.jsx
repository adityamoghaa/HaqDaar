// LandingPage — Hero, stats, language selection, sample prompts
import { motion } from "framer-motion";
import useAppStore from "../../stores/appStore";
import { LANGUAGES } from "../../data/states";

const stats = [
  ["46+", "Schemes"],
  ["12", "Categories"],
  ["5+", "States"],
  ["₹0", "Cost"],
];

const samplePrompts = [
  "Main UP ka kisan hoon, 3 bacche hain, income 80,000 saal ki hai",
  "I'm a college student in Maharashtra, SC category, family income 1.5 lakh",
  "मैं दिल्ली में काम करती हूँ, घर नहीं है, 35 साल की हूँ",
  "मैं राजस्थान से हूँ, बेरोजगार हूँ, OBC category, 22 साल",
];

export default function LandingPage() {
  const { startChat } = useAppStore();

  const primaryLangs = LANGUAGES.filter((l) => l.btnLabel);
  const secondaryLangs = LANGUAGES.filter((l) => !l.btnLabel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 flex flex-col items-center justify-center p-5 overflow-hidden">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="text-5xl font-black tracking-tight mb-1"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Haq
            </span>
            <span className="text-white">Daar</span>
          </motion.div>
          <div className="text-gray-500 text-lg font-light tracking-wide">
            हक़दार
          </div>
          <motion.p
            className="mt-3 text-gray-400 text-sm leading-relaxed max-w-xs mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Discover every government scheme you qualify for — in your language,
            in your voice.
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-4 gap-2 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {stats.map(([n, l], i) => (
            <motion.div
              key={l}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2.5 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <div className="text-orange-400 font-black text-base">{n}</div>
              <div className="text-gray-500 text-[10px] uppercase tracking-wider">
                {l}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Language selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="mb-3 text-center text-gray-500 text-xs tracking-wide uppercase">
            Choose your language / भाषा चुनें
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {primaryLangs.map((lang) => (
              <button
                key={lang.code}
                onClick={() => startChat(lang.code)}
                className={`font-bold py-3.5 px-5 rounded-xl transition-all duration-200 text-sm ${
                  lang.code === "hi"
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
                }`}
              >
                {lang.btnLabel}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {secondaryLangs.map((lang) => (
              <button
                key={lang.code}
                onClick={() => startChat(lang.code)}
                className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-medium py-2.5 rounded-lg border border-white/5 hover:border-white/15 transition-all"
              >
                {lang.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Sample prompts */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="text-gray-600 text-[10px] text-center mb-2.5 uppercase tracking-widest">
            Try saying...
          </div>
          <div className="space-y-1.5">
            {samplePrompts.map((s, i) => (
              <motion.div
                key={i}
                onClick={() => startChat("hi", s)}
                className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5 text-[11px] text-gray-500 cursor-pointer hover:border-orange-500/30 hover:text-gray-300 hover:bg-white/[0.06] transition-all duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                💬 &quot;{s}&quot;
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-8 text-center text-gray-700 text-[10px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Powered by Gemini 3.5 Flash • Data from MyScheme.gov.in
        </motion.div>
      </motion.div>
    </div>
  );
}
