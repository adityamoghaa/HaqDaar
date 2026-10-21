"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  ExternalLink,
  FileText,
  ChevronRight,
  Sparkles,
  CheckCircle,
  Building2,
  X,
  Bookmark,
  Scale,
  Share2,
  Check,
  ArrowRight,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import { schemes, categories, Scheme } from "@/lib/schemeSearch";
import AnimatedTabs from "@/components/ui/AnimatedTabs";
import ToolbarDynamic from "@/components/ui/ToolbarDynamic";
import SchemeShareModal from "@/components/features/SchemeShareModal";
import { useDashboardStore } from "@/lib/dashboardStore";
import { useComparisonStore } from "@/lib/comparisonStore";

export default function SchemesDirectoryPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [activeModalScheme, setActiveModalScheme] = useState<Scheme | null>(null);
  const [shareScheme, setShareScheme] = useState<Scheme | null>(null);

  const { addScheme, removeScheme, isSaved } = useDashboardStore();
  const { selectedIds, addSchemeToCompare, removeSchemeFromCompare, isCompared } = useComparisonStore();

  const statesList = useMemo(() => {
    const set = new Set<string>();
    schemes.forEach((s) => {
      if (s.state && s.state !== "all") set.add(s.state);
    });
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    return schemes.filter((s) => {
      if (selectedCategory !== "all" && s.category !== selectedCategory) return false;
      if (
        selectedState !== "all" &&
        s.state !== "all" &&
        s.state.toLowerCase() !== selectedState.toLowerCase()
      ) {
        return false;
      }
      if (selectedLevel !== "all" && s.level !== selectedLevel) return false;

      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q) || (s.nameHindi && s.nameHindi.includes(q));
        const matchesBenefit = s.benefit.toLowerCase().includes(q);
        const matchesTags = s.tags && s.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesBenefit && !matchesTags) return false;
      }

      return true;
    });
  }, [query, selectedCategory, selectedState, selectedLevel]);

  const categoryTabs = [
    { id: "all", label: `All Schemes (${schemes.length})` },
    { id: "agriculture", label: "🌾 Agriculture" },
    { id: "health", label: "🏥 Health" },
    { id: "scholarship", label: "🎓 Education" },
    { id: "housing", label: "🏠 Housing" },
    { id: "women", label: "👩 Women & Child" },
    { id: "financial", label: "🏦 Financial" },
    { id: "startup", label: "🚀 MSME & Startup" },
    { id: "skill", label: "🔧 Skills & Jobs" },
    { id: "energy", label: "⚡ Energy" },
    { id: "tribal", label: "🏔️ Tribal Welfare" },
    { id: "senior", label: "👴 Senior Citizens" },
    { id: "disability", label: "♿ Disability" },
    { id: "food", label: "🍚 Food & Nutrition" },
    { id: "digital", label: "📱 Digital India" },
    { id: "transport", label: "🚌 Transport" },
    { id: "social_welfare", label: "🤝 Social Welfare" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col selection:bg-orange-500 selection:text-white pb-20 pt-4">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-300">
            <span>Official Gazette Index</span>
            <span className="text-gray-500">•</span>
            <span className="text-orange-400">{schemes.length} Programs Documented</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Welfare Scheme Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl">
            Explore verified central and state welfare initiatives. Filter by jurisdiction, category, or search directly for benefits.
          </p>
        </div>

        {/* Animated Category Tabs */}
        <div className="mb-6 overflow-x-auto pb-1 scrollbar-none">
          <AnimatedTabs
            tabs={categoryTabs}
            activeTab={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>

        {/* ─── Search & Filters Bar ─────────────────────────────────── */}
        <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4 sm:p-5 mb-8 backdrop-blur-md shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search scheme name, benefit..."
                className="w-full bg-gray-950 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="all">All Categories ({schemes.length})</option>
                {Object.entries(categories).map(([k, cat]) => (
                  <option key={k} value={k}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="all">All States & Central</option>
                {statesList.map((st) => (
                  <option key={st} value={st}>
                    {st} State Schemes
                  </option>
                ))}
              </select>
            </div>

            {/* Central vs State */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full bg-gray-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
              >
                <option value="all">All Levels (Central & State)</option>
                <option value="central">Central Government Only</option>
                <option value="state">State Specific Only</option>
              </select>
            </div>
          </div>

          {/* Active Filter Summary */}
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span>
              Showing <strong className="text-white">{filtered.length}</strong> of {schemes.length} schemes
            </span>
            {(selectedCategory !== "all" || selectedState !== "all" || selectedLevel !== "all" || query) && (
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedState("all");
                  setSelectedLevel("all");
                  setQuery("");
                }}
                className="text-orange-400 hover:text-orange-300 font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* ─── Scheme Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-gray-900/60 border border-white/10 hover:border-orange-500/30 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/5 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-gray-300 uppercase tracking-wider">
                    {s.category}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-gray-400 capitalize">
                    {s.level === "central" ? "Central" : `${s.state} State`}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors leading-snug">
                  {s.name}
                </h3>
                {s.nameHindi && (
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{s.nameHindi}</p>
                )}

                {s.departmentLogo ? (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md overflow-hidden border border-white/10 shrink-0">
                      <Image
                        src={s.departmentLogo}
                        alt={s.department || ""}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 truncate">{s.department}</span>
                  </div>
                ) : s.department ? (
                  <div className="mt-2 text-[11px] text-gray-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3 opacity-60" />
                    <span className="truncate">{s.department}</span>
                  </div>
                ) : null}

                <div className="mt-3.5 p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold mb-1">
                    Direct Benefit
                  </span>
                  <p className="text-xs font-medium text-emerald-300 leading-relaxed line-clamp-3">
                    {s.benefit}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => setActiveModalScheme(s)}
                  className="flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5 text-orange-400" />
                </button>

                {/* Save to Vault */}
                <button
                  onClick={() => (isSaved(s.id) ? removeScheme(s.id) : addScheme(s.id))}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isSaved(s.id)
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10"
                  }`}
                  title={isSaved(s.id) ? "Saved in My Vault" : "Save to My Vault"}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>

                {/* Compare */}
                <button
                  onClick={() => (isCompared(s.id) ? removeSchemeFromCompare(s.id) : addSchemeToCompare(s.id))}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isCompared(s.id)
                      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10"
                  }`}
                  title={isCompared(s.id) ? "Added to Compare" : "Compare Side-by-Side"}
                >
                  <Scale className="w-3.5 h-3.5" />
                </button>

                {/* Share on WhatsApp / Social */}
                <button
                  onClick={() => setShareScheme(s)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-emerald-400 border border-white/10 transition-all cursor-pointer"
                  title="Share Scheme"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                {s.apply_url && (
                  <a
                    href={s.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 transition-all"
                    title="Official Portal"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ─── Scheme Modal ────────────────────────────────────────── */}
        {activeModalScheme && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="bg-gray-900 border border-white/15 rounded-2xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl space-y-5 my-8">
              <button
                onClick={() => setActiveModalScheme(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  {activeModalScheme.category} • {activeModalScheme.level}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                  {activeModalScheme.name}
                </h2>
                {activeModalScheme.nameHindi && (
                  <p className="text-sm text-gray-400">{activeModalScheme.nameHindi}</p>
                )}
              </div>

              {activeModalScheme.department && (
                <div className="flex items-center gap-2.5 text-xs text-gray-300">
                  {activeModalScheme.departmentLogo && (
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0 shadow-md">
                      <Image
                        src={activeModalScheme.departmentLogo}
                        alt={activeModalScheme.department}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase tracking-wider block">Department</span>
                    <span className="text-white font-medium">{activeModalScheme.department}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Benefit Outlay
                </h4>
                <p className="text-sm text-emerald-300 leading-relaxed font-medium">
                  {activeModalScheme.benefit}
                </p>
              </div>

              {/* Eligibility Criteria */}
              <div className="space-y-2 p-3.5 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Eligibility Criteria
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  {activeModalScheme.eligibility?.occupation && (
                    <div>
                      <span className="text-gray-400">Occupation:</span>{" "}
                      <span className="text-white capitalize">
                        {activeModalScheme.eligibility.occupation.join(", ")}
                      </span>
                    </div>
                  )}
                  {activeModalScheme.eligibility?.maxIncome && (
                    <div>
                      <span className="text-gray-400">Income Cap:</span>{" "}
                      <span className="text-white">
                        ₹{(activeModalScheme.eligibility.maxIncome / 100000).toFixed(1)} Lakh/yr
                      </span>
                    </div>
                  )}
                  {activeModalScheme.eligibility?.gender && (
                    <div>
                      <span className="text-gray-400">Gender:</span>{" "}
                      <span className="text-white capitalize">
                        {activeModalScheme.eligibility.gender}
                      </span>
                    </div>
                  )}
                  {activeModalScheme.eligibility?.bpl && (
                    <div>
                      <span className="text-gray-400">BPL Priority:</span>{" "}
                      <span className="text-emerald-400">Yes</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              {activeModalScheme.documents && activeModalScheme.documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Documents Required</span>
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                    {activeModalScheme.documents.map((doc, i) => (
                      <li key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() =>
                    isSaved(activeModalScheme.id)
                      ? removeScheme(activeModalScheme.id)
                      : addScheme(activeModalScheme.id)
                  }
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isSaved(activeModalScheme.id)
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isSaved(activeModalScheme.id) ? "Saved in Vault" : "Save to Vault"}</span>
                </button>

                <button
                  onClick={() =>
                    isCompared(activeModalScheme.id)
                      ? removeSchemeFromCompare(activeModalScheme.id)
                      : addSchemeToCompare(activeModalScheme.id)
                  }
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isCompared(activeModalScheme.id)
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isCompared(activeModalScheme.id) ? "In Compare" : "Compare"}</span>
                </button>

                <button
                  onClick={() => setShareScheme(activeModalScheme)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp</span>
                </button>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => setActiveModalScheme(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  Close
                </button>

                {activeModalScheme.apply_url && (
                  <a
                    href={activeModalScheme.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20 flex items-center gap-2"
                  >
                    <span>Visit Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Comparison Sticky Bar */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <Link
              href="/compare"
              className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-2xl shadow-orange-500/40 border border-white/20 hover:scale-105 transition-transform"
            >
              <Scale className="w-4 h-4" />
              <span>Compare {selectedIds.length} Schemes Side-by-Side</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Social / WhatsApp Share Modal */}
        <SchemeShareModal scheme={shareScheme} onClose={() => setShareScheme(null)} />
      </main>

      {/* Floating Dynamic Toolbar */}
      <ToolbarDynamic />

      <Footer />
    </div>
  );
}
