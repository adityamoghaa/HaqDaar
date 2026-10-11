// Profile Badges — displays extracted user profile as tags
import Badge from "@/components/ui/Badge";

const profileFields = [
  { key: "state", emoji: "📍", format: (v) => v },
  { key: "occupation", emoji: "💼", format: (v) => v },
  { key: "caste", emoji: "🏷️", format: (v) => v },
  { key: "income", emoji: "💰", format: (v) => `₹${(v / 1000).toFixed(0)}k/yr` },
  { key: "age", emoji: "👤", format: (v) => `${v} yrs` },
  { key: "gender", emoji: "⚡", format: (v) => v },
  { key: "area", emoji: "🏘️", format: (v) => v },
  { key: "bpl", emoji: "📋", format: (v) => v ? "BPL" : null },
  { key: "widow", emoji: "👩", format: (v) => v ? "Widow" : null },
];

export default function ProfileBadges({ profile = {}, className = "" }) {
  const badges = profileFields
    .map(({ key, emoji, format }) => {
      const val = profile[key];
      if (val === null || val === undefined) return null;
      const formatted = format(val);
      if (!formatted) return null;
      return { key, label: `${emoji} ${formatted}` };
    })
    .filter(Boolean);

  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {badges.map(({ key, label }) => (
        <Badge key={key} color="gray" size="sm">{label}</Badge>
      ))}
    </div>
  );
}
