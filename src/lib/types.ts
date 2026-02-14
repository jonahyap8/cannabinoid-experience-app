/** ──────────────────────────────────────────────
 *  Types — Cannabinoid Experience Creator
 *  ────────────────────────────────────────────── */

export interface Strain {
  id: string;
  name: string;
  /** 0–40 */
  thcPercent: number;
  /** 0–40 */
  cbdPercent: number;
  /** Exactly 3 dominant terpene names */
  dominantTerpenes: [string, string, string];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlendEntry {
  strainId: string;
  /** 0–100, all entries must sum to 100 */
  weight: number;
}

export interface SavedBlend {
  id: string;
  entries: BlendEntry[];
  result: PredictionResult;
  createdAt: string;
}

/** Tags the prediction engine can assign */
export type ExperienceTag =
  | "Relaxed"
  | "Uplifted"
  | "Focused"
  | "Sleepy"
  | "Creative"
  | "Social"
  | "Body-heavy"
  | "Clear-headed";

export interface PredictionResult {
  blendedThc: number;
  blendedCbd: number;
  /** Weighted terpene presence across the blend */
  terpeneScores: Record<string, number>;
  /** Single dominant experience label */
  primaryLabel: ExperienceTag;
  /** Top 3 secondary tags (may overlap with primary) */
  secondaryTags: ExperienceTag[];
  /** 1–10 */
  intensity: number;
  /** Human-readable explanation lines */
  explanation: string[];
}

export interface AppState {
  strains: Strain[];
  savedBlends: SavedBlend[];
  schemaVersion: number;
}
