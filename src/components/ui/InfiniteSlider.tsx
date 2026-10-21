"use client";

import React from "react";
import Image from "next/image";

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
    scheme: "PM-KISAN • Fasal Bima • KCC",
    icon: "🌾",
    logoUrl: "/logos/ministries/agriculture.jpg",
    color: "from-emerald-500/20 to-green-500/10 border-emerald-500/20",
  },
  {
    name: "Ministry of Health & Family Welfare",
    hindi: "स्वास्थ्य एवं परिवार कल्याण मंत्रालय",
    scheme: "Ayushman Bharat PM-JAY",
    icon: "💊",
    logoUrl: "/logos/ministries/health.jpg",
    color: "from-rose-500/20 to-red-500/10 border-rose-500/20",
  },
  {
    name: "Ministry of Education",
    hindi: "शिक्षा मंत्रालय",
    scheme: "National Scholarship Portal • INSPIRE",
    icon: "🎓",
    logoUrl: "/logos/ministries/education.jpg",
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/20",
  },
  {
    name: "Ministry of Housing & Urban Affairs",
    hindi: "आवासन और शहरी कार्य मंत्रालय",
    scheme: "Pradhan Mantri Awas Yojana",
    icon: "🏠",
    logoUrl: "/logos/ministries/housing.jpg",
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/20",
  },
  {
    name: "Ministry of Finance",
    hindi: "वित्त मंत्रालय",
    scheme: "Jan Dhan • Suraksha Bima • APY",
    icon: "🏦",
    logoUrl: "/logos/ministries/finance.jpg",
    color: "from-teal-500/20 to-cyan-500/10 border-teal-500/20",
  },
  {
    name: "Ministry of MSME",
    hindi: "सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय",
    scheme: "PMEGP • Mudra Loan • Vishwakarma",
    icon: "🚀",
    logoUrl: "/logos/ministries/msme.jpg",
    color: "from-purple-500/20 to-violet-500/10 border-purple-500/20",
  },
  {
    name: "Ministry of Women & Child Dev",
    hindi: "महिला एवं बाल विकास मंत्रालय",
    scheme: "Sukanya Samriddhi • Matru Vandana",
    icon: "👩",
    logoUrl: "/logos/ministries/women.jpg",
    color: "from-pink-500/20 to-rose-500/10 border-pink-500/20",
  },
  {
    name: "Ministry of Rural Development",
    hindi: "ग्रामीण विकास मंत्रालय",
    scheme: "MGNREGA • DAY-NRLM • PMAY-G",
    icon: "🚜",
    logoUrl: "/logos/ministries/rural.jpg",
    color: "from-lime-500/20 to-emerald-500/10 border-lime-500/20",
  },
  {
    name: "Social Justice & Empowerment",
    hindi: "सामाजिक न्याय और अधिकारिता",
    scheme: "SC/OBC Pre-Matric & Post-Matric",
    icon: "🤝",
    logoUrl: "/logos/ministries/social_justice.jpg",
    color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/20",
  },
  {
    name: "Ministry of Labour & Employment",
    hindi: "श्रम और रोजगार मंत्रालय",
    scheme: "e-Shram • PM-SYM • ESIC",
    icon: "🔧",
    logoUrl: "/logos/ministries/labour.jpg",
    color: "from-orange-500/20 to-amber-500/10 border-orange-500/20",
  },
  {
    name: "Ministry of Tribal Affairs",
    hindi: "जनजातीय कार्य मंत्रालय",
    scheme: "Van Dhan • Eklavya Schools • ST Scholarships",
    icon: "🏔️",
    logoUrl: "/logos/ministries/tribal.jpg",
    color: "from-emerald-600/20 to-teal-500/10 border-emerald-600/20",
  },
  {
    name: "Ministry of New & Renewable Energy",
    hindi: "नवीन और नवीकरणीय ऊर्जा मंत्रालय",
    scheme: "PM Surya Ghar • PM KUSUM • Green Hydrogen",
    icon: "⚡",
    logoUrl: "/logos/ministries/energy.jpg",
    color: "from-yellow-500/20 to-amber-500/10 border-yellow-500/20",
  },
  {
    name: "Ministry of Road Transport & Highways",
    hindi: "सड़क परिवहन एवं राजमार्ग मंत्रालय",
    scheme: "PM-eBus Sewa • Bharatmala • National Highways",
    icon: "🚌",
    logoUrl: "/logos/ministries/transport.jpg",
    color: "from-sky-500/20 to-blue-500/10 border-sky-500/20",
  },
  {
    name: "Ministry of Electronics & IT (MeitY)",
    hindi: "इलेक्ट्रॉनिक्स एवं सूचना प्रौद्योगिकी मंत्रालय",
    scheme: "Digital India • DigiLocker • UMANG • BharatNet",
    icon: "📱",
    logoUrl: "/logos/ministries/digital.jpg",
    color: "from-cyan-500/20 to-indigo-500/10 border-cyan-500/20",
  },
  {
    name: "Government of India",
    hindi: "भारत सरकार — सत्यमेव जयते",
    scheme: "Official Indian Government Gazette",
    icon: "🇮🇳",
    logoUrl: "/logos/ministries/india_emblem.jpg",
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

      <InfiniteSlider duration={40} gap={16}>
        {GOV_DEPARTMENTS.map((dept, index) => (
          <div
            key={index}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl border bg-gradient-to-br ${dept.color} backdrop-blur-md shrink-0 shadow-sm transition-transform hover:scale-[1.02] cursor-default`}
          >
            {/* Official Ministry Logo */}
            <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-md">
              <Image
                src={dept.logoUrl}
                alt={dept.name}
                width={44}
                height={44}
                className="w-full h-full object-cover"
              />
            </div>
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
