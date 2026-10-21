"use client";

import { useState, useEffect } from "react";
import { Scheme, schemes } from "./schemeSearch";

export type ApplicationStatus = "saved" | "documents_ready" | "applied" | "benefit_received";

export interface TrackedScheme {
  schemeId: string;
  savedAt: string;
  status: ApplicationStatus;
  applicationNumber?: string;
  notes?: string;
  updatedAt: string;
}

const STORAGE_KEY = "haqdaar_tracked_schemes";

export function useDashboardStore() {
  const [trackedSchemes, setTrackedSchemes] = useState<TrackedScheme[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setTrackedSchemes(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load tracked schemes from localStorage", e);
    }
    setIsLoaded(true);
  }, []);

  const saveToStorage = (updated: TrackedScheme[]) => {
    setTrackedSchemes(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save tracked schemes to localStorage", e);
    }
  };

  const addScheme = (schemeId: string) => {
    if (trackedSchemes.some((s) => s.schemeId === schemeId)) return;
    const now = new Date().toISOString();
    const updated = [
      ...trackedSchemes,
      {
        schemeId,
        savedAt: now,
        status: "saved" as ApplicationStatus,
        updatedAt: now,
      },
    ];
    saveToStorage(updated);
  };

  const removeScheme = (schemeId: string) => {
    const updated = trackedSchemes.filter((s) => s.schemeId !== schemeId);
    saveToStorage(updated);
  };

  const updateStatus = (schemeId: string, status: ApplicationStatus) => {
    const updated = trackedSchemes.map((s) =>
      s.schemeId === schemeId
        ? { ...s, status, updatedAt: new Date().toISOString() }
        : s
    );
    saveToStorage(updated);
  };

  const updateDetails = (schemeId: string, details: { applicationNumber?: string; notes?: string }) => {
    const updated = trackedSchemes.map((s) =>
      s.schemeId === schemeId
        ? { ...s, ...details, updatedAt: new Date().toISOString() }
        : s
    );
    saveToStorage(updated);
  };

  const isSaved = (schemeId: string) => trackedSchemes.some((s) => s.schemeId === schemeId);

  // Return full scheme objects joined with tracking metadata
  const populated = trackedSchemes
    .map((item) => {
      const found = schemes.find((s) => s.id === item.schemeId);
      if (!found) return null;
      return {
        ...found,
        tracking: item,
      };
    })
    .filter(Boolean) as (Scheme & { tracking: TrackedScheme })[];

  return {
    trackedSchemes,
    populated,
    isLoaded,
    addScheme,
    removeScheme,
    updateStatus,
    updateDetails,
    isSaved,
  };
}
