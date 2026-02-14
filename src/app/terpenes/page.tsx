"use client";

import { useState } from "react";
import Link from "next/link";
import { STANDARD_TERPENES, TERPENE_EFFECT_MAP } from "@/lib/constants";
import { TERPENE_INFO } from "@/lib/terpene-info";
import type { ExperienceTag } from "@/lib/types";

const EFFECT_COLORS: Record<ExperienceTag, string> = {
  Relaxed: "badge-sage",
  Sleepy: "badge-sage",
  "Body-heavy": "badge-ember",
  Uplifted: "badge-ember",
  Creative: "badge-ember",
  Social: "badge-bark",
  Focused: "badge-bark",
  "Clear-headed": "badge-bark",
};

export default function TerpenePage() {
  const [search, setSearch] = useState("");

  const filtered = STANDARD_TERPENES.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ──────────────────────────────────── */}
      <header className="border-b border-void-800/80 bg-void-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-sage-500 to-sage-700 flex items-center justify-center text-sage-100 text-lg font-display hover:from-sage-400 hover:to-sage-600 transition-all"
            >
              ✧
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl text-bark-50 leading-tight">
                Terpene Library
              </h1>
              <p className="text-[11px] text-bark-500 tracking-wide uppercase">
                Aromas, effects & natural sources
              </p>
            </div>
          </div>
          <Link href="/" className="btn-secondary text-xs">
            ← Back to Blender
          </Link>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────── */}
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6">
        {/* Search */}
        <div className="max-w-md mb-6">
          <input
            type="text"
            placeholder="Search terpenes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field text-sm"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((name) => {
            const info = TERPENE_INFO[name];
            const effects = TERPENE_EFFECT_MAP[name];

            if (!info) return null;

            const sortedEffects = effects
              ? Object.entries(effects)
                  .sort(([, a], [, b]) => b - a)
              : [];

            return (
              <div key={name} className="card">
                <div className="card-header">
                  <h3 className="text-base text-bark-100 font-display">
                    {info.name}
                  </h3>
                  <p className="text-xs text-sage-400 italic mt-0.5">
                    {info.aroma}
                  </p>
                </div>
                <div className="card-body space-y-3">
                  <p className="text-sm text-bark-300 leading-relaxed">
                    {info.description}
                  </p>

                  {/* Effects */}
                  {sortedEffects.length > 0 && (
                    <div>
                      <p className="label">Effects</p>
                      <div className="flex flex-wrap gap-1.5">
                        {sortedEffects.map(([tag, weight]) => (
                          <span
                            key={tag}
                            className={`${EFFECT_COLORS[tag as ExperienceTag] ?? "badge-sage"} text-[11px]`}
                          >
                            {tag}
                            <span className="ml-1 opacity-60 font-mono text-[10px]">
                              {Math.round((weight as number) * 100)}%
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Found in */}
                  <div>
                    <p className="label">Found in</p>
                    <p className="text-xs text-bark-400">
                      {info.foundIn.join(" · ")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-bark-500 text-sm">No terpenes match your search.</p>
          </div>
        )}
      </main>
    </div>
  );
}
