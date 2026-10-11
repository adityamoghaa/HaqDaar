// Scheme Search Engine — Fuse.js fuzzy search + Rule-based fallback matcher
import Fuse from "fuse.js";
import schemeData from "@/data/schemes.json";

export interface Scheme {
  id: string;
  name: string;
  nameHindi: string;
  category: string;
  level: string;
  state: string;
  department: string;
  brief: string;
  briefHindi: string;
  benefit: string;
  benefitHindi: string;
  benefitType: string;
  eligibility: {
    occupation?: string[];
    gender?: string;
    minAge?: number;
    maxAge?: number;
    maxIncome?: number | null;
    caste?: string[];
    bpl?: boolean;
    area?: string;
    landholding?: string;
    other?: string[];
  };
  documents: string[];
  apply_mode: string[];
  apply_url: string;
  tags: string[];
  emoji?: string;
}

export interface SchemeCategory {
  label: string;
  labelHindi: string;
  emoji: string;
  color: string;
}

export const schemes: Scheme[] = schemeData.schemes as unknown as Scheme[];
export const categories: Record<string, SchemeCategory> = schemeData.categories as Record<string, SchemeCategory>;

const fuse = new Fuse(schemes, {
  keys: [
    { name: "name", weight: 0.3 },
    { name: "nameHindi", weight: 0.2 },
    { name: "benefit", weight: 0.15 },
    { name: "benefitHindi", weight: 0.1 },
    { name: "tags", weight: 0.15 },
    { name: "brief", weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
});

export function searchSchemes(query: string): Scheme[] {
  if (!query || query.trim().length < 2) return schemes;
  return fuse.search(query.trim()).map((r) => r.item);
}

export function filterSchemes({
  category,
  state,
  level,
}: {
  category?: string;
  state?: string;
  level?: string;
} = {}): Scheme[] {
  return schemes.filter((s) => {
    if (category && category !== "all" && s.category !== category) return false;
    if (state && state !== "all" && s.state !== "all" && s.state.toLowerCase() !== state.toLowerCase()) {
      return false;
    }
    if (level && level !== "all" && s.level !== level) return false;
    return true;
  });
}

export interface MatchScoreResult extends Scheme {
  score: number;
  aiReason?: string;
  reasons: string[];
}

export function matchSchemesRuleBased(profile: Record<string, unknown>): MatchScoreResult[] {
  const scored = schemes.map((scheme) => {
    let score = 0;
    const reasons: string[] = [];
    const el = scheme.eligibility;

    const occ = typeof profile.occupation === "string" ? profile.occupation.toLowerCase() : "";
    const rawText = typeof profile.raw_text === "string" ? profile.raw_text.toLowerCase() : "";

    // Occupation match
    if (
      el.occupation?.includes("all") ||
      (occ && el.occupation?.some((o) => occ.includes(o.toLowerCase())))
    ) {
      score += 30;
      reasons.push("Occupation matches");
    } else if (occ) {
      const tagMatch = scheme.tags?.some((t) => rawText.includes(t.toLowerCase()) || occ.includes(t.toLowerCase()));
      if (tagMatch) {
        score += 15;
        reasons.push("Related to user profile");
      }
    }

    // State match
    const userState = typeof profile.state === "string" ? profile.state.toUpperCase() : null;
    if (scheme.state === "all" || scheme.level === "central") {
      score += 20;
    } else if (userState && scheme.state.toUpperCase() === userState) {
      score += 25;
      reasons.push(`State specific (${userState})`);
    } else if (userState && scheme.state !== "all" && scheme.state.toUpperCase() !== userState) {
      score -= 50; // Ineligible state
    }

    // Income match
    const userIncome = typeof profile.income === "number" ? profile.income : null;
    if (el.maxIncome && userIncome) {
      if (userIncome <= el.maxIncome) {
        score += 20;
        reasons.push(`Income within ₹${(el.maxIncome / 100000).toFixed(1)}L limit`);
      } else {
        score -= 40;
      }
    } else if (!el.maxIncome) {
      score += 10;
    }

    // Gender match
    const userGender = typeof profile.gender === "string" ? profile.gender.toLowerCase() : null;
    if (el.gender && userGender) {
      if (el.gender === "all" || el.gender === userGender) {
        score += 10;
        if (el.gender === "female") reasons.push("Women-focused initiative");
      } else {
        score -= 50;
      }
    }

    // BPL match
    if (el.bpl && profile.bpl) {
      score += 15;
      reasons.push("BPL / EWS eligible");
    }

    return {
      ...scheme,
      score: Math.max(0, Math.min(99, score)),
      reasons,
    };
  });

  return scored
    .filter((s) => s.score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);
}

export const matchSchemes = matchSchemesRuleBased;

export function getCandidatesForRAG(profile: Record<string, unknown>): Scheme[] {
  return schemes
    .filter((s) => {
      const pState = typeof profile.state === "string" ? profile.state.toLowerCase() : null;
      if (pState && s.state !== "all" && s.state.toLowerCase() !== pState) {
        return false;
      }
      return true;
    })
    .slice(0, 40);
}
