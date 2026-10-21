"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Copy, Check, Share2, MessageCircle, Send, Building2 } from "lucide-react";
import { Scheme } from "@/lib/schemeSearch";

interface SchemeShareModalProps {
  scheme: Scheme | null;
  onClose: () => void;
}

export default function SchemeShareModal({ scheme, onClose }: SchemeShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!scheme) return null;

  const generateShareText = () => {
    const lines = [
      `🇮🇳 *${scheme.name}*`,
      scheme.nameHindi ? `_${scheme.nameHindi}_` : "",
      "",
      `🏛️ *Department*: ${scheme.department || "Government of India"}`,
      `📍 *Jurisdiction*: ${scheme.level === "central" ? "Central Government (All India)" : `${scheme.state} State`}`,
      "",
      `💰 *Key Direct Benefit*:`,
      `${scheme.benefit}`,
      "",
      `✅ *Who Qualifies*:`,
      scheme.eligibility.occupation ? `• Occupation: ${scheme.eligibility.occupation.join(", ")}` : "",
      scheme.eligibility.gender && scheme.eligibility.gender !== "all" ? `• Gender: ${scheme.eligibility.gender}` : "",
      scheme.eligibility.minAge || scheme.eligibility.maxAge ? `• Age: ${scheme.eligibility.minAge || 0} to ${scheme.eligibility.maxAge || "No limit"} years` : "",
      scheme.eligibility.maxIncome ? `• Annual Income: Up to ₹${(scheme.eligibility.maxIncome).toLocaleString("en-IN")}` : "",
      scheme.eligibility.caste && !scheme.eligibility.caste.includes("all") ? `• Category: ${scheme.eligibility.caste.join(", ")}` : "",
      "",
      `📋 *Key Documents*: ${scheme.documents.slice(0, 4).join(", ")}`,
      "",
      `🔗 *Apply Online*: ${scheme.apply_url || "https://haqdaar.org"}`,
      "",
      `🔍 Verified via HaqDaar AI — Your Rightful Welfare Engine`,
    ].filter(Boolean);

    return lines.join("\n");
  };

  const shareText = generateShareText();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(scheme.apply_url)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gray-900 border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Share Welfare Scheme</h2>
              <p className="text-[11px] text-gray-400">Share with family, friends, or WhatsApp community groups</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scheme Preview Card */}
        <div className="my-4 p-4 rounded-2xl bg-gray-950 border border-white/10 overflow-y-auto max-h-64 font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed select-all">
          {shareText}
        </div>

        {/* Scheme Badge Overview */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 mb-4">
          {scheme.departmentLogo ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0">
              <Image
                src={scheme.departmentLogo}
                alt={scheme.department || ""}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gray-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">{scheme.name}</div>
            <div className="text-[11px] text-emerald-400 truncate font-semibold">{scheme.benefit}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleTelegramShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all shadow-lg shadow-sky-600/20 active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Telegram</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Card</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
