// Scheme Search Engine — Fuse.js powered fuzzy search + rule-based matching
import Fuse from "fuse.js";
import schemeDatabase from "./schemes.json";

const { schemes, categories } = schemeDatabase;

// ─── Fuse.js Search Index ────────────────────────────────────────────────────
const fuse = new Fuse(schemes, {
  keys: [
    { name: "name", weight: 0.3 },
    { name: "nameHindi", weight: 0.2 },
    { name: "benefit", weight: 0.15 },
    { name: "benefitHindi", weight: 0.1 },
    { name: "tags", weight: 0.15 },
    { name: "description", weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
});

// ─── Search by text query ────────────────────────────────────────────────────
export function searchSchemes(query) {
  if (!query || query.length < 2) return schemes;
  return fuse.search(query).map((r) => r.item);
}

// ─── Filter by category and state ────────────────────────────────────────────
export function filterSchemes({ category, state, level } = {}) {
  return schemes.filter((s) => {
    if (category && category !== "all" && s.category !== category) return false;
    if (state && state !== "all" && s.state !== "all" && s.state !== state)
      return false;
    if (level && level !== "all" && s.level !== level) return false;
    return true;
  });
}

// ─── Rule-based matching (client-side fallback) ──────────────────────────────
export function matchSchemes(profile) {
  const scored = schemes.map((scheme) => {
    let score = 0;
    let reasons = [];
    const el = scheme.eligibility;

    // Occupation match
    if (
      el.occupation?.includes("all") ||
      (profile.occupation &&
        el.occupation?.some((o) =>
          profile.occupation.toLowerCase().includes(o)
        ))
    ) {
      score += 25;
      reasons.push("Occupation matches");
    } else if (profile.occupation) {
      const kwMatch = scheme.tags?.some((kw) =>
        profile.raw_text?.toLowerCase().includes(kw)
      );
      if (kwMatch) {
        score += 15;
        reasons.push("Related activity");
      }
    }

    // Income eligibility
    if (!el.income_max || !profile.income || profile.income <= el.income_max) {
      score += 20;
      reasons.push("Income eligible");
    } else {
      return { ...scheme, score: 0, reasons: ["Income too high"] };
    }

    // Caste match
    if (
      el.caste?.includes("all") ||
      (profile.caste &&
        el.caste?.some(
          (c) => c.toLowerCase() === profile.caste.toLowerCase()
        ))
    ) {
      score += 12;
      reasons.push("Category matches");
    }

    // Age check
    if (profile.age) {
      if (el.age_min && profile.age < el.age_min)
        return { ...scheme, score: 0, reasons: ["Too young"] };
      if (el.age_max && profile.age > el.age_max)
        return { ...scheme, score: 0, reasons: ["Age exceeds limit"] };
      score += 10;
    } else {
      score += 5;
    }

    // Gender check
    if (
      el.gender === "all" ||
      !profile.gender ||
      el.gender === profile.gender
    ) {
      score += 8;
    } else {
      return { ...scheme, score: 0, reasons: ["Gender-specific scheme"] };
    }

    // State match
    if (scheme.state === "all") {
      score += 5;
    } else if (
      profile.state &&
      scheme.state.toLowerCase() === profile.state.toLowerCase()
    ) {
      score += 15;
      reasons.push("Your state scheme");
    } else if (profile.state && scheme.state !== "all") {
      return { ...scheme, score: 0, reasons: ["Different state"] };
    }

    // Special flags
    if (el.widow && profile.widow) {
      score += 20;
      reasons.push("Widow status matches");
    }
    if (el.bpl_card && profile.bpl) {
      score += 15;
      reasons.push("BPL card holder");
    }
    if (el.area && profile.area) {
      if (!el.area.includes(profile.area)) {
        score -= 10;
      } else {
        score += 5;
        reasons.push(`${profile.area} area matches`);
      }
    }

    // Tag/keyword bonus
    if (profile.raw_text) {
      const kwMatches = (scheme.tags || []).filter((kw) =>
        profile.raw_text.toLowerCase().includes(kw)
      ).length;
      score += kwMatches * 3;
    }

    return { ...scheme, score: Math.min(score, 99), reasons };
  });

  return scored
    .filter((s) => s.score >= 25)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);
}

// ─── Get pre-filtered candidates for RAG ─────────────────────────────────────
export function getCandidatesForRAG(profile) {
  // Pre-filter to ~50 candidates for Gemini to re-rank
  return schemes
    .filter((s) => {
      // State filter
      if (
        profile.state &&
        s.state !== "all" &&
        s.state.toLowerCase() !== profile.state.toLowerCase()
      )
        return false;
      // Gender filter
      if (
        s.eligibility.gender !== "all" &&
        profile.gender &&
        s.eligibility.gender !== profile.gender
      )
        return false;
      // Hard age filter
      if (
        profile.age &&
        s.eligibility.age_min &&
        profile.age < s.eligibility.age_min
      )
        return false;
      if (
        profile.age &&
        s.eligibility.age_max &&
        profile.age > s.eligibility.age_max
      )
        return false;
      return true;
    })
    .slice(0, 50);
}

// ─── Exports ─────────────────────────────────────────────────────────────────
export { schemes, categories };
export default { schemes, categories, searchSchemes, filterSchemes, matchSchemes, getCandidatesForRAG };
