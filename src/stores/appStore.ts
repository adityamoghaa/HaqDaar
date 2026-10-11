// Zustand Store — HaqDaar v4 Global Application State
import { create } from "zustand";

export interface UserProfile {
  state?: string | null;
  age?: number | null;
  gender?: "male" | "female" | null;
  occupation?: string | null;
  income?: number | null;
  caste?: "SC" | "ST" | "OBC" | "general" | "minority" | null;
  bpl?: boolean | null;
  widow?: boolean | null;
  area?: "rural" | "urban" | null;
  raw_text?: string | null;
  [key: string]: unknown;
}

export interface MatchedScheme {
  id: string;
  name: string;
  nameHindi?: string;
  category: string;
  state: string;
  level: string;
  benefit: string;
  benefitHindi?: string;
  eligibility: Record<string, unknown>;
  documents: string[];
  apply_url?: string;
  apply_mode: string[];
  tags?: string[];
  emoji?: string;
  score: number;
  aiReason?: string;
  reasons?: string[];
}

interface AppState {
  // Language
  language: string;
  setLanguage: (language: string) => void;

  // Profile
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  mergeProfile: (partial: Partial<UserProfile>) => void;

  // Results
  matchedSchemes: MatchedScheme[];
  selectedScheme: MatchedScheme | null;
  activeFilter: string;
  setMatchedSchemes: (schemes: MatchedScheme[]) => void;
  setSelectedScheme: (scheme: MatchedScheme | null) => void;
  setActiveFilter: (filter: string) => void;

  // Profile Persistence
  loadSavedProfile: () => UserProfile | null;
  saveProfile: () => void;
  clearSavedProfile: () => void;

  // Reset
  resetApp: () => void;
}

const useAppStore = create<AppState>((set, get) => ({
  language: "hi",
  setLanguage: (language) => set({ language }),

  profile: {},
  setProfile: (profile) => set({ profile }),
  mergeProfile: (partial) =>
    set((state) => {
      const updated = { ...state.profile };
      Object.entries(partial).forEach(([k, v]) => {
        if (v !== null && v !== undefined) updated[k] = v;
      });
      return { profile: updated };
    }),

  matchedSchemes: [],
  selectedScheme: null,
  activeFilter: "all",
  setMatchedSchemes: (matchedSchemes) => set({ matchedSchemes }),
  setSelectedScheme: (selectedScheme) => set({ selectedScheme }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),

  loadSavedProfile: () => {
    try {
      const saved = localStorage.getItem("haqdaar_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        set({ profile: parsed });
        return parsed;
      }
    } catch {
      /* empty */
    }
    return null;
  },
  saveProfile: () => {
    try {
      const { profile } = get();
      if (Object.keys(profile).length > 0) {
        localStorage.setItem("haqdaar_profile", JSON.stringify(profile));
      }
    } catch {
      /* empty */
    }
  },
  clearSavedProfile: () => {
    try {
      localStorage.removeItem("haqdaar_profile");
    } catch {
      /* empty */
    }
  },

  resetApp: () =>
    set({
      profile: {},
      matchedSchemes: [],
      selectedScheme: null,
      activeFilter: "all",
    }),
}));

export default useAppStore;
