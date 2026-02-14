/** ──────────────────────────────────────────────
 *  Seed Data — example strains for first run
 *  ────────────────────────────────────────────── */

import type { Strain } from "./types";

function makeStrain(
  id: string,
  name: string,
  thc: number,
  cbd: number,
  terps: [string, string, string],
  notes?: string
): Strain {
  const now = new Date().toISOString();
  return {
    id,
    name,
    thcPercent: thc,
    cbdPercent: cbd,
    dominantTerpenes: terps,
    notes,
    createdAt: now,
    updatedAt: now,
  };
}

export const SEED_STRAINS: Strain[] = [
  makeStrain(
    "seed-001",
    "Blue Dream",
    21,
    0.1,
    ["Myrcene", "Caryophyllene", "Pinene"],
    "Classic hybrid. Sweet berry aroma."
  ),
  makeStrain(
    "seed-002",
    "OG Kush",
    23,
    0.3,
    ["Myrcene", "Limonene", "Caryophyllene"],
    "Earthy, pine, and woody notes. Iconic."
  ),
  makeStrain(
    "seed-003",
    "Sour Diesel",
    22,
    0.2,
    ["Caryophyllene", "Limonene", "Myrcene"],
    "Pungent diesel aroma. Energizing reputation."
  ),
  makeStrain(
    "seed-004",
    "Granddaddy Purple",
    20,
    0.1,
    ["Myrcene", "Linalool", "Pinene"],
    "Grape and berry profile. Deep relaxation."
  ),
  makeStrain(
    "seed-005",
    "Jack Herer",
    18,
    0.1,
    ["Terpinolene", "Pinene", "Caryophyllene"],
    "Named after the cannabis activist. Piney and sharp."
  ),
  makeStrain(
    "seed-006",
    "ACDC",
    1,
    14,
    ["Myrcene", "Pinene", "Caryophyllene"],
    "High-CBD strain. Minimal psychoactivity."
  ),
  makeStrain(
    "seed-007",
    "Harlequin",
    5,
    10,
    ["Myrcene", "Pinene", "Caryophyllene"],
    "Balanced CBD:THC. Clear-headed."
  ),
  makeStrain(
    "seed-008",
    "Girl Scout Cookies",
    25,
    0.2,
    ["Caryophyllene", "Limonene", "Humulene"],
    "Sweet, earthy. High potency."
  ),
  makeStrain(
    "seed-009",
    "Durban Poison",
    19,
    0.1,
    ["Terpinolene", "Ocimene", "Myrcene"],
    "Pure landrace. Energetic and uplifting."
  ),
  makeStrain(
    "seed-010",
    "Bubba Kush",
    22,
    0.1,
    ["Myrcene", "Linalool", "Caryophyllene"],
    "Heavy body effects. Coffee and chocolate notes."
  ),
];
