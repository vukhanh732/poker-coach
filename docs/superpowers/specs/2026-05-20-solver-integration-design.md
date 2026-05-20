# Solver Integration Design

**Date:** 2026-05-20
**Status:** Approved
**Scope:** Integrate GTO solver data into `/trainer`, `/simulate`, and `/analyzer` pages

---

## Goal

Replace hand-crafted approximations with real GTO solver data across the poker coach app. Pre-computed preflop JSON (published solver outputs) powers the trainer. The wasm-postflop browser engine solves postflop spots in real time on the simulate and analyzer pages. All existing code stays intact as fallback.

---

## Approach: Enhancement Layer (Option A)

Solver data is additive — it layers on top of existing UI and logic. No existing pages break. If solver data is unavailable (load failure, timeout, old browser), the app silently falls back to current behavior (Monte Carlo equity, rule-based villain, hand-crafted ranges).

---

## Architecture

### Layer 1 — Preflop GTO Data (static JSON)

- **Source:** Published GTO preflop solutions (PIOSolver/GTO+ documented outputs for 9-handed live cash, 100BB effective stacks)
- **Storage:** `public/solver/preflop/{POSITION}.json` — one file per position (8 files total)
- **Schema:**
  ```json
  {
    "AKs": { "raise": 1.0, "call": 0.0, "fold": 0.0 },
    "AKo": { "raise": 0.85, "call": 0.0, "fold": 0.15 },
    "72o": { "raise": 0.0, "call": 0.0, "fold": 1.0 }
  }
  ```
  All 169 hand notations covered. Frequencies sum to 1.0.
- **Loading:** Fetched once on trainer page load, cached in module-level Map. Subsequent position changes are instant.
- **Positions covered:** UTG, UTG1, MP, HJ, CO, BTN, SB, BB

### Layer 2 — WASM Postflop Engine (client-side)

- **Source:** wasm-postflop (https://github.com/b-inary/wasm-postflop) — Rust postflop solver compiled to WASM
- **Storage:** `public/solver/postflop/solver.wasm` + `solver.js` (JS glue from wasm-postflop releases)
- **Loading:** Dynamic import on first use, not on page load — avoids blocking initial render
- **Inputs:** hero range (hole cards + position → range matrix), villain range (villain type thresholds → range matrix), board cards, pot size, stack sizes, bet sizing options
- **Outputs:** Per-action frequencies for hero's current hand — `{ bet: 0.67, check: 0.33 }` or `{ call: 0.45, fold: 0.55 }`
- **Solve time:** 5–30s depending on tree complexity; simplified tree (2 bet sizes) targets <10s

### Layer 3 — UI Components

Two new shared components, reused across all three pages:

- **`GTOFrequencyBar`** — horizontal bar showing raise/call/fold % with color coding (green/yellow/red). Accepts `{ raise, call, fold }` frequencies. Used in trainer cells and solver panel.
- **`SolverPanel`** — card component showing postflop solve results. States: loading skeleton, result with frequency bars per action, error message, unavailable fallback.

---

## Data Flow

### `/trainer`

```
User selects position
  → preflop.ts fetches /solver/preflop/{POSITION}.json (cached after first load)
  → HandGrid receives gtoData prop
  → Each HandCell renders GTOFrequencyBar overlay showing raise/call/fold %
  → Tap cell → HandDetail drawer shows exact frequencies + existing explanation
```

### `/simulate`

```
Street ends + villain acts
  → useSolver({ heroCards, villainType, board, pot, heroStack })
  → postflop.ts initializes WASM (once), runs solve()
  → SolverPanel renders below ActionPanel:
      - Loading: skeleton for 5–30s
      - Result: "GTO: Bet 67% · Check 33%" with GTOFrequencyBar
  → Groq analysis at showdown runs unchanged
```

### `/analyzer`

```
User submits hand for analysis
  → analyzeSimulation() (Groq) fires
  → useSolver() fires in parallel
  → Both render independently when ready:
      - Groq panel: street-by-street coaching narrative
      - GTO panel: action frequencies per street
```

---

## New Files

| File | Purpose |
|---|---|
| `public/solver/preflop/UTG.json` … `BB.json` | GTO preflop frequencies, all 169 hands, 8 positions |
| `public/solver/postflop/solver.wasm` | wasm-postflop binary |
| `public/solver/postflop/solver.js` | JS glue for WASM |
| `src/lib/solver/preflop.ts` | fetch + cache JSON, `getPreflopGTO(position, hand)` |
| `src/lib/solver/postflop.ts` | WASM wrapper: `initSolver()`, `solve()`, `getStrategy()` |
| `src/hooks/useSolver.ts` | React hook: `{ strategy, solving, error, solve }` |
| `src/components/features/solver/GTOFrequencyBar.tsx` | Frequency bar component |
| `src/components/features/solver/SolverPanel.tsx` | Postflop result card |

## Modified Files

| File | Change |
|---|---|
| `src/components/features/trainer/HandGrid.tsx` | Accept + pass down `gtoData` prop |
| `src/components/features/trainer/HandCell.tsx` | Render `GTOFrequencyBar` overlay |
| `src/app/(dashboard)/simulate/page.tsx` | Add `SolverPanel` after street ends |
| `src/app/(dashboard)/analyzer/page.tsx` | Add GTO panel alongside Groq output |

---

## Error Handling

| Scenario | Behavior |
|---|---|
| WASM fails to load (old browser, low RAM) | `useSolver` returns `error` state → SolverPanel shows "Solver unavailable" quietly |
| Solve exceeds 45s timeout | Auto-cancel → "Spot too complex" message + option to simplify bet-sizing tree |
| Preflop JSON missing/malformed | `getPreflopGTO` returns null → trainer renders without frequency overlay |
| Groq fails on analyzer | GTO panel still renders (independent promise) |
| Solver fails on analyzer | Groq panel still renders (independent promise) |

---

## Testing

- Unit tests for `preflop.ts`: correct frequency lookup, null return for unknown hands, cache hit on second call
- Unit tests for `postflop.ts`: mock WASM module, verify input formatting and output parsing
- Existing 20 vitest tests unchanged — no poker logic modified
- Manual smoke tests:
  - Trainer: frequency overlay visible on hand grid, correct % for known hands (AA UTG = 100% raise)
  - Simulate: SolverPanel appears after flop with loading state then result
  - Analyzer: GTO and Groq panels render independently

---

## Out of Scope

- `/calculator` page — pot odds math doesn't benefit from solver data
- Preflop solving in WASM (wasm-postflop is postflop only)
- Saving solver results to database
- Custom bet-sizing configuration UI (uses sensible defaults: 33%, 67%, 100% pot)
- GitHub push (handled as final deployment step after implementation)
