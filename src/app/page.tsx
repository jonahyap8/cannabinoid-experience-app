"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { BlendEntry, PredictionResult, SavedBlend, Strain } from "@/lib/types";
import { loadState, saveBlend, saveStrains, resetToDefaults } from "@/lib/storage";
import { computePrediction, resolveBlendInputs } from "@/lib/prediction";
import StrainLibrary from "@/components/StrainLibrary";
import BlendBuilder from "@/components/BlendBuilder";
import ResultsPanel from "@/components/ResultsPanel";
import Disclaimer from "@/components/Disclaimer";
import ResetButton from "@/components/ResetButton";

export default function HomePage() {
  const [strains, setStrains] = useState<Strain[]>([]);
  const [blendEntries, setBlendEntries] = useState<BlendEntry[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // ── Hydrate from localStorage ───────────────────────
  useEffect(() => {
    const state = loadState();
    setStrains(state.strains);
    setLoaded(true);
  }, []);

  // ── Persist strains on change ───────────────────────
  useEffect(() => {
    if (loaded) saveStrains(strains);
  }, [strains, loaded]);

  // ── Strain CRUD ─────────────────────────────────────
  const handleSaveStrain = useCallback(
    (strain: Strain) => {
      setStrains((prev) => {
        const idx = prev.findIndex((s) => s.id === strain.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = strain;
          return next;
        }
        return [...prev, strain];
      });
    },
    []
  );

  const handleDeleteStrain = useCallback(
    (id: string) => {
      setStrains((prev) => prev.filter((s) => s.id !== id));
      // Also remove from blend if present
      setBlendEntries((prev) => prev.filter((e) => e.strainId !== id));
    },
    []
  );

  // ── Blend management ────────────────────────────────
  const handleAddToBlend = useCallback(
    (strainId: string) => {
      setBlendEntries((prev) => {
        if (prev.length >= 3) return prev;
        if (prev.some((e) => e.strainId === strainId)) return prev;

        const newEntries = [...prev, { strainId, weight: 0 }];
        // Auto-distribute weights evenly
        const even = Math.floor(100 / newEntries.length);
        const distributed = newEntries.map((e, i) => ({
          ...e,
          weight: i === newEntries.length - 1 ? 100 - even * (newEntries.length - 1) : even,
        }));
        return distributed;
      });
    },
    []
  );

  // ── Compute prediction ──────────────────────────────
  const handleCompute = useCallback(() => {
    setPredictionError(null);
    try {
      const inputs = resolveBlendInputs(blendEntries, strains);
      const result = computePrediction(inputs);
      setPrediction(result);

      // Save blend
      const saved: SavedBlend = {
        id: crypto.randomUUID?.() ?? Date.now().toString(),
        entries: blendEntries,
        result,
        createdAt: new Date().toISOString(),
      };
      saveBlend(saved);
    } catch (err: unknown) {
      setPredictionError(err instanceof Error ? err.message : "Prediction failed.");
      setPrediction(null);
    }
  }, [blendEntries, strains]);

  // ── Reset ───────────────────────────────────────────
  const handleReset = useCallback(() => {
    resetToDefaults();
    const state = loadState();
    setStrains(state.strains);
    setBlendEntries([]);
    setPrediction(null);
    setPredictionError(null);
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-bark-400 font-mono text-sm animate-pulse">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ──────────────────────────────────── */}
      <header className="border-b border-void-800/80 bg-void-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sage-500 to-sage-700 flex items-center justify-center text-sage-100 text-lg font-display">
              ✧
            </div>
            <div>
              <h1 className="text-lg sm:text-xl text-bark-50 leading-tight">
                Cannabinoid Experience Creator
              </h1>
              <p className="text-[11px] text-bark-500 tracking-wide uppercase">
                Terpene-driven blend explorer · Informational only
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/terpenes" className="btn-ghost text-xs">
              Terpene Library
            </Link>
            <ResetButton onReset={handleReset} />
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────── */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Strain Library */}
          <section className="lg:col-span-4 xl:col-span-3">
            <StrainLibrary
              strains={strains}
              blendEntries={blendEntries}
              onSave={handleSaveStrain}
              onDelete={handleDeleteStrain}
              onAddToBlend={handleAddToBlend}
            />
          </section>

          {/* Center: Blend Builder */}
          <section className="lg:col-span-4 xl:col-span-4">
            <BlendBuilder
              strains={strains}
              entries={blendEntries}
              onChange={setBlendEntries}
              onCompute={handleCompute}
              error={predictionError}
            />
          </section>

          {/* Right: Results */}
          <section className="lg:col-span-4 xl:col-span-5">
            <ResultsPanel prediction={prediction} />
          </section>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-void-800/60 mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5">
          <Disclaimer />
        </div>
      </footer>
    </div>
  );
}
