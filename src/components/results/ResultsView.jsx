// ResultsView — Scheme matching results with filters
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Filter, Search, Volume2, RotateCcw } from "lucide-react";
import useAppStore from "../../stores/appStore";
import useTextToSpeech from "../../hooks/useTextToSpeech";
import { CATEGORY_CONFIG } from "../../data/states";

// ─── Category Colors ─────────────────────────────────────────────────────────
const catColors = {
  agriculture: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  health: "bg-red-500/15 text-red-400 border-red-500/20",
  scholarship: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  housing: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  startup: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  financial: "bg-teal-500/15 text-teal-400 border-teal-500/20",
  women: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  skill: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  senior: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  disability: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  food: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  social_welfare: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
};

// ─── Score Ring SVG ──────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 70
      ? "stroke-emerald-400"
      : score >= 50
      ? "stroke-orange-400"
      : "stroke-yellow-400";

  return (
    <div className="relative w-11 h-11 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle cx="20" cy="20" r={radius} fill="none" className={color} strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
        {score}%
      </span>
    </div>
  );
}

// ─── Scheme Detail View ──────────────────────────────────────────────────────
function SchemeDetail() {
  const { selectedScheme: s, setSelectedScheme, language } = useAppStore();
  const { speak } = useTextToSpeech(language);

  if (!s) return null;

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-lg border-b border-white/[0.06] p-4 flex items-center gap-3">
        <button
          onClick={() => setSelectedScheme(null)}
          className="text-orange-400 hover:text-orange-300 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="min-w-0">
          <div className="text-white font-bold text-sm truncate">{s.name}</div>
          <div className="text-gray-500 text-xs truncate">{s.nameHindi}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-lg mx-auto w-full">
        {/* Emoji + Score */}
        <div className="flex items-center justify-center gap-4 py-3">
          <span className="text-4xl">{s.emoji}</span>
          <ScoreRing score={s.score} />
        </div>

        {/* AI Reason */}
        {s.aiReason && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
            <div className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-1">
              🤖 AI Analysis
            </div>
            <div className="text-gray-300 text-xs leading-relaxed">
              {s.aiReason}
            </div>
          </div>
        )}

        {/* Benefit */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <div className="text-emerald-300 font-bold text-[10px] uppercase tracking-wider mb-1.5">
            ✅ What You Get
          </div>
          <div className="text-white text-sm font-medium leading-relaxed">
            {s.benefit}
          </div>
          <div className="text-emerald-400/70 text-xs mt-1.5">
            {s.benefitHindi}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4">
          <div className="text-orange-400 font-bold text-[10px] uppercase tracking-wider mb-2">
            📋 Documents Needed
          </div>
          <div className="space-y-1.5">
            {s.documents.map((d, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How to Apply */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4">
          <div className="text-orange-400 font-bold text-[10px] uppercase tracking-wider mb-2">
            🗺️ How to Apply
          </div>
          <div className="space-y-1.5">
            {s.apply_mode.map((m, i) => (
              <div key={i} className="text-xs text-gray-300">
                <span className="text-gray-500 mr-1.5">{i + 1}.</span> {m}
              </div>
            ))}
          </div>
        </div>

        {/* Apply button */}
        <a
          href={s.apply_url}
          target="_blank"
          rel="noreferrer"
          className="block bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold text-center py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20 text-sm"
        >
          🌐 Apply Online →
        </a>

        {/* Listen button */}
        <button
          onClick={() =>
            speak(
              `${s.name}. ${s.benefit}. Documents needed: ${s.documents.join(", ")}`
            )
          }
          className="w-full bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white font-medium py-3 rounded-xl border border-white/[0.08] transition-all text-xs flex items-center justify-center gap-2"
        >
          <Volume2 size={14} />
          सुनें / Listen
        </button>
      </div>
    </motion.div>
  );
}

// ─── Results List View ───────────────────────────────────────────────────────
export default function ResultsView() {
  const {
    matchedSchemes,
    selectedScheme,
    setSelectedScheme,
    profile,
    activeFilter,
    setActiveFilter,
    setPhase,
    resetApp,
  } = useAppStore();

  if (selectedScheme) return <SchemeDetail />;

  // Get unique categories from matched schemes
  const uniqueCats = [...new Set(matchedSchemes.map((s) => s.category))];

  const filtered =
    activeFilter === "all"
      ? matchedSchemes
      : matchedSchemes.filter((s) => s.category === activeFilter);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-lg border-b border-white/[0.06] p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <div className="text-lg font-black">
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                Haq
              </span>
              <span className="text-white">Daar</span>
            </div>
            <div className="text-emerald-400 text-xs font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              {matchedSchemes.length} schemes found for you
            </div>
          </div>
          <button
            onClick={resetApp}
            className="text-gray-500 text-xs border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/20 hover:text-gray-300 transition-all flex items-center gap-1.5"
          >
            <Search size={12} />
            New Search
          </button>
        </div>
      </div>

      {/* Profile tags */}
      <div className="bg-gray-900/50 border-b border-white/[0.04] px-4 py-2.5">
        <div className="max-w-lg mx-auto flex flex-wrap gap-1.5">
          {[
            profile.state && `📍 ${profile.state}`,
            profile.occupation && `💼 ${profile.occupation}`,
            profile.caste && `🏷️ ${profile.caste}`,
            profile.income && `💰 ₹${(profile.income / 1000).toFixed(0)}k/yr`,
            profile.age && `👤 ${profile.age} yrs`,
            profile.gender && `⚡ ${profile.gender}`,
            profile.area && `🏘️ ${profile.area}`,
          ]
            .filter(Boolean)
            .map((tag) => (
              <span
                key={tag}
                className="bg-white/[0.05] text-gray-400 text-[10px] px-2 py-0.5 rounded-full border border-white/[0.06]"
              >
                {tag}
              </span>
            ))}
        </div>
      </div>

      {/* Category filters */}
      {uniqueCats.length > 1 && (
        <div className="px-4 py-2 overflow-x-auto scrollbar-hide">
          <div className="max-w-lg mx-auto flex gap-1.5">
            <button
              onClick={() => setActiveFilter("all")}
              className={`text-[10px] px-3 py-1 rounded-full whitespace-nowrap border transition-all ${
                activeFilter === "all"
                  ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                  : "bg-white/[0.04] text-gray-500 border-white/[0.06] hover:text-gray-300"
              }`}
            >
              All ({matchedSchemes.length})
            </button>
            {uniqueCats.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const count = matchedSchemes.filter(
                (s) => s.category === cat
              ).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`text-[10px] px-3 py-1 rounded-full whitespace-nowrap border transition-all ${
                    activeFilter === cat
                      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      : "bg-white/[0.04] text-gray-500 border-white/[0.06] hover:text-gray-300"
                  }`}
                >
                  {cfg?.emoji} {cfg?.label || cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Scheme cards */}
      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <div className="text-4xl mb-4">🔍</div>
            <div>No matching schemes found. Try a different filter.</div>
            <button
              onClick={() => setPhase("chat")}
              className="mt-4 text-orange-400 hover:text-orange-300 text-sm"
            >
              ← Go back and add more info
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {filtered.map((s, i) => (
                <motion.button
                  key={s.id}
                  onClick={() => setSelectedScheme(s)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] hover:border-orange-500/30 rounded-xl p-3.5 text-left transition-all duration-200 hover:bg-white/[0.05] group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{s.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-white font-semibold text-sm leading-tight group-hover:text-orange-300 transition-colors">
                          {s.name}
                        </div>
                        <ScoreRing score={s.score} />
                      </div>
                      <div className="text-gray-500 text-[11px] mt-0.5">
                        {s.nameHindi}
                      </div>
                      <div className="text-orange-400/80 text-xs mt-1.5 font-medium line-clamp-2">
                        {s.benefit.split(" — ")[0]}
                      </div>
                      {s.aiReason && (
                        <div className="text-indigo-400/60 text-[10px] mt-1 italic">
                          🤖 {s.aiReason}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            catColors[s.category] ||
                            "bg-white/5 text-gray-400 border-white/10"
                          }`}
                        >
                          {CATEGORY_CONFIG[s.category]?.emoji}{" "}
                          {CATEGORY_CONFIG[s.category]?.label || s.category}
                        </span>
                        {s.level === "state" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            📍 {s.state}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>

            <button
              onClick={() => setPhase("chat")}
              className="w-full bg-white/[0.02] border border-dashed border-white/10 hover:border-orange-500/30 rounded-xl p-4 text-center text-gray-600 hover:text-gray-400 text-xs transition-all mt-2"
            >
              + Add more details to find more schemes
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
