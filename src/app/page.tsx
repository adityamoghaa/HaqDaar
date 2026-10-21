"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mic,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import useAppStore from "@/stores/appStore";
import useChatStore from "@/stores/chatStore";
import { categories, schemes } from "@/lib/schemeSearch";
import { GovernmentLogosMarquee } from "@/components/ui/InfiniteSlider";
import ToolbarDynamic from "@/components/ui/ToolbarDynamic";
import { NewsTickerBar } from "@/components/ui/NewsTicker";
import { TextShimmer } from "@/components/ui/TextShimmer";
import { TextEffect } from "@/components/ui/TextEffect";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { AnimatedTabs, TabItem } from "@/components/ui/AnimatedTabs";
import { GlowEffect } from "@/components/ui/GlowEffect";

const samplePrompts = [
  {
    text: "Main UP ka kisan hoon, 3 bacche hain, income 80,000 saal ki hai",
    lang: "hi",
    label: "🌾 Farmer from Uttar Pradesh",
  },
  {
    text: "I am a female college student in Maharashtra, SC category, annual income 1.5 Lakh",
    lang: "en",
    label: "🎓 Student Scholarship Search",
  },
  {
    text: "मैं दिल्ली में छोटा व्यापार शुरू करना चाहता हूँ, ₹2 लाख का लोन चाहिए",
    lang: "hi",
    label: "🚀 Small Business / Mudra Loan",
  },
  {
    text: "I am a senior citizen aged 65 from Rajasthan, seeking pension & medical coverage",
    lang: "en",
    label: "👵 Senior Citizen Healthcare",
  },
];

const categoryIcons: Record<string, string> = {
  agriculture: "🌾",
  health: "💊",
  scholarship: "🎓",
  housing: "🏠",
  startup: "🚀",
  financial: "🏦",
  women: "👩",
  skill: "🛠️",
  senior: "🧓",
  disability: "♿",
  food: "🍚",
  social_welfare: "🤝",
};

export default function HomePage() {
  const router = useRouter();
  const { language, setLanguage } = useAppStore();
  const { initChat, setPendingMessage } = useChatStore();
  const [quickOccupation, setQuickOccupation] = useState("farmer");
  const [quickState, setQuickState] = useState("UP");
  const [selectedTabCategory, setSelectedTabCategory] = useState("all");
  const [isSubmittingQuickCheck, setIsSubmittingQuickCheck] = useState(false);

  const handleLaunchPrompt = (promptText: string, lang: string) => {
    setLanguage(lang);
    initChat(lang, promptText);
    setPendingMessage(promptText);
    router.push("/chat");
  };

  const handleQuickMatch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingQuickCheck(true);
    const prompt = `I am a ${quickOccupation} from ${quickState}. What government schemes and financial assistance do I qualify for?`;
    setTimeout(() => {
      handleLaunchPrompt(prompt, language);
    }, 400);
  };

  const countByCategory = (cat: string) => schemes.filter(s => s.category === cat).length;

  const tabItems: TabItem[] = [
    { id: "all", label: "All Schemes", count: schemes.length },
    { id: "agriculture", label: "Agriculture", icon: "🌾", count: countByCategory("agriculture") },
    { id: "health", label: "Health", icon: "💊", count: countByCategory("health") },
    { id: "scholarship", label: "Education", icon: "🎓", count: countByCategory("scholarship") },
    { id: "housing", label: "Housing", icon: "🏠", count: countByCategory("housing") },
    { id: "women", label: "Women & Child", icon: "👩", count: countByCategory("women") },
    { id: "startup", label: "MSME & Startup", icon: "🚀", count: countByCategory("startup") },
    { id: "financial", label: "Financial", icon: "🏦", count: countByCategory("financial") },
    { id: "skill", label: "Skills & Jobs", icon: "🔧", count: countByCategory("skill") },
    { id: "energy", label: "Energy", icon: "⚡", count: countByCategory("energy") },
    { id: "tribal", label: "Tribal Welfare", icon: "🏔️", count: countByCategory("tribal") },
    { id: "digital", label: "Digital India", icon: "📱", count: countByCategory("digital") },
    { id: "transport", label: "Transport", icon: "🚌", count: countByCategory("transport") },
  ];

  const displayedSchemes = schemes.filter(
    (s) => selectedTabCategory === "all" || s.category === selectedTabCategory
  ).slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col selection:bg-orange-500 selection:text-white pb-24">
      <main className="flex-1">
        {/* ─── Hero Section ────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-16 pb-16 md:pt-28 md:pb-24">
          {/* Ambient Glowing Orbs */}
          <div className="absolute top-1/4 -left-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              {/* Main Headline with TextEffect */}
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] text-balance">
                <TextEffect per="word">Every Government Scheme You Deserve.</TextEffect>{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-400">
                  In Your Voice.
                </span>
              </h1>

              {/* Subhead */}
              <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed text-balance">
                Speak or chat in Hindi, English, or your regional mother tongue. HaqDaar listens to your family background, checks eligibility criteria, and unlocks your rightful welfare benefits.
              </p>

              {/* Primary Call to Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/voice"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Mic className="w-4 h-4 animate-pulse" />
                  <span>{language === "hi" ? "आवाज़ में बात करें" : "Speak to AI Voice"}</span>
                </Link>

                <Link
                  href="/chat"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/15 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{language === "hi" ? "चैट शुरू करें" : "Start Smart Chat"}</span>
                </Link>

                <Link
                  href="/schemes"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm text-gray-300 hover:text-white bg-transparent hover:bg-white/5 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span>{language === "hi" ? "योजनाएं देखें" : "Browse All 150+"}</span>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="pt-2 flex items-center justify-center gap-6 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% Free & No Aadhaar Upload</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Gemini Multimodal Eligibility Matching</span>
                </div>
              </div>
            </div>

            {/* ─── Interactive Quick Check Card with GlowEffect ───── */}
            <div className="mt-12 max-w-3xl mx-auto">
              <GlowEffect active={isSubmittingQuickCheck} glowColor="saffron" blur={20}>
                <div className="rounded-2xl border border-white/15 bg-gray-950/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Instant Scheme Checker</h3>
                        <p className="text-xs text-gray-400">Test what you qualify for in 1 click</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      Live Verification
                    </span>
                  </div>

                  <form onSubmit={handleQuickMatch} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1.5">
                        Occupation
                      </label>
                      <select
                        value={quickOccupation}
                        onChange={(e) => setQuickOccupation(e.target.value)}
                        className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                      >
                        <option value="farmer">Farmer / किसान (Kisan)</option>
                        <option value="student">Student / छात्र (Scholarships)</option>
                        <option value="daily wage laborer">Daily Wage Laborer / मजदूर</option>
                        <option value="small business owner">Small Business / MSME Owner</option>
                        <option value="unemployed youth">Unemployed Youth / Jobseeker</option>
                        <option value="senior citizen">Senior Citizen (60+)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1.5">
                        State / Union Territory
                      </label>
                      <select
                        value={quickState}
                        onChange={(e) => setQuickState(e.target.value)}
                        className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                      >
                        <option value="UP">Uttar Pradesh (उत्तर प्रदेश)</option>
                        <option value="MH">Maharashtra (महाराष्ट्र)</option>
                        <option value="RJ">Rajasthan (राजस्थान)</option>
                        <option value="TN">Tamil Nadu (தமிழ்நாடு)</option>
                        <option value="WB">West Bengal (পশ্চিমবঙ্গ)</option>
                        <option value="DL">Delhi NCR (दिल्ली)</option>
                        <option value="BR">Bihar (बिहार)</option>
                        <option value="MP">Madhya Pradesh (मध्य प्रदेश)</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={isSubmittingQuickCheck}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer h-[42px]"
                      >
                        <span>{isSubmittingQuickCheck ? "Checking..." : "Find My Schemes"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>

                  {/* Sample Real Citizen Prompts */}
                  <div className="mt-5 pt-4 border-t border-white/5">
                    <p className="text-[11px] font-medium text-gray-400 mb-2.5">
                      Or try asking like real citizens:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {samplePrompts.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleLaunchPrompt(p.text, p.lang)}
                          className="text-[11px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-left flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{p.label}</span>
                          <ChevronRight className="w-3 h-3 text-orange-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </GlowEffect>
            </div>
          </div>
        </section>

        {/* ─── LIVE News Ticker Bar ──────────────────────────────── */}
        <section className="my-4">
          <div className="text-center mb-2">
            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
              Scheme Updates • Deadlines • New Additions
            </span>
          </div>
          <NewsTickerBar />
        </section>

        {/* ─── 1. Infinite Scroll Bar with Government Department Logos ── */}
        <section className="my-4">
          <div className="text-center mb-3">
            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
              Covering Welfare Schemes From Government of India Ministries
            </span>
          </div>
          <GovernmentLogosMarquee />
        </section>

        {/* ─── 6. Animated Numbers Stats Bar ───────────────────────── */}
        <section className="border-y border-white/10 bg-white/[0.02] py-10 my-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                  <AnimatedNumber value={150} suffix="+" />
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-1.5">
                  Verified Schemes
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-5xl font-black text-white">
                  <AnimatedNumber value={10000} prefix="₹" suffix="+ Cr" />
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-1.5">
                  Welfare Outlay Mapped
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                  <AnimatedNumber value={15} suffix=" Sectors" />
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-1.5">
                  Focus Categories
                </div>
              </div>

              <div>
                <div className="text-3xl sm:text-5xl font-black text-white">
                  100% Free
                </div>
                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-1.5">
                  Public Civic Access
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. Animated Tab Hovers for Scheme Exploration ───────── */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
                Explore Schemes
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Welfare Initiatives by Category
              </h2>
            </div>
            <Link
              href="/schemes"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300"
            >
              <span>View Full Directory (150+ Schemes)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Animated Tabs Hover Indicator */}
          <div className="mb-6">
            <AnimatedTabs
              tabs={tabItems}
              activeId={selectedTabCategory}
              onChange={(id) => setSelectedTabCategory(id)}
              layoutId="home-category-tabs"
            />
          </div>

          {/* Filtered Schemes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedSchemes.map((s, idx) => (
              <div
                key={`${s.id}-${idx}`}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl">{categoryIcons[s.category] || "📋"}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-gray-300 uppercase">
                      {s.level}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors leading-snug">
                    {s.name}
                  </h3>
                  {s.nameHindi && (
                    <p className="text-[11px] text-gray-400 mt-0.5">{s.nameHindi}</p>
                  )}
                  <p className="text-xs text-emerald-300/90 font-medium mt-3 line-clamp-2">
                    {s.benefit}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <Link
                    href={`/schemes`}
                    className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                  {s.apply_url && (
                    <span className="text-[10px] text-gray-400">Official Portal</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ─── 2. Motion Primitives Dynamic Toolbar ───────────────────── */}
      <ToolbarDynamic />

      <Footer />
    </div>
  );
}
