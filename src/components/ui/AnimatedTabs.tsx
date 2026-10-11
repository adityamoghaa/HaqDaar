"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export interface TabItem {
  id: string;
  label: string;
  labelHindi?: string;
  icon?: React.ReactNode;
  count?: number;
}

interface AnimatedTabsProps {
  tabs: TabItem[];
  activeId?: string;
  activeTab?: string;
  onChange: (id: string) => void;
  className?: string;
  layoutId?: string;
}

export function AnimatedTabs({
  tabs,
  activeId,
  activeTab,
  onChange,
  className = "",
  layoutId = "active-tab-indicator",
}: AnimatedTabsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const currentActive = activeId || activeTab || tabs[0]?.id;

  return (
    <div
      className={`flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 overflow-x-auto select-none no-scrollbar ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = currentActive === tab.id;
        const isHovered = hoveredId === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            onMouseEnter={() => setHoveredId(tab.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors duration-200 flex items-center gap-1.5 z-10 cursor-pointer ${
              isActive
                ? "text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {/* Hover Indicator */}
            {isHovered && !isActive && (
              <motion.div
                layoutId={`${layoutId}-hover`}
                className="absolute inset-0 rounded-xl bg-white/5 -z-10"
                transition={{ type: "spring", bounce: 0.15, duration: 0.25 }}
              />
            )}

            {/* Active Pill Indicator */}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/25 -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
              />
            )}

            {tab.icon && <span className="text-sm shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-gray-400"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default AnimatedTabs;
