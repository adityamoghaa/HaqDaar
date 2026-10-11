// ResultsPage v3 — Scheme results with filters, detail view, and AI explainer
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Volume2, Share2, Bookmark, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAppStore from "@/stores/appStore";
import useTextToSpeech from "@/hooks/useTextToSpeech";
import { CATEGORY_CONFIG } from "@/data/states";
import Header from "@/components/layout/Header";
import SchemeCard, { ScoreRing } from "@/components/shared/SchemeCard";
import ProfileBadges from "@/components/shared/ProfileBadges";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";

// Category color mapping
const catColors = {
  agriculture: "emerald", health: "red", scholarship: "blue", housing: "amber",
  startup: "purple", financial: "teal", women: "pink", skill: "orange",
  senior: "indigo", disability: "violet", food: "yellow", social_welfare: "cyan",
};

// ─── AI Scheme Explainer ─────────────────────────────────────
function SchemeExplainer({ scheme, profile, language }) {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchExplanation = async () => {
    if (explanation || loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, scheme, language }),
      });
      if (response.ok) {
        const data = await response.json();
        const text = data.content?.[0]?.text || "{}";
        try {
          const parsed = JSON.parse(text);
          setExplanation(parsed.explanation || text);
        } catch {
          setExplanation(text);
        }
      }
    } catch (err) {
      setExplanation("Could not load explanation. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="glass rounded-xl p-4">
      <button
        onClick={fetchExplanation}
        className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-xs font-semibold transition-colors w-full"
      >
        <Sparkles size={14} />
        {loading ? "Generating explanation..." : explanation ? "🤖 AI Explanation" : "🤖 Get AI Explanation"}
      </button>
      {explanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 text-gray-300 text-xs leading-relaxed"
        >
          <MarkdownRenderer content={explanation} />
        </motion.div>
      )}
    </div>
  );
}

// ─── Scheme Detail View ──────────────────────────────────────
function SchemeDetail() {
  const navigate = useNavigate();
  const { selectedScheme: s, setSelectedScheme, profile, language } = useAppStore();
  const { speak } = useTextToSpeech(language);
  const [saved, setSaved] = useState(false);

  if (!s) return null;

  const handleShare = async () => {
    const shareData = {
      title: `${s.name} — HaqDaar`,
      text: `Check out ${s.name}: ${s.benefit}`,
      url: s.apply_url || window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      }
    } catch {}
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="glass-strong p-4 flex items-center gap-3">
        <button onClick={() => setSelectedScheme(null)} className="text-orange-400 hover:text-orange-300 transition-colors">
          <ArrowLeft size={22} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-white font-bold text-sm truncate">{s.name}</div>
          <div className="text-gray-500 text-xs truncate">{s.nameHindi}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="p-2 glass rounded-lg text-gray-400 hover:text-white transition-colors">
            <Share2 size={14} />
          </button>
          <button
            onClick={() => setSaved(!saved)}
            className={`p-2 glass rounded-lg transition-colors ${saved ? "text-orange-400" : "text-gray-400 hover:text-white"}`}
          >
            <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
          </button>
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
            <div className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-1">🤖 AI Analysis</div>
            <div className="text-gray-300 text-xs leading-relaxed">{s.aiReason}</div>
          </div>
        )}

        {/* AI Explainer */}
        <SchemeExplainer scheme={s} profile={profile} language={language} />

        {/* Benefit */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <div className="text-emerald-300 font-bold text-[10px] uppercase tracking-wider mb-1.5">✅ What You Get</div>
          <div className="text-white text-sm font-medium leading-relaxed">{s.benefit}</div>
          <div className="text-emerald-400/70 text-xs mt-1.5">{s.benefitHindi}</div>
        </div>

        {/* Documents */}
        <div className="glass rounded-xl p-4">
          <div className="text-orange-400 font-bold text-[10px] uppercase tracking-wider mb-2">📋 Documents Needed</div>
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
        <div className="glass rounded-xl p-4">
          <div className="text-orange-400 font-bold text-[10px] uppercase tracking-wider mb-2">🗺️ How to Apply</div>
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
          className="block gradient-saffron hover:opacity-90 text-white font-bold text-center py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20 text-sm"
        >
          🌐 Apply Online →
        </a>

        {/* Listen button */}
        <button
          onClick={() => speak(`${s.name}. ${s.benefit}. Documents needed: ${s.documents.join(", ")}`)}
          className="w-full glass glass-hover text-gray-400 hover:text-white font-medium py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
        >
          <Volume2 size={14} />
          सुनें / Listen
        </button>
      </div>
    </motion.div>
  );
}

// ─── Results List View ───────────────────────────────────────
export default function ResultsPage() {
  const navigate = useNavigate();
  const {
    matchedSchemes, selectedScheme, setSelectedScheme,
    profile, activeFilter, setActiveFilter,
  } = useAppStore();

  if (selectedScheme) return <SchemeDetail />;

  const uniqueCats = [...new Set(matchedSchemes.map((s) => s.category))];
  const filtered = activeFilter === "all"
    ? matchedSchemes
    : matchedSchemes.filter((s) => s.category === activeFilter);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Header showBack rightAction="reset" />

      {/* Results count */}
      <div className="px-4 py-2 border-b border-white/[0.04]">
        <div className="max-w-lg mx-auto">
          <div className="text-emerald-400 text-xs font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            {matchedSchemes.length} schemes found for you
          </div>
        </div>
      </div>

      {/* Profile tags */}
      <div className="border-b border-white/[0.04] px-4 py-2.5">
        <div className="max-w-lg mx-auto">
          <ProfileBadges profile={profile} />
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
                  : "glass text-gray-500 hover:text-gray-300"
              }`}
            >
              All ({matchedSchemes.length})
            </button>
            {uniqueCats.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const count = matchedSchemes.filter((s) => s.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`text-[10px] px-3 py-1 rounded-full whitespace-nowrap border transition-all ${
                    activeFilter === cat
                      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      : "glass text-gray-500 hover:text-gray-300"
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
            <button onClick={() => navigate("/chat")} className="mt-4 text-orange-400 hover:text-orange-300 text-sm">
              ← Go back and add more info
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {filtered.map((s, i) => (
                <SchemeCard key={s.id} scheme={s} index={i} onClick={() => setSelectedScheme(s)} />
              ))}
            </AnimatePresence>

            <button
              onClick={() => navigate("/chat")}
              className="w-full glass glass-hover border-dashed rounded-xl p-4 text-center text-gray-600 hover:text-gray-400 text-xs transition-all mt-2"
            >
              + Add more details to find more schemes
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
