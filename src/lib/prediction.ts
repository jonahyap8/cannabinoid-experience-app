/** ──────────────────────────────────────────────
 *  Prediction Engine
 *
 *  Heuristic-only. No medical claims. Effects are
 *  speculative and vary per individual. See the
 *  "Model Assumptions" section in the UI.
 *  ────────────────────────────────────────────── */

import type { BlendEntry, ExperienceTag, PredictionResult, Strain } from "./types";
import {
  ALL_EXPERIENCE_TAGS,
  CBD_TAG_INFLUENCE,
  TERPENE_EFFECT_MAP,
  THC_TAG_INFLUENCE,
} from "./constants";

interface BlendInput {
  strain: Strain;
  weight: number; // 0–100
}

/**
 * Compute blended THC/CBD, terpene scores, and a predicted
 * experience profile from an array of strain + weight pairs.
 *
 * @throws if inputs are empty or weights don't sum to ~100
 */
export function computePrediction(inputs: BlendInput[]): PredictionResult {
  if (inputs.length === 0) {
    throw new Error("At least one strain is required.");
  }

  const weightSum = inputs.reduce((s, i) => s + i.weight, 0);
  if (Math.abs(weightSum - 100) > 0.5) {
    throw new Error(`Weights must sum to 100 (got ${weightSum}).`);
  }

  // ── Step 1: Weighted cannabinoid blend ──────────────────
  let blendedThc = 0;
  let blendedCbd = 0;
  for (const { strain, weight } of inputs) {
    const w = weight / 100;
    blendedThc += strain.thcPercent * w;
    blendedCbd += strain.cbdPercent * w;
  }
  blendedThc = round2(blendedThc);
  blendedCbd = round2(blendedCbd);

  // ── Step 2: Terpene presence scores ─────────────────────
  // Each terpene in a strain contributes (1/3) * weight/100
  // because each strain has exactly 3 dominant terpenes.
  const terpeneScores: Record<string, number> = {};
  for (const { strain, weight } of inputs) {
    const w = weight / 100;
    for (const terp of strain.dominantTerpenes) {
      const normalized = terp.trim();
      if (!normalized) continue;
      terpeneScores[normalized] = (terpeneScores[normalized] ?? 0) + (1 / 3) * w;
    }
  }

  // ── Step 3: Tag scoring ─────────────────────────────────
  const tagScores: Record<ExperienceTag, number> = {} as Record<ExperienceTag, number>;
  for (const tag of ALL_EXPERIENCE_TAGS) tagScores[tag] = 0;

  // 3a. Terpene contribution
  const explanationParts: string[] = [];
  const sortedTerpenes = Object.entries(terpeneScores).sort((a, b) => b[1] - a[1]);

  for (const [terp, presence] of sortedTerpenes) {
    const effects = TERPENE_EFFECT_MAP[terp];
    if (!effects) continue;
    for (const [tag, weight] of Object.entries(effects) as [ExperienceTag, number][]) {
      tagScores[tag] += presence * weight;
    }
  }

  // Track top 3 terpenes for explanation
  const topTerps = sortedTerpenes.slice(0, 3);
  for (const [terp, presence] of topTerps) {
    const pct = round2(presence * 100);
    const effects = TERPENE_EFFECT_MAP[terp];
    if (effects) {
      const topEffects = Object.entries(effects)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([t]) => t);
      explanationParts.push(
        `${terp} (${pct}% presence) → contributes ${topEffects.join(", ")}`
      );
    } else {
      explanationParts.push(
        `${terp} (${pct}% presence) → no known effect mapping (custom terpene)`
      );
    }
  }

  // 3b. THC influence (scaled by blendedThc / 40 so max THC=40 → full weight)
  const thcFactor = clamp(blendedThc / 40, 0, 1);
  for (const [tag, w] of Object.entries(THC_TAG_INFLUENCE) as [ExperienceTag, number][]) {
    tagScores[tag] += thcFactor * w;
  }
  explanationParts.push(
    `THC ${blendedThc}% → amplifies ${Object.keys(THC_TAG_INFLUENCE).join(", ")} (factor: ${round2(thcFactor)})`
  );

  // 3c. CBD influence
  const cbdFactor = clamp(blendedCbd / 40, 0, 1);
  for (const [tag, w] of Object.entries(CBD_TAG_INFLUENCE) as [ExperienceTag, number][]) {
    tagScores[tag] += cbdFactor * w;
  }
  if (blendedCbd > 0) {
    explanationParts.push(
      `CBD ${blendedCbd}% → amplifies ${Object.keys(CBD_TAG_INFLUENCE).join(", ")} (factor: ${round2(cbdFactor)})`
    );
  }

  // ── Step 4: Primary label + secondary tags ──────────────
  const sortedTags = ALL_EXPERIENCE_TAGS
    .map((tag) => ({ tag, score: tagScores[tag] }))
    .sort((a, b) => b.score - a.score);

  const primaryLabel = sortedTags[0].tag;
  const secondaryTags = sortedTags.slice(1, 4).map((t) => t.tag);

  // ── Step 5: Intensity (1–10) ────────────────────────────
  //   Base = THC contribution (0–40 mapped to 1–10)
  //   CBD moderates: each 1% CBD reduces intensity by 0.15
  //   Clamped to [1, 10]
  const rawIntensity = (blendedThc / 40) * 10;
  const cbdReduction = blendedCbd * 0.15;
  const intensity = clamp(Math.round(rawIntensity - cbdReduction), 1, 10);

  explanationParts.push(
    `Intensity formula: (THC ${blendedThc}% / 40) × 10 − (CBD ${blendedCbd}% × 0.15) = ${round2(rawIntensity - cbdReduction)} → clamped to ${intensity}/10`
  );

  return {
    blendedThc,
    blendedCbd,
    terpeneScores,
    primaryLabel,
    secondaryTags,
    intensity,
    explanation: explanationParts,
  };
}

/**
 * Helper: resolve blend entries against a strain library.
 * Returns BlendInput[] or throws if a strain ID is missing.
 */
export function resolveBlendInputs(
  entries: BlendEntry[],
  strains: Strain[]
): BlendInput[] {
  const map = new Map(strains.map((s) => [s.id, s]));
  return entries.map((e) => {
    const strain = map.get(e.strainId);
    if (!strain) throw new Error(`Strain not found: ${e.strainId}`);
    return { strain, weight: e.weight };
  });
}

// ── Utilities ───────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
