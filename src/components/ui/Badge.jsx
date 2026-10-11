// Badge component for tags, categories, profile items
const colorMap = {
  saffron: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  red: "bg-red-500/15 text-red-400 border-red-500/20",
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  teal: "bg-teal-500/15 text-teal-400 border-teal-500/20",
  pink: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  orange: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  indigo: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  violet: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  gray: "bg-white/[0.05] text-gray-400 border-white/[0.06]",
};

const sizes = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

export default function Badge({
  children,
  color = "gray",
  size = "sm",
  className = "",
  onClick,
}) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${colorMap[color] || colorMap.gray} ${sizes[size]} ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""} ${className}`}
    >
      {children}
    </span>
  );
}
