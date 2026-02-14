# Changelog

## 2026-02-13 — Terpene Library & Tooltips

### Added

- **Terpene Library page** (`/terpenes`) — a searchable grid of all 15 standard terpenes, each displayed as a card showing:
  - Aroma profile
  - Description of effects and character
  - Weighted effect tags from the prediction engine
  - Common natural sources
- **Terpene hover tooltips** in the Strain Library — hovering over any terpene badge on a strain now shows a compact popup with the terpene's aroma, description, and top associated effects.
- **Navigation** — "Terpene Library" link added to the main page header; the terpene page links back to the blender.

### New files

| File | Purpose |
|------|---------|
| `src/lib/terpene-info.ts` | Terpene metadata (name, aroma, description, natural sources) for all 15 standard terpenes |
| `src/components/TerpeneTooltip.tsx` | Reusable hover tooltip that renders terpene info from `terpene-info.ts` |
| `src/app/terpenes/page.tsx` | Terpene Library page with search and card grid |

### Modified files

| File | Change |
|------|--------|
| `src/components/StrainLibrary.tsx` | Wrapped terpene badges with `TerpeneTooltip` |
| `src/app/page.tsx` | Added `Link` to `/terpenes` in the header alongside the reset button |
