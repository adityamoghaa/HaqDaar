"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Clock,
  ExternalLink,
  Calendar,
  CheckCheck,
  AlertTriangle,
  Sparkles,
  X,
} from "lucide-react";
import newsData from "@/data/news-ticker.json";

interface NotificationItem {
  id: string;
  type: string;
  urgency: "high" | "medium" | "low";
  text: string;
  textHindi?: string;
  schemeId?: string;
  url?: string;
  expiresAt?: string;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items = (newsData.items as NotificationItem[]) || [];
  const unreadCount = items.filter((item) => !readIds.includes(item.id)).length;

  const markAllRead = () => {
    setReadIds(items.map((i) => i.id));
  };

  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      setReadIds([...readIds, id]);
    }
  };

  const createGoogleCalendarLink = (item: NotificationItem) => {
    const title = encodeURIComponent(`Government Scheme Deadline: ${item.text.replace(/^[^\w]+/, "").slice(0, 50)}`);
    const details = encodeURIComponent(`${item.text}\n\nOfficial Portal: ${item.url || "https://haqdaar.org"}\nVerified by HaqDaar AI`);
    const dateStr = item.expiresAt ? item.expiresAt.replace(/-/g, "") : "20270331";
    const dates = `${dateStr}T090000Z/${dateStr}T100000Z`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
        aria-label="Scheme Deadlines and Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-lg animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-gray-900 border border-white/15 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs">
                ⏰
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Deadlines & Updates</h4>
                <p className="text-[10px] text-gray-400">{unreadCount} active government notices</p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
            {items.map((item) => {
              const isRead = readIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-3 rounded-2xl border transition-all text-xs space-y-2 ${
                    isRead
                      ? "bg-white/[0.02] border-white/5 opacity-70"
                      : "bg-white/5 border-white/10 hover:border-orange-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          item.urgency === "high"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : item.urgency === "medium"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {item.type.replace("_", " ")}
                      </span>
                      {item.expiresAt && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Due: {item.expiresAt}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-200 leading-snug font-medium">{item.text}</p>
                  {item.textHindi && (
                    <p className="text-[11px] text-gray-400 leading-tight">{item.textHindi}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                      >
                        <span>Apply / Verify</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <a
                      href={createGoogleCalendarLink(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 ml-auto"
                      title="Add deadline to Google Calendar"
                    >
                      <Calendar className="w-3 h-3 text-orange-400" />
                      <span>Reminder</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
