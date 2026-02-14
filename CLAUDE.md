# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev          # Dev server with hot-reload (localhost:3000)
npm run build        # Static site generation → /out/
npm run lint         # ESLint via Next.js
npm test             # Run all Vitest tests once
npm run test:watch   # Vitest in watch mode
```

To run a single test file: `npx vitest run src/__tests__/prediction.test.ts`

## Architecture

This is a **local-first single-page application** for predicting cannabinoid blend experiences. There is no backend — all data lives in localStorage, and the build output is static HTML/CSS/JS (`output: 'export'` in next.config.js).

**Stack**: Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS · Vitest

### Code Organization

- **`src/app/`** — Next.js App Router. `page.tsx` is the single page and owns all top-level state (strains, blend entries, prediction result) via React hooks. No Redux/Zustand.
- **`src/components/`** — All `"use client"` components. Receive state as props, communicate via `on*` callback props.
- **`src/lib/`** — Pure business logic with no React dependencies:
  - `prediction.ts` — Heuristic prediction engine (`computePrediction()`). Blends cannabinoids by weight, scores terpene effects via `TERPENE_EFFECT_MAP`, and produces experience tags with intensity.
  - `storage.ts` — Versioned localStorage wrapper with schema migration support. Falls back to `SEED_STRAINS` on corruption.
  - `constants.ts` — Terpene/effect mappings, cannabinoid influence tables, storage keys.
  - `types.ts` — Core interfaces: `Strain`, `BlendEntry`, `PredictionResult`, `ExperienceTag`.
  - `seed-data.ts` — 10 default strains loaded on first use.

### Data Flow

```
localStorage → loadState() → page.tsx useState → props to components
                                ↓ (on change)
                         useEffect → saveState() → localStorage
```

### Key Domain Concepts

- **Strain**: Has THC%, CBD%, exactly 3 dominant terpenes, and optional notes.
- **BlendEntry**: References a strain by ID with a weight (0–100); weights must sum to 100.
- **Prediction**: Weighted cannabinoid averages + terpene scoring → primary `ExperienceTag` + intensity (1–10).
- **ExperienceTag**: One of `Relaxed | Uplifted | Focused | Sleepy | Creative | Social | Body-heavy | Clear-headed`.

## Conventions

- **Path alias**: `@/*` maps to `./src/*`
- **Handler naming**: `handle*` for event handlers in parent, `on*` for callback props
- **Custom Tailwind palette**: `sage` (green), `bark` (brown), `ember` (orange), `void` (gray) — defined in `tailwind.config.ts`
- **Custom fonts**: DM Serif Display (headings), DM Sans (body), JetBrains Mono (numbers) — loaded via Google Fonts in `layout.tsx`
- **Component classes**: `.card`, `.btn-primary/secondary/danger/ghost`, `.input-field`, `.badge-*` defined in `globals.css`
