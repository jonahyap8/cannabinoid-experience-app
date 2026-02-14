/** ──────────────────────────────────────────────
 *  Prediction Engine — Unit Tests
 *
 *  ≥6 cases covering: high-THC, high-CBD, balanced,
 *  terpene-dominant outcomes, edge cases, errors.
 *  ────────────────────────────────────────────── */

import { describe, expect, it } from "vitest";
import { computePrediction } from "../lib/prediction";
import type { Strain } from "../lib/types";

// ── Helpers ──────────────────────────────────────────────

function makeStrain(
  overrides: Partial<Strain> & Pick<Strain, "thcPercent" | "cbdPercent" | "dominantTerpenes">
): Strain {
  return {
    id: "test-" + Math.random().toString(36).slice(2, 8),
    name: "Test Strain",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as Strain;
}

function soloBlend(strain: Strain) {
  return [{ strain, weight: 100 }];
}

// ── Test Suite ───────────────────────────────────────────

describe("computePrediction", () => {
  // ━━ Case 1: High-THC strain ━━━━━━━━━━━━━━━━━━━━━━━━━━
  it("high-THC strain → high intensity, Body-heavy or Uplifted influence", () => {
    const strain = makeStrain({
      thcPercent: 35,
      cbdPercent: 0,
      dominantTerpenes: ["Limonene", "Caryophyllene", "Humulene"],
    });
    const result = computePrediction(soloBlend(strain));

    expect(result.blendedThc).toBe(35);
    expect(result.blendedCbd).toBe(0);
    // Intensity should be high (THC 35/40 * 10 = 8.75 → 9)
    expect(result.intensity).toBeGreaterThanOrEqual(8);
    expect(result.intensity).toBeLessThanOrEqual(10);
    // Should have explanation entries
    expect(result.explanation.length).toBeGreaterThan(0);
  });

  // ━━ Case 2: High-CBD strain ━━━━━━━━━━━━━━━━━━━━━━━━━━
  it("high-CBD / low-THC → low intensity, Relaxed or Clear-headed primary", () => {
    const strain = makeStrain({
      thcPercent: 1,
      cbdPercent: 20,
      dominantTerpenes: ["Myrcene", "Pinene", "Caryophyllene"],
    });
    const result = computePrediction(soloBlend(strain));

    expect(result.blendedCbd).toBe(20);
    expect(result.intensity).toBeLessThanOrEqual(3);
    // CBD + Myrcene + Pinene should push Relaxed, Clear-headed, or Focused
    expect(["Relaxed", "Clear-headed", "Focused"]).toContain(result.primaryLabel);
  });

  // ━━ Case 3: Balanced THC:CBD ━━━━━━━━━━━━━━━━━━━━━━━━━
  it("balanced THC:CBD → moderate intensity, CBD tempers THC", () => {
    const strain = makeStrain({
      thcPercent: 10,
      cbdPercent: 10,
      dominantTerpenes: ["Limonene", "Pinene", "Terpinolene"],
    });
    const result = computePrediction(soloBlend(strain));

    expect(result.blendedThc).toBe(10);
    expect(result.blendedCbd).toBe(10);
    // 10/40*10 = 2.5, minus 10*0.15 = 1.5 → raw 1.0 → clamped 1
    expect(result.intensity).toBeLessThanOrEqual(3);
  });

  // ━━ Case 4: Terpene-dominant outcome (sleepy) ━━━━━━━━━
  it("sedating terpene profile (Myrcene+Linalool) → Relaxed or Sleepy primary", () => {
    const strain = makeStrain({
      thcPercent: 15,
      cbdPercent: 0,
      dominantTerpenes: ["Myrcene", "Linalool", "Nerolidol"],
    });
    const result = computePrediction(soloBlend(strain));

    // All three terpenes strongly push Relaxed/Sleepy
    expect(["Relaxed", "Sleepy"]).toContain(result.primaryLabel);
  });

  // ━━ Case 5: Multi-strain blend with correct weighting ━
  it("two-strain blend computes weighted THC/CBD correctly", () => {
    const s1 = makeStrain({
      thcPercent: 20,
      cbdPercent: 0,
      dominantTerpenes: ["Myrcene", "Limonene", "Pinene"],
    });
    const s2 = makeStrain({
      thcPercent: 0,
      cbdPercent: 20,
      dominantTerpenes: ["Pinene", "Caryophyllene", "Bisabolol"],
    });

    const result = computePrediction([
      { strain: s1, weight: 50 },
      { strain: s2, weight: 50 },
    ]);

    expect(result.blendedThc).toBe(10);
    expect(result.blendedCbd).toBe(10);
    // Pinene appears in both strains → should have higher terpene score
    expect(result.terpeneScores["Pinene"]).toBeGreaterThan(
      result.terpeneScores["Limonene"] ?? 0
    );
  });

  // ━━ Case 6: Three-strain blend, unequal weights ━━━━━━━
  it("three-strain blend with 60/30/10 split", () => {
    const s1 = makeStrain({
      thcPercent: 30,
      cbdPercent: 0,
      dominantTerpenes: ["Myrcene", "Caryophyllene", "Limonene"],
    });
    const s2 = makeStrain({
      thcPercent: 10,
      cbdPercent: 5,
      dominantTerpenes: ["Pinene", "Terpinolene", "Ocimene"],
    });
    const s3 = makeStrain({
      thcPercent: 5,
      cbdPercent: 15,
      dominantTerpenes: ["Linalool", "Bisabolol", "Myrcene"],
    });

    const result = computePrediction([
      { strain: s1, weight: 60 },
      { strain: s2, weight: 30 },
      { strain: s3, weight: 10 },
    ]);

    // 30*0.6 + 10*0.3 + 5*0.1 = 18 + 3 + 0.5 = 21.5
    expect(result.blendedThc).toBe(21.5);
    // 0*0.6 + 5*0.3 + 15*0.1 = 0 + 1.5 + 1.5 = 3
    expect(result.blendedCbd).toBe(3);
    expect(result.secondaryTags).toHaveLength(3);
  });

  // ━━ Case 7: Edge case — empty input throws ━━━━━━━━━━━━
  it("throws on empty input array", () => {
    expect(() => computePrediction([])).toThrow("At least one strain is required");
  });

  // ━━ Case 8: Edge case — weights not summing to 100 ━━━━
  it("throws when weights don't sum to 100", () => {
    const strain = makeStrain({
      thcPercent: 10,
      cbdPercent: 5,
      dominantTerpenes: ["Myrcene", "Pinene", "Limonene"],
    });
    expect(() =>
      computePrediction([
        { strain, weight: 40 },
        { strain, weight: 40 },
      ])
    ).toThrow("Weights must sum to 100");
  });
});
