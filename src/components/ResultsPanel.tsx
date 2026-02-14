"use client";

import { useState } from "react";
import type { PredictionResult } from "@/lib/types";

interface Props {
  prediction: PredictionResult | null;
}

const TAG_COLORS: Record<string, string> = {
  Relaxed: "bg-sage-800/60 text-sage-200 border-sage-700/40",
  Uplifted: "bg-amber-900/40 text-amber-200 border-amber-700/30",
  Focused: "bg-sky-900/40 text-sky-200 border-sky-700/30",
  Sleepy: "bg-indigo-900/40 text-indigo-200 border-indigo-700/30",
  Creative: "bg-fuchsia-900/40 text-fuchsia-200 border-fuchsia-700/30",
  Social: "bg-rose-900/40 text-rose-200 border-rose-700/30",
  "Body-heavy": "bg-orange-900/40 text-orange-200 border-orange-700/30",
  "Clear-headed": "bg-teal-900/40 text-teal-200 border-teal-700/30",
};

const TAG_ICONS: Record<string, string> = {
  Relaxed: "🌿",
  Uplifted: "☀️",
  Focused: "🎯",
  Sleepy: "🌙",
  Creative: "🎨",
  Social: "💬",
  "Body-heavy": "🏋️",
  "Clear-headed": "💎",
};

function IntensityMeter({ value }: { value: number }) {
  const bars = Array.from({ length: 10 }, (_, i) => i + 1);

  const getColor = (bar: number) => {
    if (bar > value) return "bg-void-800";
    if (bar <= 3) return "bg-sage-500";
    if (bar <= 6) return "bg-amber-500";
    if (bar <= 8) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-bark-400">Intensity</span>
        <span className="text-sm font-mono font-medium text-bark-200">{value}/10</span>
      </div>
      <div className="flex gap-1">
        {bars.map((bar) => (
          <div
            key={bar}
            className={`h-3 flex-1 rounded-sm transition-colors duration-300 ${getColor(bar)}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-bark-600">
        <span>Mild</span>
        <span>Moderate</span>
        <span>Intense</span>
      </div>
    </div>
  );
}

export default function ResultsPanel({ prediction }: Props) {
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);

  if (!prediction) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-base text-bark-100 font-display">Experience Profile</h2>
        </div>
        <div className="card-body py-12 text-center">
          <div className="text-4xl mb-3 opacity-20">🔮</div>
          <p className="text-bark-500 text-sm">Build a blend and hit "Predict Experience"</p>
          <p className="text-bark-600 text-xs mt-1">
            Your terpene and cannabinoid profile will appear here.
          </p>
        </div>
      </div>
    );
  }

  const {
    blendedThc,
    blendedCbd,
    terpeneScores,
    primaryLabel,
    secondaryTags,
    intensity,
    explanation,
  } = prediction;

  const sortedTerpenes = Object.entries(terpeneScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const maxTerpScore = sortedTerpenes.length > 0 ? sortedTerpenes[0][1] : 1;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-base text-bark-100 font-display">Experience Profile</h2>
      </div>

      <div className="card-body space-y-5">
        {/* ── Primary Label ─────────────────────────── */}
        <div className="text-center py-3">
          <div className="text-3xl mb-1">{TAG_ICONS[primaryLabel] ?? "✧"}</div>
          <h3 className="text-2xl font-display text-bark-50">{primaryLabel}</h3>
          <div className="flex items-center justify-center gap-2 mt-2">
            {secondaryTags.map((tag) => (
              <span
                key={tag}
                className={`badge text-[11px] border ${TAG_COLORS[tag] ?? "bg-void-800 text-bark-300 border-void-600"}`}
              >
                {TAG_ICONS[tag] ?? "•"} {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── Cannabinoid Summary ───────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-void-800/40 rounded-lg p-3 text-center">
            <p className="text-[10px] text-bark-500 uppercase tracking-wider">Blended THC</p>
            <p className="text-xl font-mono font-medium text-ember-400 mt-0.5">
              {blendedThc}%
            </p>
          </div>
          <div className="bg-void-800/40 rounded-lg p-3 text-center">
            <p className="text-[10px] text-bark-500 uppercase tracking-wider">Blended CBD</p>
            <p className="text-xl font-mono font-medium text-sage-400 mt-0.5">
              {blendedCbd}%
            </p>
          </div>
        </div>

        {/* ── Intensity Meter ──────────────────────── */}
        <IntensityMeter value={intensity} />

        {/* ── Terpene Dominance ─────────────────────── */}
        <div>
          <h4 className="text-xs text-bark-400 uppercase tracking-wider mb-2">
            Terpene Dominance
          </h4>
          <div className="space-y-1.5">
            {sortedTerpenes.map(([terp, score]) => (
              <div key={terp} className="flex items-center gap-2">
                <span className="text-xs text-bark-300 w-24 truncate">{terp}</span>
                <div className="flex-1 h-2 bg-void-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sage-600 to-sage-400 rounded-full transition-all duration-500"
                    style={{ width: `${(score / maxTerpScore) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-bark-500 w-10 text-right">
                  {(score * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Explanation ───────────────────────────── */}
        <div>
          <h4 className="text-xs text-bark-400 uppercase tracking-wider mb-2">
            How This Was Computed
          </h4>
          <div className="bg-void-800/30 rounded-lg p-3 space-y-1">
            {explanation.map((line, i) => (
              <p key={i} className="text-[11px] text-bark-400 font-mono leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* ── Model Assumptions Accordion ───────────── */}
        <div className="border border-void-700/40 rounded-lg overflow-hidden">
          <button
            onClick={() => setAssumptionsOpen(!assumptionsOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-bark-400 hover:text-bark-300 hover:bg-void-800/30 transition-colors"
          >
            <span>Model Assumptions & Limitations</span>
            <span className="text-bark-600">{assumptionsOpen ? "▲" : "▼"}</span>
          </button>
          {assumptionsOpen && (
            <div className="px-4 pb-3 space-y-2 border-t border-void-700/30">
              <p className="text-[11px] text-bark-500 leading-relaxed pt-2">
                <strong className="text-bark-400">Heuristic model, not science.</strong> This
                engine assigns fixed effect weights to known terpenes and blends them linearly
                by strain weight. It does <em>not</em> account for the entourage effect,
                individual tolerance, consumption method, dose, or any pharmacokinetic factors.
              </p>
              <p className="text-[11px] text-bark-500 leading-relaxed">
                <strong className="text-bark-400">Intensity formula:</strong> Base intensity =
                (blended THC% / 40) × 10, reduced by CBD at 0.15 per percentage point, then
                clamped to 1–10. This is a rough approximation.
              </p>
              <p className="text-[11px] text-bark-500 leading-relaxed">
                <strong className="text-bark-400">Terpene scores:</strong> Each of a strain's 3
                dominant terpenes contributes equally (⅓ of the strain's weight). This ignores
                actual concentration differences between terpenes in a real strain.
              </p>
              <p className="text-[11px] text-bark-500 leading-relaxed">
                <strong className="text-bark-400">Cannabinoid influence:</strong> THC amplifies
                Uplifted, Creative, Body-heavy, Social tags. CBD amplifies Relaxed,
                Clear-headed, Focused tags. These are gross simplifications.
              </p>
              <p className="text-[11px] text-bark-500 leading-relaxed">
                <strong className="text-bark-400">Custom terpenes:</strong> Any terpene not in
                the standard list will be tracked for presence but will contribute no effect
                scores.
              </p>
              <p className="text-[11px] text-bark-500 leading-relaxed">
                <strong className="text-bark-400">No strain type used.</strong> This model
                deliberately ignores indica/sativa/hybrid classifications, as modern research
                suggests terpene and cannabinoid profiles are more predictive than strain type
                labels.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
