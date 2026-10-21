"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Plus,
  ArrowRight,
  CheckCircle,
  Building2,
  ExternalLink,
  Bookmark,
  Trash2,
  Scale,
  Sparkles,
} from "lucide-react";
import { Scheme, schemes } from "@/lib/schemeSearch";
import { useComparisonStore } from "@/lib/comparisonStore";
import { useDashboardStore } from "@/lib/dashboardStore";

export default function SchemeComparison() {
  const {
    selectedSchemes,
    removeSchemeFromCompare,
    addSchemeToCompare,
    clearCompare,
    MAX_COMPARE,
  } = useComparisonStore();
  const { addScheme, isSaved } = useDashboardStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Popular preset comparisons
  const presetComparisons = [
    {
      title: "Farmer Income Support",
      ids: ["PM-KISAN-001", "TS-RYTHUBANDHU-001", "OD-KALIA-001"],
    },
    {
      title: "Universal Health Insurance",
      ids: ["ABPMJAY-001", "RJ-CHIRANJEEVI-001", "MH-MJPJAY-001"],
    },
    {
      title: "Women Basic Income",
      ids: ["TN-MAGALIRURIMAI-001", "KA-GRUHALAKSHMI-001", "MP-LADLIBEHNA-001"],
    },
  ];

  const filteredSchemes = schemes.filter((s) => {
    if (selectedSchemes.some((sel) => sel.id === s.id)) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.state.toLowerCase().includes(q);
  }).slice(0, 8);

  const applyPreset = (ids: string[]) => {
    clearCompare();
    ids.forEach((id) => addSchemeToCompare(id));
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gray-900/60 border border-white/10 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400">
            <Scale className="w-3.5 h-3.5" />
            <span>Side-by-Side Scheme Analyzer</span>
          </div>
          <h2 className="text-2xl font-black text-white">Compare Welfare Programs</h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Evaluate entitlement differences, eligibility criteria, and required paperwork side by side.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedSchemes.length > 0 && (
            <button
              onClick={clearCompare}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          {/* Add Scheme Selector */}
          {selectedSchemes.length < MAX_COMPARE && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Scheme ({selectedSchemes.length}/{MAX_COMPARE})</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-white/15 rounded-2xl shadow-2xl p-3 z-30 space-y-2">
                  <input
                    type="text"
                    placeholder="Search scheme name or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-gray-950 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                    autoFocus
                  />
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {filteredSchemes.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          addSchemeToCompare(s.id);
                          setDropdownOpen(false);
                          setSearchQuery("");
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2 text-xs"
                      >
                        {s.departmentLogo ? (
                          <div className="w-6 h-6 rounded-md overflow-hidden shrink-0 border border-white/10">
                            <Image src={s.departmentLogo} alt="" width={24} height={24} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-[10px]">
                            🏛️
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-white truncate">{s.name}</div>
                          <div className="text-[10px] text-gray-400 capitalize">{s.level === "central" ? "Central" : `${s.state} State`}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preset Quick Comparisons if few selected */}
      {selectedSchemes.length < 2 && (
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Try Popular Side-by-Side Comparisons:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {presetComparisons.map((p) => (
              <button
                key={p.title}
                onClick={() => applyPreset(p.ids)}
                className="p-3 text-left rounded-xl bg-gray-900/80 hover:bg-gray-900 border border-white/10 hover:border-orange-500/40 transition-all text-xs group"
              >
                <div className="font-bold text-white group-hover:text-orange-400 transition-colors">
                  {p.title}
                </div>
                <div className="text-[11px] text-gray-400 mt-1 flex items-center justify-between">
                  <span>3 Verified Programs</span>
                  <ArrowRight className="w-3.5 h-3.5 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Grid Table */}
      {selectedSchemes.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-gray-900/30 border border-dashed border-white/10 space-y-3">
          <Scale className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Schemes Selected for Comparison</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Choose schemes using the button above or browse the directory and click "Compare" on any scheme card.
          </p>
          <Link
            href="/schemes"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors mt-2"
          >
            Browse All 155 Schemes
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[700px] grid grid-cols-4 gap-4">
            {/* Header Column: Labels */}
            <div className="space-y-6 pt-36 text-xs font-bold text-gray-400">
              <div className="h-10 flex items-center">Category & Level</div>
              <div className="h-28 flex items-center">Direct Financial Benefit</div>
              <div className="h-10 flex items-center">Benefit Delivery</div>
              <div className="h-20 flex items-center">Target Occupation</div>
              <div className="h-12 flex items-center">Age Eligibility</div>
              <div className="h-12 flex items-center">Income Cap</div>
              <div className="h-12 flex items-center">Caste / Category</div>
              <div className="h-24 flex items-center">Required Documents</div>
              <div className="h-12 flex items-center">Application Mode</div>
              <div className="h-12 flex items-center">Official Action</div>
            </div>

            {/* Scheme Columns */}
            {selectedSchemes.map((scheme) => {
              const saved = isSaved(scheme.id);
              return (
                <div
                  key={scheme.id}
                  className="bg-gray-900/80 border border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-xl space-y-6"
                >
                  {/* Scheme Card Header */}
                  <div className="h-32 flex flex-col justify-between border-b border-white/10 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0">
                        {scheme.departmentLogo ? (
                          <Image
                            src={scheme.departmentLogo}
                            alt=""
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/10 flex items-center justify-center text-xs">
                            <Building2 className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeSchemeFromCompare(scheme.id)}
                        className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-2 leading-tight">
                        {scheme.name}
                      </h4>
                      {scheme.nameHindi && (
                        <p className="text-[10px] text-gray-400 line-clamp-1">{scheme.nameHindi}</p>
                      )}
                    </div>
                  </div>

                  {/* Category & Level */}
                  <div className="h-10 flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300 uppercase">
                      {scheme.category}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 font-medium capitalize">
                      {scheme.level === "central" ? "Central (India)" : `${scheme.state} State`}
                    </span>
                  </div>

                  {/* Direct Benefit */}
                  <div className="h-28 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300 leading-relaxed overflow-y-auto">
                    {scheme.benefit}
                  </div>

                  {/* Benefit Type */}
                  <div className="h-10 flex items-center text-xs font-medium text-white capitalize">
                    🏷️ {scheme.benefitType.replace("_", " ")}
                  </div>

                  {/* Target Occupation */}
                  <div className="h-20 text-xs text-gray-300 flex items-center">
                    {scheme.eligibility.occupation ? (
                      <span className="capitalize">{scheme.eligibility.occupation.join(", ")}</span>
                    ) : (
                      <span className="text-gray-500">All Occupations / Universal</span>
                    )}
                  </div>

                  {/* Age Eligibility */}
                  <div className="h-12 flex items-center text-xs text-gray-300">
                    {scheme.eligibility.minAge || scheme.eligibility.maxAge ? (
                      <span>
                        {scheme.eligibility.minAge || 0} to {scheme.eligibility.maxAge || "No upper limit"} years
                      </span>
                    ) : (
                      <span className="text-gray-500">All Ages Eligible</span>
                    )}
                  </div>

                  {/* Income Cap */}
                  <div className="h-12 flex items-center text-xs font-medium">
                    {scheme.eligibility.maxIncome ? (
                      <span className="text-amber-300">
                        ≤ ₹{scheme.eligibility.maxIncome.toLocaleString("en-IN")}/year
                      </span>
                    ) : (
                      <span className="text-emerald-400">No Income Restriction</span>
                    )}
                  </div>

                  {/* Caste / Category */}
                  <div className="h-12 flex items-center text-xs text-gray-300">
                    {scheme.eligibility.caste && !scheme.eligibility.caste.includes("all") ? (
                      <span className="font-semibold text-orange-400">
                        {scheme.eligibility.caste.join(", ")}
                      </span>
                    ) : (
                      <span className="text-gray-500">All Categories (Universal)</span>
                    )}
                  </div>

                  {/* Required Documents */}
                  <div className="h-24 text-[11px] text-gray-300 leading-snug overflow-y-auto space-y-1">
                    {scheme.documents.slice(0, 4).map((doc) => (
                      <div key={doc} className="flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{doc}</span>
                      </div>
                    ))}
                  </div>

                  {/* Application Mode */}
                  <div className="h-12 flex items-center text-xs text-gray-300">
                    <span className="truncate">{scheme.apply_mode.join(" • ")}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="h-12 pt-2 border-t border-white/10 flex items-center gap-2">
                    <button
                      onClick={() => addScheme(scheme.id)}
                      className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        saved
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{saved ? "Saved" : "Save"}</span>
                    </button>

                    <a
                      href={scheme.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                      title="Open Official Portal"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
