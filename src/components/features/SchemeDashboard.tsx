"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  FileText,
  AlertCircle,
  HelpCircle,
  Save,
} from "lucide-react";
import { useDashboardStore, ApplicationStatus } from "@/lib/dashboardStore";

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; labelHindi: string; color: string; badge: string; step: number }
> = {
  saved: {
    label: "Saved / Exploring",
    labelHindi: "सहेजा गया",
    color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    badge: "bg-blue-500",
    step: 1,
  },
  documents_ready: {
    label: "Documents Gathered",
    labelHindi: "दस्तावेज़ तैयार",
    color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    badge: "bg-amber-500",
    step: 2,
  },
  applied: {
    label: "Application Submitted",
    labelHindi: "आवेदन जमा किया",
    color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    badge: "bg-purple-500",
    step: 3,
  },
  benefit_received: {
    label: "Benefit Received! 🎉",
    labelHindi: "लाभ प्राप्त हुआ! 🎉",
    color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    badge: "bg-emerald-500",
    step: 4,
  },
};

export default function SchemeDashboard() {
  const { populated, isLoaded, removeScheme, updateStatus, updateDetails } = useDashboardStore();
  const [filter, setFilter] = useState<"all" | ApplicationStatus>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [appNumberInput, setAppNumberInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  if (!isLoaded) {
    return (
      <div className="py-20 text-center text-gray-500 animate-pulse text-sm">
        Loading your personal welfare vault...
      </div>
    );
  }

  const filteredSchemes = populated.filter((item) => {
    if (filter === "all") return true;
    return item.tracking.status === filter;
  });

  const countByStatus = (st: ApplicationStatus) =>
    populated.filter((p) => p.tracking.status === st).length;

  const totalReceived = countByStatus("benefit_received");
  const inProgress = countByStatus("documents_ready") + countByStatus("applied");

  const startEdit = (schemeId: string, currentApp?: string, currentNotes?: string) => {
    setEditingId(schemeId);
    setAppNumberInput(currentApp || "");
    setNotesInput(currentNotes || "");
  };

  const saveEdit = (schemeId: string) => {
    updateDetails(schemeId, {
      applicationNumber: appNumberInput.trim() || undefined,
      notes: notesInput.trim() || undefined,
    });
    setEditingId(null);
  };

  return (
    <div className="w-full space-y-8">
      {/* Header & Metric Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-900/90 to-gray-950 border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Personal Citizen Locker • 100% Private (Local Device)</span>
            </div>
            <h1 className="text-3xl font-black text-white">My Welfare Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-400">
              Track government applications, manage required certificates, and monitor your direct benefit payouts.
            </p>
          </div>

          <Link
            href="/schemes"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>+ Add More Schemes</span>
          </Link>
        </div>

        {/* Milestone Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Saved</div>
            <div className="text-2xl font-black text-white mt-1">{populated.length}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Programs Bookmarked</div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15">
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">In Progress</div>
            <div className="text-2xl font-black text-amber-300 mt-1">{inProgress}</div>
            <div className="text-[10px] text-amber-400/60 mt-0.5">Paperwork or Applied</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
            <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Claimed / Active</div>
            <div className="text-2xl font-black text-emerald-300 mt-1">{totalReceived}</div>
            <div className="text-[10px] text-emerald-400/60 mt-0.5">Benefits Unlocked</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Completion Rate</div>
            <div className="text-2xl font-black text-orange-400 mt-1">
              {populated.length > 0 ? Math.round((totalReceived / populated.length) * 100) : 0}%
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">Direct Benefit Saturation</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            filter === "all"
              ? "bg-white text-gray-950 font-bold"
              : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
          }`}
        >
          All ({populated.length})
        </button>
        {(["saved", "documents_ready", "applied", "benefit_received"] as ApplicationStatus[]).map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filter === st
                ? "bg-white text-gray-950 font-bold"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {STATUS_CONFIG[st].label} ({countByStatus(st)})
          </button>
        ))}
      </div>

      {/* Schemes List */}
      {filteredSchemes.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-gray-900/30 border border-dashed border-white/10 space-y-4">
          <Bookmark className="w-12 h-12 text-gray-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {populated.length === 0 ? "No Schemes Saved Yet" : "No Schemes with this Status"}
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Explore 155+ central and state schemes in the directory and click "Save to Dashboard" to start tracking your applications.
            </p>
          </div>
          <Link
            href="/schemes"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 transition-all"
          >
            <span>Explore 155+ Programs</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredSchemes.map((scheme) => {
            const statusConfig = STATUS_CONFIG[scheme.tracking.status];
            const isEditing = editingId === scheme.id;

            return (
              <div
                key={scheme.id}
                className="p-5 sm:p-6 rounded-3xl bg-gray-900/70 border border-white/10 hover:border-white/20 transition-all shadow-xl space-y-5"
              >
                {/* Top Row: Info & Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {scheme.departmentLogo ? (
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                        <Image
                          src={scheme.departmentLogo}
                          alt=""
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300 uppercase">
                          {scheme.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-400 capitalize">
                          {scheme.level === "central" ? "Central Government" : `${scheme.state} State`}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">{scheme.name}</h3>
                      {scheme.nameHindi && (
                        <p className="text-xs text-gray-400">{scheme.nameHindi}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={scheme.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors flex items-center gap-1.5"
                    >
                      <span>Apply Online</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => removeScheme(scheme.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove from Dashboard"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Direct Benefit Box */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Guaranteed Benefit: </span>
                    {scheme.benefit}
                  </div>
                </div>

                {/* Interactive Status Stepper */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-gray-300">Update Application Progress:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(["saved", "documents_ready", "applied", "benefit_received"] as ApplicationStatus[]).map((st) => {
                      const isActive = scheme.tracking.status === st;
                      const cfg = STATUS_CONFIG[st];
                      return (
                        <button
                          key={st}
                          onClick={() => updateStatus(scheme.id, st)}
                          className={`p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                            isActive
                              ? `${cfg.color} border-current font-bold shadow-md`
                              : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <div className="text-[10px] opacity-75">Step {cfg.step}</div>
                          <div className="truncate">{cfg.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Application Details / Notes / Reference Number */}
                <div className="p-4 rounded-2xl bg-gray-950/60 border border-white/5 space-y-3">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-gray-400 block mb-1">
                          Application / Acknowledgement Reference Number
                        </label>
                        <input
                          type="text"
                          value={appNumberInput}
                          onChange={(e) => setAppNumberInput(e.target.value)}
                          placeholder="e.g. DL-2026-KISAN-8921"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-gray-900 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-400 block mb-1">
                          Personal Notes / Next Appointment Date
                        </label>
                        <textarea
                          rows={2}
                          value={notesInput}
                          onChange={(e) => setNotesInput(e.target.value)}
                          placeholder="e.g. Document verification camp on Friday at Gram Panchayat office..."
                          className="w-full px-3 py-2 rounded-xl text-xs bg-gray-900 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(scheme.id)}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Details</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="text-gray-400">
                          <span className="font-semibold text-gray-300">Ack No: </span>
                          {scheme.tracking.applicationNumber ? (
                            <span className="font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                              {scheme.tracking.applicationNumber}
                            </span>
                          ) : (
                            <span className="text-gray-500 italic">Not set</span>
                          )}
                        </div>
                        {scheme.tracking.notes && (
                          <div className="text-gray-300 italic">
                            "{scheme.tracking.notes}"
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          startEdit(
                            scheme.id,
                            scheme.tracking.applicationNumber,
                            scheme.tracking.notes
                          )
                        }
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        {scheme.tracking.applicationNumber || scheme.tracking.notes
                          ? "Edit Details"
                          : "+ Add Reference No. or Note"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Required Documents Checklist Reminder */}
                <div className="text-xs text-gray-400 pt-1">
                  <span className="font-semibold text-gray-300">Required Documents: </span>
                  <span>{scheme.documents.join(" • ")}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
