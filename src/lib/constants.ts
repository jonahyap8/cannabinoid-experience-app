/** ──────────────────────────────────────────────
 *  Constants — terpene list & effect mappings
 *  ────────────────────────────────────────────── */

import type { ExperienceTag } from "./types";

/**
 * Standard terpene list. Users may also enter custom strings.
 */
export const STANDARD_TERPENES: string[] = [
  "Myrcene",
  "Limonene",
  "Caryophyllene",
  "Linalool",
  "Pinene",
  "Humulene",
  "Terpinolene",
  "Ocimene",
  "Bisabolol",
  "Eucalyptol",
  "Nerolidol",
  "Guaiol",
  "Camphene",
  "Geraniol",
  "Valencene",
];

/**
 * Each known terpene maps to weighted effect tags.
 * Weights are relative (0–1) and do NOT need to sum to 1.
 * These are heuristic guesses informed by published terpene
 * research summaries — NOT medical claims.
 */
export const TERPENE_EFFECT_MAP: Record<string, Partial<Record<ExperienceTag, number>>> = {
  Myrcene: { Relaxed: 0.9, Sleepy: 0.7, "Body-heavy": 0.6 },
  Limonene: { Uplifted: 0.9, Social: 0.5, Creative: 0.4 },
  Caryophyllene: { Relaxed: 0.5, "Body-heavy": 0.4, Focused: 0.3 },
  Linalool: { Relaxed: 0.8, Sleepy: 0.6, "Clear-headed": 0.2 },
  Pinene: { Focused: 0.8, "Clear-headed": 0.7, Uplifted: 0.3 },
  Humulene: { Relaxed: 0.4, "Body-heavy": 0.3, Focused: 0.2 },
  Terpinolene: { Uplifted: 0.7, Creative: 0.6, Social: 0.4 },
  Ocimene: { Uplifted: 0.5, Social: 0.4, Creative: 0.3 },
  Bisabolol: { Relaxed: 0.6, Sleepy: 0.4, "Clear-headed": 0.3 },
  Eucalyptol: { "Clear-headed": 0.8, Focused: 0.5, Uplifted: 0.3 },
  Nerolidol: { Relaxed: 0.7, Sleepy: 0.5, "Body-heavy": 0.3 },
  Guaiol: { Relaxed: 0.5, "Clear-headed": 0.4, "Body-heavy": 0.2 },
  Camphene: { Focused: 0.4, "Clear-headed": 0.5, "Body-heavy": 0.2 },
  Geraniol: { Relaxed: 0.5, Uplifted: 0.4, Social: 0.3 },
  Valencene: { Uplifted: 0.6, Creative: 0.4, Social: 0.3 },
};

/** All possible experience tags */
export const ALL_EXPERIENCE_TAGS: ExperienceTag[] = [
  "Relaxed",
  "Uplifted",
  "Focused",
  "Sleepy",
  "Creative",
  "Social",
  "Body-heavy",
  "Clear-headed",
];

/** THC influence on tags (applied as additive scores scaled by THC%) */
export const THC_TAG_INFLUENCE: Partial<Record<ExperienceTag, number>> = {
  Uplifted: 0.3,
  Creative: 0.2,
  "Body-heavy": 0.4,
  Social: 0.1,
};

/** CBD influence on tags (applied as additive scores scaled by CBD%) */
export const CBD_TAG_INFLUENCE: Partial<Record<ExperienceTag, number>> = {
  Relaxed: 0.4,
  "Clear-headed": 0.5,
  Focused: 0.2,
};

/** localStorage key */
export const STORAGE_KEY = "cannabinoid-experience-app";

/** Current schema version for migrations */
export const SCHEMA_VERSION = 1;
