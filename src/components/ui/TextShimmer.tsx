"use client";

import React from "react";
import { motion } from "framer-motion";

interface TextShimmerProps {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
}

export function TextShimmer({
  children,
  as: Component = "span",
  className = "",
  duration = 2.5,
  spread = 2,
}: TextShimmerProps) {
  return (
    <Component
      className={`inline-block relative overflow-hidden bg-clip-text text-transparent bg-[linear-gradient(110deg,#a1a1aa,45%,#ffffff,55%,#a1a1aa)] [background-size:200%_100%] animate-shimmer ${className}`}
      style={{
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </Component>
  );
}
