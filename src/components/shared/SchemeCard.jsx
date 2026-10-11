// SchemeCard — compact scheme display for results list
import { motion } from "framer-motion";
import Badge from "@/components/ui/Badge";
import { CATEGORY_CONFIG } from "@/data/states";

// ─── Score Ring SVG ──────────────────────────────────────
function ScoreRing({ score }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 70 ? "stroke-emerald-400" : score >= 50 ? "stroke-orange-400" : "stroke-yellow-400";

  return (
    <div className="relative w-11 h-11 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle cx="20" cy="20" r={radius} fill="none" className={color} strokeWidth="3"
          strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
        {score}%
      </span>
    </div>
  );
}

// Category color mapping
const catColors = {
  agriculture: "emerald", health: "red", scholarship: "blue", housing: "amber",
  startup: "purple", financial: "teal", women: "pink", skill: "orange",
  senior: "indigo", disability: "violet", food: "yellow", social_welfare: "cyan",
};

export default function SchemeCard({ scheme, index = 0, onClick }) {
  const cfg = CATEGORY_CONFIG[scheme.category];

  return (
    <motion.button
      onClick={onClick}
      className="w-full glass glass-hover rounded-xl p-3.5 text-left transition-all duration-200 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{scheme.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="text-white font-semibold text-sm leading-tight group-hover:text-orange-300 transition-colors">
              {scheme.name}
            </div>
            <ScoreRing score={scheme.score} />
          </div>
          <div className="text-gray-500 text-[11px] mt-0.5">{scheme.nameHindi}</div>
          <div className="text-orange-400/80 text-xs mt-1.5 font-medium line-clamp-2">
            {scheme.benefit?.split(" — ")[0]}
          </div>
          {scheme.aiReason && (
            <div className="text-indigo-400/60 text-[10px] mt-1 italic">
              🤖 {scheme.aiReason}
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-2">
            <Badge color={catColors[scheme.category] || "gray"} size="sm">
              {cfg?.emoji} {cfg?.label || scheme.category}
            </Badge>
            {scheme.level === "state" && (
              <Badge color="amber" size="sm">📍 {scheme.state}</Badge>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export { ScoreRing };
