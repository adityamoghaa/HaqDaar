"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlowEffectProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
  glowColor?: "saffron" | "emerald" | "rainbow" | "orange";
  color?: string;
  blur?: number;
}

export function GlowEffect({
  children,
  active = false,
  className = "",
  glowColor,
  color,
  blur = 16,
}: GlowEffectProps) {
  const chosenColor = (color === "orange" ? "saffron" : color || glowColor || "saffron") as
    | "saffron"
    | "emerald"
    | "rainbow";

  const gradientMap: Record<string, string> = {
    saffron: "from-amber-500 via-orange-500 to-amber-600",
    orange: "from-amber-500 via-orange-500 to-amber-600",
    emerald: "from-emerald-400 via-teal-500 to-green-500",
    rainbow: "from-orange-500 via-amber-400 via-emerald-400 to-indigo-500",
  };

  const gradient = gradientMap[chosenColor] || gradientMap.saffron;

  return (
    <div className={`relative ${className}`}>
      {/* Animated Glow Aura */}
      {active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: [0.6, 0.9, 0.6], scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute -inset-[2px] rounded-[inherit] bg-gradient-to-r ${gradient} pointer-events-none -z-10`}
          style={{
            filter: `blur(${blur}px)`,
          }}
        />
      )}

      {/* Inner Container */}
      <div className="relative rounded-[inherit] h-full w-full">
        {children}
      </div>
    </div>
  );
}

export default GlowEffect;
