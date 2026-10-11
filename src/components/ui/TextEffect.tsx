"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

interface TextEffectProps {
  children: string;
  per?: "word" | "char";
  as?: keyof React.JSX.IntrinsicElements;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  className?: string;
  delay?: number;
}

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: delay,
    },
  }),
};

const defaultItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.35,
      ease: [0.2, 0.65, 0.3, 0.9],
    },
  },
};

export function TextEffect({
  children,
  per = "word",
  as: Component = "span",
  variants,
  className = "",
  delay = 0,
}: TextEffectProps) {
  const container = variants?.container || defaultContainerVariants;
  const item = variants?.item || defaultItemVariants;

  const segments = per === "word" ? children.split(" ") : children.split("");

  const MotionComponent = motion[Component as keyof typeof motion] as any;

  return (
    <MotionComponent
      initial="hidden"
      animate="visible"
      custom={delay}
      variants={container}
      className={`inline-block ${className}`}
    >
      {segments.map((segment, index) => (
        <motion.span
          key={index}
          variants={item}
          className="inline-block"
        >
          {segment}
          {per === "word" && index < segments.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </MotionComponent>
  );
}
