"use client";

import { useCallback } from "react";
import type { BlendEntry, Strain } from "@/lib/types";

interface Props {
  strains: Strain[];
  entries: BlendEntry[];
  onChange: (entries: BlendEntry[]) => void;
  onCompute: () => void;
  error: string | null;
}

export default function BlendBuilder({ strains, entries, onChange, onCompute, error }: Props) {
  const strainMap = new Map(strains.map((s) => [s.id, s]));
  const weightSum = entries.reduce((s, e) => s + e.weight, 0);
  const isValid = entries.length > 0 && Math.abs(weightSum - 100) < 0.5;

  // ── Remove a strain from the blend ──────────────────
  const handleRemove = useCallback(
    (strainId: string) => {
      const next = entries.filter((e) => e.strainId !== strainId);
      if (next.length > 0) {
        // Redistribute weights evenly
        const even = Math.floor(100 / next.length);
        const distributed = next.map((e, i) => ({
          ...e,
          weight: i === next.length - 1 ? 100 - even * (next.length - 1) : even,
        }));
        onChange(distributed);
      } else {
        onChange([]);
      }
    },
    [entries, onChange]
  );

  // ── Update weight for one entry, redistribute remainder ─
  const handleWeightChange = useCallback(
    (strainId: string, newWeight: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(newWeight)));

      if (entries.length === 1) {
        // Single strain is always 100
        onChange([{ ...entries[0], weight: 100 }]);
        return;
      }

      const others = entries.filter((e) => e.strainId !== strainId);
      const otherTotal = others.reduce((s, e) => s + e.weight, 0);
      const remainder = 100 - clamped;

      // Distribute remainder proportionally among others
      const distributed = others.map((e, i) => {
        if (otherTotal === 0) {
          // Edge: all others are 0, split evenly
          return {
            ...e,
            weight:
              i === others.length - 1
                ? remainder - Math.floor(remainder / others.length) * (others.length - 1)
                : Math.floor(remainder / others.length),
          };
        }
        const ratio = e.weight / otherTotal;
        return { ...e, weight: Math.round(ratio * remainder) };
      });

      // Fix rounding: ensure sum is exactly 100
      const distSum = distributed.reduce((s, e) => s + e.weight, 0);
      if (distSum !== remainder && distributed.length > 0) {
        distributed[distributed.length - 1].weight += remainder - distSum;
      }

      // Ensure no negatives
      const fixed = distributed.map((e) => ({
        ...e,
        weight: Math.max(0, e.weight),
      }));

      const target = entries.findIndex((e) => e.strainId === strainId);
      const result = [...fixed];
      result.splice(target, 0, { strainId, weight: clamped });

      onChange(result);
    },
    [entries, onChange]
  );

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-base text-bark-100 font-display">Blend Builder</h2>
        <p className="text-[11px] text-bark-500 mt-0.5">
          Combine up to 3 strains · Weights must total 100%
        </p>
      </div>

      <div className="card-body space-y-4">
        {entries.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-3xl mb-2 opacity-30">⚗️</div>
            <p className="text-bark-500 text-sm">No strains selected.</p>
            <p className="text-bark-600 text-xs mt-1">
              Click <span className="font-mono text-sage-400">+ Blend</span> on a strain in
              the library to start.
            </p>
          </div>
        ) : (
          <>
            {/* Strain entries with sliders */}
            <div className="space-y-3">
              {entries.map((entry) => {
                const strain = strainMap.get(entry.strainId);
                if (!strain) return null;

                return (
                  <div
                    key={entry.strainId}
                    className="bg-void-800/40 border border-void-700/40 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-bark-100 truncate">
                          {strain.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-ember-400">
                            THC {strain.thcPercent}%
                          </span>
                          <span className="text-[10px] font-mono text-sage-400">
                            CBD {strain.cbdPercent}%
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(entry.strainId)}
                        className="btn-ghost text-[10px] !px-2 !py-0.5 !text-red-400 shrink-0"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Weight slider */}
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={entry.weight}
                        onChange={(e) =>
                          handleWeightChange(entry.strainId, parseInt(e.target.value, 10))
                        }
                        className="flex-1"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={entry.weight}
                          onChange={(e) =>
                            handleWeightChange(entry.strainId, parseInt(e.target.value, 10) || 0)
                          }
                          className="input-field !w-14 text-center font-mono text-xs !px-1"
                        />
                        <span className="text-xs text-bark-500">%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Weight sum indicator */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-bark-500">Total weight:</span>
              <span
                className={`font-mono font-medium ${
                  isValid ? "text-sage-400" : "text-ember-400"
                }`}
              >
                {weightSum}%{" "}
                {isValid ? "✓" : weightSum < 100 ? `(need ${100 - weightSum}% more)` : "(over)"}
              </span>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-950/40 border border-red-800/50 rounded-lg p-3">
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            )}

            {/* Compute button */}
            <button
              onClick={onCompute}
              disabled={!isValid}
              className="btn-primary w-full text-sm !py-2.5"
            >
              Predict Experience
            </button>
          </>
        )}
      </div>
    </div>
  );
}
