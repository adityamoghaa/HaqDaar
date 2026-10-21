"use client";

import { useState, useEffect } from "react";
import { Scheme, schemes } from "./schemeSearch";

const STORAGE_KEY = "haqdaar_compare_schemes";
const MAX_COMPARE = 3;

export function useComparisonStore() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSelectedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load comparison schemes from localStorage", e);
    }
    setIsLoaded(true);
  }, []);

  const saveToStorage = (updated: string[]) => {
    setSelectedIds(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save comparison schemes to localStorage", e);
    }
  };

  const addSchemeToCompare = (schemeId: string) => {
    if (selectedIds.includes(schemeId)) return;
    if (selectedIds.length >= MAX_COMPARE) {
      // Replace the first or cap
      const updated = [...selectedIds.slice(1), schemeId];
      saveToStorage(updated);
      return;
    }
    const updated = [...selectedIds, schemeId];
    saveToStorage(updated);
  };

  const removeSchemeFromCompare = (schemeId: string) => {
    const updated = selectedIds.filter((id) => id !== schemeId);
    saveToStorage(updated);
  };

  const clearCompare = () => {
    saveToStorage([]);
  };

  const isCompared = (schemeId: string) => selectedIds.includes(schemeId);

  const selectedSchemes = selectedIds
    .map((id) => schemes.find((s) => s.id === id))
    .filter(Boolean) as Scheme[];

  return {
    selectedIds,
    selectedSchemes,
    isLoaded,
    addSchemeToCompare,
    removeSchemeFromCompare,
    clearCompare,
    isCompared,
    MAX_COMPARE,
  };
}
