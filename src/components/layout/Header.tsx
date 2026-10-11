"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Mic,
  MessageSquare,
  Search,
  Sparkles,
  RotateCcw,
  Menu,
  X,
  Globe,
} from "lucide-react";
import useAppStore from "@/stores/appStore";

interface HeaderProps {
  showBack?: boolean;
  rightAction?: "reset" | "none";
}

export default function Header({ rightAction = "reset" }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, resetApp, matchedSchemes } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleReset = () => {
    resetApp();
    router.push("/");
  };

  const toggleLanguage = () => {
    setLanguage(language === "hi" ? "en" : "hi");
  };

  const navLinks = [
    { href: "/chat", label: language === "hi" ? "चैट" : "Chat", icon: MessageSquare },
    { href: "/voice", label: language === "hi" ? "वॉइस" : "Voice", icon: Mic },
    { href: "/schemes", label: language === "hi" ? "योजनाएं" : "Schemes", icon: Search },
    ...(matchedSchemes.length > 0
      ? [
          {
            href: "/results",
            label: `${language === "hi" ? "परिणाम" : "Results"} (${matchedSchemes.length})`,
            icon: Sparkles,
          },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-gray-950/75 border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform text-base">
              🇮🇳
            </span>
            <div className="flex flex-col">
              <div className="text-xl font-black tracking-tight leading-none flex items-center gap-0.5">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                  Haq
                </span>
                <span className="text-white">Daar</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                हक़दार • AI Welfare Engine
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                    isActive
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-75" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition-all cursor-pointer"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-orange-400" />
            <span>{language === "hi" ? "हिन्दी" : "English"}</span>
          </button>

          {/* Reset / New Search button */}
          {rightAction === "reset" && pathname !== "/" && (
            <button
              onClick={handleReset}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === "hi" ? "नया खोज" : "New Search"}</span>
            </button>
          )}

          {/* Voice CTA Button */}
          <Link
            href="/voice"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20 transition-all"
          >
            <Mic className="w-3.5 h-3.5 animate-pulse" />
            <span>{language === "hi" ? "बोलें" : "Speak Live"}</span>
          </Link>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-gray-950/95 backdrop-blur-xl px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          {pathname !== "/" && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleReset();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === "hi" ? "नया खोज प्रारंभ करें" : "Start New Search"}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
