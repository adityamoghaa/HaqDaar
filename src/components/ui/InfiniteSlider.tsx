"use client";

import React from "react";

interface InfiniteSliderProps {
  children?: React.ReactNode;
  gap?: number;
  duration?: number;
  reverse?: boolean;
  className?: string;
}

export const GOV_DEPARTMENTS = [
  {
    name: "Ministry of Agriculture",
    hindi: "कृषि एवं किसान कल्याण मंत्रालय",
    scheme: "PM-KISAN • Fasal Bima",
    icon: "🌾",
    color: "from-emerald-500/20 to-green-500/10 border-emerald-500/20",
  },
  {
    name: "Ministry of Health & Family Welfare",
    hindi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय",
    scheme: "Ayushman Bharat PM-JAY",
    icon: "💊",
    color: "from-rose-500/20 to-red-500/10 border-rose-500/20",
  },
  {
    name: "Ministry of Education",
    hindi: "शिक्षा मंत्रालय",
    scheme: "National Scholarship Portal",
    icon: "🎓",
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/20",
  },
  {
    name: "Ministry of Housing & Urban Affairs",
    hindi: "आवासन और शहरी कार्य मंत्रालय",
    scheme: "Pradhan Mantri Awas Yojana",
    icon: "🏠",
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/20",
  },
  {
    name: "Ministry of Finance",
    hindi: "वित्त मंत्रालय",
    scheme: "Jan Dhan • Suraksha Bima",
    icon: "🏦",
    color: "from-teal-500/20 to-cyan-500/10 border-teal-500/20",
  },
  {
    name: "Ministry of MSME",
    hindi: "सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय",
    scheme: "PMEGP • Mudra Loan",
    icon: "🚀",
    color: "from-purple-500/20 to-violet-500/10 border-purple-500/20",
  },
  {
    name: "Ministry of Women & Child Dev",
    hindi: "महिला एवं बाल विकास मंत्रालय",
    scheme: "Sukanya Samriddhi • Matru Vandana",
    icon: "👩",
    color: "from-pink-500/20 to-rose-500/10 border-pink-500/20",
  },
  {
    name: "Ministry of Rural Development",
    hindi: "ग्रामीण विकास मंत्रालय",
    scheme: "MGNREGA • DAY-NRLM",
    icon: "🚜",
    color: "from-lime-500/20 to-emerald-500/10 border-lime-500/20",
  },
  {
    name: "Social Justice & Empowerment",
    hindi: "सामाजिक न्याय और अधिकारिता",
    scheme: "SC/OBC Pre-Matric & Post-Matric",
    icon: "🤝",
    color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/20",
  },
  {
    name: "myScheme Portal",
    hindi: "नेशनल ई-गवर्नेंस सेवा",
    scheme: "Official Indian Government Gazette",
    icon: "🇮🇳",
    color: "from-orange-500/20 to-amber-500/10 border-orange-500/30",
  },
];

export function InfiniteSlider({
  children,
  gap = 20,
  duration = 30,
  reverse = false,
  className = "",
}: InfiniteSliderProps) {
  return (
    <div className={`overflow-hidden w-full select-none ${className}`}>
      <div
        className="flex shrink-0 w-max hover:[animation-play-state:paused]"
        style={{
          gap: `${gap}px`,
          animation: `infinite-marquee ${duration}s linear infinite ${
            reverse ? "reverse" : "normal"
          }`,
        }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

export function GovernmentLogosMarquee() {
  return (
    <div className="w-full py-6 relative overflow-hidden bg-gradient-to-r from-gray-950 via-gray-900/60 to-gray-950 border-y border-white/5">
      {/* Side Fade Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-gray-950 to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-gray-950 to-transparent" />

      <InfiniteSlider duration={35} gap={16}>
        {GOV_DEPARTMENTS.map((dept, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-gradient-to-br ${dept.color} backdrop-blur-md shrink-0 shadow-sm transition-transform hover:scale-[1.02] cursor-default`}
          >
            <span className="text-xl shrink-0 p-1 rounded-lg bg-white/5">{dept.icon}</span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white tracking-tight leading-tight">
                {dept.name}
              </span>
              <span className="text-[10px] text-gray-400 font-medium leading-tight">
                {dept.hindi}
              </span>
              <span className="text-[9px] text-orange-400 font-medium tracking-wide mt-0.5">
                {dept.scheme}
              </span>
            </div>
          </div>
        ))}
      </InfiniteSlider>
    </div>
  );
}
