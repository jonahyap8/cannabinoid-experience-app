/** ──────────────────────────────────────────────
 *  Storage — localStorage wrapper
 *  Versioned schema with migration-safe defaults.
 *  ────────────────────────────────────────────── */

import type { AppState, SavedBlend, Strain } from "./types";
import { SCHEMA_VERSION, STORAGE_KEY } from "./constants";
import { SEED_STRAINS } from "./seed-data";

function defaultState(): AppState {
  return {
    strains: [...SEED_STRAINS],
    savedBlends: [],
    schemaVersion: SCHEMA_VERSION,
  };
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Load the full app state from localStorage.
 * Returns seeded defaults on first run or if data is corrupt.
 */
export function loadState(): AppState {
  if (!isBrowser()) return defaultState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = defaultState();
      saveState(fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as AppState;

    // Future: if parsed.schemaVersion < SCHEMA_VERSION → run migrations
    if (!parsed.schemaVersion || parsed.schemaVersion < SCHEMA_VERSION) {
      // For v1 there's nothing to migrate; just stamp it.
      parsed.schemaVersion = SCHEMA_VERSION;
      saveState(parsed);
    }

    // Sanity: ensure strains is an array
    if (!Array.isArray(parsed.strains)) parsed.strains = [...SEED_STRAINS];
    if (!Array.isArray(parsed.savedBlends)) parsed.savedBlends = [];

    return parsed;
  } catch {
    const fresh = defaultState();
    saveState(fresh);
    return fresh;
  }
}

/**
 * Persist the full app state to localStorage.
 */
export function saveState(state: AppState): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ── Convenience helpers ─────────────────────────────────

export function saveStrains(strains: Strain[]): void {
  const state = loadState();
  state.strains = strains;
  saveState(state);
}

export function saveBlend(blend: SavedBlend): void {
  const state = loadState();
  // Keep at most 20 recent blends
  state.savedBlends = [blend, ...state.savedBlends].slice(0, 20);
  saveState(state);
}

export function resetToDefaults(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
  saveState(defaultState());
}
