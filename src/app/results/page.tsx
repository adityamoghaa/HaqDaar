"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Search,
  ExternalLink,
  CheckCircle,
  FileText,
  RotateCcw,
  MessageSquare,
  Mic,
  Share2,
  ChevronRight,
  Info,
  X,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import ProfileBadges from "@/components/shared/ProfileBadges";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import useAppStore, { MatchedScheme } from "@/stores/appStore";
import { schemes, matchSchemesRuleBased, categories } from "@/lib/schemeSearch";
import { toast } from "sonner";
import AnimatedTabs from "@/components/ui/AnimatedTabs";
import GlowEffect from "@/components/ui/GlowEffect";
import ToolbarDynamic from "@/components/ui/ToolbarDynamic";

export default function ResultsPage() {
  const router = useRouter();
  const {
    language,
    profile,
    matchedSchemes,
    setMatchedSchemes,
    selectedScheme,
    setSelectedScheme,
    activeFilter,
    setActiveFilter,
  } = useAppStore();

  const [aiExplainingId, setAiExplainingId] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // If no schemes in store, attempt to match from current profile or show high-priority schemes
  useEffect(() => {
    if (matchedSchemes.length === 0) {
      const results = matchSchemesRuleBased(profile);
      if (results.length > 0) {
        setMatchedSchemes(results as unknown as MatchedScheme[]);
      } else {
        // Fallback default set of popular national schemes
        const popular = schemes.slice(0, 10).map((s, idx) => ({
          ...s,
          score: 85 - idx * 3,
          reasons: ["Top nationwide citizen entitlement program"],
        }));
        setMatchedSchemes(popular as unknown as MatchedScheme[]);
      }
    }
  }, [matchedSchemes.length, profile, setMatchedSchemes]);

  const handleExplain = async (scheme: MatchedScheme) => {
    if (explanations[scheme.id]) {
      setSelectedScheme(scheme);
      return;
    }

    setAiExplainingId(scheme.id);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          scheme,
          language,
        }),
      });

      if (!res.ok) throw new Error("Explanation request failed");
      const data = await res.json();
      const text = data.explanation || "Explanation generated.";
      setExplanations((prev) => ({ ...prev, [scheme.id]: text }));
      setSelectedScheme(scheme);
    } catch (err) {
      console.error("AI Explain error:", err);
      toast.error("Could not generate AI explanation. Please try again.");
    } finally {
      setAiExplainingId(null);
    }
  };

  const handleShare = async (scheme: MatchedScheme) => {
    const text = `${scheme.name}: ${scheme.benefit}\nOfficial link: ${scheme.apply_url || "https://myscheme.gov.in"}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: scheme.name, text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Scheme link copied to clipboard!");
    }
  };

  const resultTabs = useMemo(() => [
    { id: "all", label: `All (${matchedSchemes.length})` },
    ...Object.entries(categories)
      .map(([k, cat]) => ({
        id: k,
        label: `${cat.emoji} ${cat.label}`,
      }))
      .filter((t) => t.id === "all" || matchedSchemes.some((s) => s.category === t.id)),
  ], [matchedSchemes]);

  const filteredSchemes = matchedSchemes.filter((s) => {
    if (activeFilter !== "all" && s.category !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = s.name.toLowerCase().includes(q) || (s.nameHindi && s.nameHindi.includes(q));
      const benefitMatch = s.benefit.toLowerCase().includes(q);
      if (!nameMatch && !benefitMatch) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col selection:bg-orange-500 selection:text-white pb-20 pt-4">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ─── Top Header & Profile Banner ──────────────────────────── */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-900/90 to-indigo-950/40 border border-white/10 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Eligibility Analysis Complete</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {language === "hi"
                  ? `आपके लिए ${matchedSchemes.length} योजनाएं पाई गईं`
                  : `Found ${matchedSchemes.length} Schemes For You`}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Ranked by relevance according to your demographic profile, state guidelines, and central rules.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/chat"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                <span>Refine in Chat</span>
              </Link>
              <Link
                href="/voice"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Ask via Voice</span>
              </Link>
            </div>
          </div>

          {/* Extracted Profile Tags */}
          <div className="mt-5 pt-5 border-t border-white/10">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Based on profile:
            </span>
            <ProfileBadges profile={profile} />
          </div>
        </div>

        {/* ─── Search & Category Filters Bar ────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search matched schemes..."
              className="w-full bg-gray-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Animated Category Filter Tabs */}
          <div className="overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <AnimatedTabs
              tabs={resultTabs}
              activeTab={activeFilter}
              onChange={setActiveFilter}
            />
          </div>
        </div>

        {/* ─── Scheme Cards Grid ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchemes.map((scheme) => {
            const hasExplanation = !!explanations[scheme.id];
            const isExplaining = aiExplainingId === scheme.id;

            return (
              <div
                key={scheme.id}
                className="bg-gray-900/60 border border-white/10 hover:border-orange-500/30 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/5 group"
              >
                <div>
                  {/* Top Bar with score & category */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>{scheme.score || 85}% Match</span>
                    </span>

                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 font-medium uppercase tracking-wider">
                      {scheme.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors leading-snug">
                    {scheme.name}
                  </h3>
                  {scheme.nameHindi && (
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{scheme.nameHindi}</p>
                  )}

                  {/* AI match reason */}
                  {(scheme.aiReason || (scheme.reasons && scheme.reasons.length > 0)) && (
                    <div className="mt-3 p-2.5 rounded-lg bg-orange-500/5 border border-orange-500/15 text-[11px] text-orange-200/90 leading-relaxed flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                      <span>{scheme.aiReason || scheme.reasons?.join(". ")}</span>
                    </div>
                  )}

                  {/* Benefit Callout */}
                  <div className="mt-3.5 p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold mb-1">
                      Benefit
                    </span>
                    <p className="text-xs font-medium text-emerald-300 leading-relaxed">
                      {scheme.benefit}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleExplain(scheme)}
                    disabled={isExplaining}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isExplaining ? "Explaining..." : "AI Explain"}</span>
                  </button>

                  {scheme.apply_url && (
                    <a
                      href={scheme.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 transition-all flex items-center gap-1"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <button
                    onClick={() => handleShare(scheme)}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Share Scheme"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Scheme Detail & AI Explanation Modal ─────────────────── */}
        {selectedScheme && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <GlowEffect active={true} color="orange" className="max-w-2xl w-full my-8 rounded-2xl">
              <div className="bg-gray-900 border border-white/15 rounded-2xl w-full p-6 sm:p-8 relative shadow-2xl space-y-5">
                <button
                  onClick={() => setSelectedScheme(null)}
                  className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  {selectedScheme.category} • {selectedScheme.level}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                  {selectedScheme.name}
                </h2>
                {selectedScheme.nameHindi && (
                  <p className="text-sm text-gray-400">{selectedScheme.nameHindi}</p>
                )}
              </div>

              {/* AI Explanation Section */}
              {explanations[selectedScheme.id] && (
                <div className="p-4 rounded-xl bg-gradient-to-b from-orange-500/10 to-amber-500/5 border border-orange-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Personalized AI Guidance</span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-200 leading-relaxed prose prose-invert max-w-none">
                    <MarkdownRenderer content={explanations[selectedScheme.id]} />
                  </div>
                </div>
              )}

              {/* Official Benefit */}
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Benefit Details
                </h4>
                <p className="text-sm text-gray-200 leading-relaxed">
                  {selectedScheme.benefit}
                </p>
              </div>

              {/* Documents Checklist */}
              {selectedScheme.documents && selectedScheme.documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Documents to Keep Ready</span>
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                    {selectedScheme.documents.map((doc, i) => (
                      <li key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Application Modes */}
              {selectedScheme.apply_mode && (
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    How to Apply
                  </h4>
                  <p className="text-xs text-gray-300 capitalize">
                    {selectedScheme.apply_mode.join(" / ")}
                  </p>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedScheme(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  Close
                </button>

                {selectedScheme.apply_url && (
                  <a
                    href={selectedScheme.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20 flex items-center gap-2"
                  >
                    <span>Open Official Application Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
            </GlowEffect>
          </div>
        )}
      </main>

      {/* Floating Dynamic Toolbar */}
      <ToolbarDynamic />

      <Footer />
    </div>
  );
}
