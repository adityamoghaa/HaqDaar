"use client";

import React, { useState, useEffect } from "react";
import useAppStore from "@/stores/appStore";
import newsData from "@/data/news-ticker.json";

interface TickerItem {
  id: string;
  type: "deadline" | "update" | "new_scheme" | "application";
  urgency: "high" | "medium" | "low";
  text: string;
  textHindi?: string;
  schemeId?: string;
  url?: string;
  expiresAt?: string;
}

const urgencyStyles: Record<string, { dot: string; text: string; bg: string }> = {
  high: {
    dot: "bg-red-500 animate-pulse",
    text: "text-red-300",
    bg: "bg-red-500/10 border-red-500/20",
  },
  medium: {
    dot: "bg-amber-500",
    text: "text-amber-300",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  low: {
    dot: "bg-emerald-500",
    text: "text-emerald-300",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
};

const typeLabels: Record<string, { label: string; labelHi: string; color: string }> = {
  deadline: { label: "DEADLINE", labelHi: "अंतिम तिथि", color: "text-red-400" },
  update: { label: "UPDATE", labelHi: "अपडेट", color: "text-blue-400" },
  new_scheme: { label: "NEW", labelHi: "नई योजना", color: "text-emerald-400" },
  application: { label: "APPLY", labelHi: "आवेदन", color: "text-amber-400" },
};

function TickerItemCard({ item, language }: { item: TickerItem; language: string }) {
  const urgency = urgencyStyles[item.urgency] || urgencyStyles.medium;
  const typeInfo = typeLabels[item.type] || typeLabels.update;
  const displayText = language === "hi" && item.textHindi ? item.textHindi : item.text;

  const content = (
    <div
      className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-lg border ${urgency.bg} shrink-0 transition-transform hover:scale-[1.01] cursor-pointer backdrop-blur-sm`}
    >
      {/* Urgency dot */}
      <span className={`w-2 h-2 rounded-full ${urgency.dot} shrink-0`} />

      {/* Type badge */}
      <span className={`text-[9px] font-black uppercase tracking-widest ${typeInfo.color} shrink-0`}>
        {language === "hi" ? typeInfo.labelHi : typeInfo.label}
      </span>

      {/* Separator */}
      <span className="text-gray-600 shrink-0">│</span>

      {/* Text */}
      <span className={`text-xs font-medium ${urgency.text} whitespace-nowrap`}>
        {displayText}
      </span>
    </div>
  );

  if (item.url) {
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="no-underline shrink-0">
        {content}
      </a>
    );
  }

  return content;
}

export default function NewsTicker({
  speed = 60,
  className = "",
}: {
  speed?: number;
  className?: string;
}) {
  const { language } = useAppStore();

  const [items, setItems] = useState<TickerItem[]>(newsData.items as TickerItem[]);

  useEffect(() => {
    const now = new Date();
    setItems(
      (newsData.items as TickerItem[]).filter((item) => {
        if (item.expiresAt) {
          return new Date(item.expiresAt) > now;
        }
        return true;
      })
    );
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      className={`w-full overflow-hidden select-none relative ${className}`}
      role="marquee"
      aria-label="Scheme updates and notifications"
    >
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none bg-gradient-to-r from-gray-950 to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none bg-gradient-to-l from-gray-950 to-transparent" />

      {/* Header label */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pl-2 sm:pl-4 pointer-events-none">
        <div className="px-2.5 py-1 rounded-md bg-gray-950/95 border border-white/10 flex items-center gap-1.5 backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
          </span>
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
            {language === "hi" ? "ताज़ा" : "LIVE"}
          </span>
        </div>
      </div>

      {/* Scrolling content */}
      <div
        className="flex items-center gap-4 w-max hover:[animation-play-state:paused] py-2.5"
        style={{
          animation: `news-ticker-scroll ${speed}s linear infinite`,
        }}
      >
        {/* Render items twice for seamless loop */}
        {[...items, ...items].map((item, idx) => (
          <TickerItemCard key={`${item.id}-${idx}`} item={item} language={language} />
        ))}
      </div>
    </div>
  );
}

export function NewsTickerBar() {
  return (
    <div className="w-full bg-gray-950/80 border-y border-white/5 backdrop-blur-md">
      <NewsTicker speed={80} />
    </div>
  );
}
