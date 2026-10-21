"use client";

import React, { useRef, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { useRouter } from "next/navigation";
import useClickOutside from "@/hooks/useClickOutside";
import {
  ArrowLeft,
  Search,
  Mic,
  MessageSquare,
  Globe,
  Sparkles,
  Layers,
  RotateCcw,
} from "lucide-react";
import useAppStore from "@/stores/appStore";

const transition = {
  type: "spring" as const,
  bounce: 0.15,
  duration: 0.35,
};

function ToolbarButton({
  children,
  onClick,
  disabled,
  ariaLabel,
  active,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      className={`relative flex h-10 w-10 shrink-0 scale-100 select-none appearance-none items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
        active
          ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
          : "text-gray-400 hover:bg-white/10 hover:text-white"
      } active:scale-95 disabled:pointer-events-none disabled:opacity-40 ${className}`}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {children}
    </button>
  );
}

export default function ToolbarDynamic() {
  const router = useRouter();
  const { language, setLanguage, resetApp } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => {
    setIsOpen(false);
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/schemes?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "hi" ? "en" : "hi");
  };

  return (
    <MotionConfig transition={transition}>
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 select-none"
        ref={containerRef}
      >
        <div className="h-full rounded-2xl border border-white/15 bg-gray-950/85 backdrop-blur-2xl shadow-2xl shadow-black/60 p-1">
          <motion.div
            animate={{
              width: isOpen ? 380 : 270,
            }}
            initial={false}
            className="overflow-hidden"
          >
            <div className="p-1">
              {!isOpen ? (
                <div className="flex items-center justify-between gap-1">
                  {/* Home / HaqDaar Brand Button */}
                  <ToolbarButton
                    onClick={() => router.push("/")}
                    ariaLabel="HaqDaar Home"
                    className="hover:scale-105"
                  >
                    <span className="text-sm" role="img" aria-label="India flag">🇮🇳</span>
                  </ToolbarButton>

                  {/* Voice Button */}
                  <ToolbarButton
                    onClick={() => router.push("/voice")}
                    ariaLabel="AI Voice Assistant"
                    className="bg-gradient-to-tr from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30 hover:scale-105 shadow-sm"
                  >
                    <Mic className="h-4 w-4 animate-pulse" />
                  </ToolbarButton>

                  {/* Chat Button */}
                  <ToolbarButton
                    onClick={() => router.push("/chat")}
                    ariaLabel="Smart Chat"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </ToolbarButton>

                  {/* Search Expand */}
                  <ToolbarButton
                    onClick={() => setIsOpen(true)}
                    ariaLabel="Search Schemes"
                  >
                    <Search className="h-4 w-4" />
                  </ToolbarButton>

                  {/* All Schemes Directory */}
                  <ToolbarButton
                    onClick={() => router.push("/schemes")}
                    ariaLabel="All 150+ Schemes"
                  >
                    <Layers className="h-4 w-4" />
                  </ToolbarButton>

                  {/* Language Toggle */}
                  <ToolbarButton
                    onClick={toggleLanguage}
                    ariaLabel={`Language: ${language === "hi" ? "Hindi" : "English"}`}
                    className="text-[11px] font-bold"
                  >
                    <span>{language === "hi" ? "हि" : "EN"}</span>
                  </ToolbarButton>
                </div>
              ) : (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center gap-2 w-full"
                >
                  <ToolbarButton
                    onClick={() => setIsOpen(false)}
                    ariaLabel="Back"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </ToolbarButton>

                  <div className="relative flex-1">
                    <input
                      type="text"
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        language === "hi"
                          ? "योजना खोजें (जैसे: किसान, छात्रवृत्ति)..."
                          : "Search 150+ schemes (e.g. Kisan, PMAY)..."
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    className="h-10 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors shrink-0"
                  >
                    Go
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
