# Cannabinoid Experience Creator

A local-first web app for blending cannabis strains and exploring terpene-driven experience predictions. Built with Next.js, React, TypeScript, and Tailwind CSS.

> **⚠️ Informational Only.** This tool does not provide medical advice. Predicted experiences are heuristic approximations. Individual results vary. Cannabis legality depends on your jurisdiction. Start low, go slow.

---

## Features

- **Strain Library** — Search, add, edit, delete strains. Each strain stores THC%, CBD%, and exactly 3 dominant terpenes (from a standard list or custom entries).
- **Blend Builder** — Combine up to 3 strains with adjustable weight sliders that must sum to 100%.
- **Experience Prediction** — Heuristic engine computes blended THC/CBD, terpene dominance, a primary experience label, secondary tags, intensity (1–10), and a full explanation of how the prediction was derived.
- **Persistence** — All data lives in `localStorage`. No accounts, no server, no tracking.
- **Seed Data** — 10 example strains loaded on first run.
- **Reset** — One-click reset to demo defaults (with confirmation).

---

## Prerequisites

- **Node.js** ≥ 18.17 (LTS recommended)
- **npm** ≥ 9 (ships with Node)

Verify:

```bash
node --version   # Should print v18.x or v20.x+
npm --version    # Should print 9.x+
```

If you don't have Node.js, install it from [https://nodejs.org](https://nodejs.org) (LTS).

---

## Setup & Run

### 1. Create the project folder

**macOS / Linux:**

```bash
mkdir -p ~/Projects/cannabinoid-experience-app
cd ~/Projects/cannabinoid-experience-app
```

Your full path will be something like:
```
/Users/yourname/Projects/cannabinoid-experience-app
```

**Windows (PowerShell):**

```powershell
mkdir C:\Users\$env:USERNAME\Projects\cannabinoid-experience-app
cd C:\Users\$env:USERNAME\Projects\cannabinoid-experience-app
```

Your full path will be something like:
```
C:\Users\YourName\Projects\cannabinoid-experience-app
```

### 2. Copy all project files into this folder

Place the following file tree into the folder you just created:

```
cannabinoid-experience-app/
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── vitest.config.ts
├── README.md
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── lib/
    │   ├── types.ts
    │   ├── constants.ts
    │   ├── prediction.ts
    │   ├── storage.ts
    │   └── seed-data.ts
    ├── components/
    │   ├── StrainLibrary.tsx
    │   ├── StrainModal.tsx
    │   ├── BlendBuilder.tsx
    │   ├── ResultsPanel.tsx
    │   ├── Disclaimer.tsx
    │   └── ResetButton.tsx
    └── __tests__/
        └── prediction.test.ts
```

### 3. Install dependencies

```bash
npm install
```

This creates `node_modules/` and `package-lock.json`. Takes ~30–60 seconds.

### 4. Run the development server

```bash
npm run dev
```

Open your browser to:

```
http://localhost:3000
```

The app hot-reloads on file changes.

### 5. Run tests

```bash
npm test
```

This runs Vitest against `src/__tests__/prediction.test.ts` (8 test cases). All should pass.

### 6. Production build (optional)

```bash
npm run build
npm start
```

The production server runs at `http://localhost:3000`.

---

## Data Model

### Strain
| Field | Type | Constraints |
|-------|------|-------------|
| `id` | string (UUID) | Auto-generated |
| `name` | string | Required, max 80 chars |
| `thcPercent` | number | 0–40 |
| `cbdPercent` | number | 0–40 |
| `dominantTerpenes` | [string, string, string] | Exactly 3 |
| `notes` | string? | Optional, max 300 chars |
| `createdAt` | ISO string | Auto |
| `updatedAt` | ISO string | Auto |

### Blend
Up to 3 `BlendEntry` objects (`strainId` + `weight`), weights summing to 100.

### Prediction Result
- `blendedThc` / `blendedCbd` — weighted averages
- `terpeneScores` — weighted terpene presence map
- `primaryLabel` — one of 8 experience tags
- `secondaryTags` — next 3 highest-scored tags
- `intensity` — 1–10, derived from THC moderated by CBD
- `explanation` — array of human-readable reasoning lines

---

## Prediction Engine (Heuristics)

1. **Blended cannabinoids** = Σ(strain THC/CBD × weight/100)
2. **Terpene scores** = For each strain's 3 terpenes, each contributes ⅓ × (strain weight / 100)
3. **Tag scoring** = Sum of (terpene presence × terpene effect weights) + (THC factor × THC tag weights) + (CBD factor × CBD tag weights)
4. **Primary label** = highest-scoring tag
5. **Intensity** = (blendedTHC / 40) × 10 − (blendedCBD × 0.15), clamped [1, 10]

See `src/lib/prediction.ts` for the complete, documented implementation.

**Absolutely no medical claims are made.** This is a toy heuristic for exploration purposes.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Testing | Vitest |
| Persistence | localStorage (versioned schema) |

---

## License

Private / personal use. No warranty. Not medical advice.
