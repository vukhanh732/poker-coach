# Poker Simulation Feature — Design Spec
Date: 2026-05-20

## Overview
A visual "me vs machine" poker simulation at `/simulate`. User plays a full hand (preflop → river) against a rule-based AI villain on an interactive table. After showdown, Groq provides a street-by-street analysis of every decision.

## Architecture

### New lib modules (`src/lib/poker/`)
- `deck.ts` — 52-card deck, shuffle, deal
- `hand-eval.ts` — rank 5-card hands (straight flush → high card) via lookup
- `equity.ts` — Monte Carlo (1000 runouts) to estimate hero win% at any street
- `villain.ts` — rule-based decision engine: Nit / TAG / LAG / Fish types; decisions based on hand strength, position, pot odds; no LLM per action

### New hook (`src/hooks/useSimulation.ts`)
Client-side state machine managing: street, board, pot, stacks, action history, phase (setup → preflop → flop → turn → river → showdown → analysis). No DB persistence for MVP.

### New server action (`src/app/actions/simulation.ts`)
`analyzeSimulation(history)` — sends full hand history to Groq, returns structured per-street critique: { street, heroAction, equity, verdict: "good"|"marginal"|"mistake", tip }.

### New components (`src/components/features/simulation/`)
- `SimulationSetup.tsx` — pick game type (HU / 6-max), villain type, stakes
- `PokerTable.tsx` — felt table, positions, stacks, pot display
- `HoleCards.tsx` — animated card reveal
- `CommunityCards.tsx` — board cards dealt one by one
- `ActionPanel.tsx` — Fold / Call / Raise buttons + raise sizing slider
- `EquityBadge.tsx` — brief equity flash after each street
- `PostHandReport.tsx` — Groq analysis rendered as cards per street

### Route
`src/app/(dashboard)/simulate/page.tsx`

## Game Flow
1. Setup screen → user picks HU or 6-max, villain difficulty, stakes
2. Cards dealt → hero sees hole cards, villain hidden
3. Action loop per street: hero acts → villain responds (rule-based, ~instant)
4. After river action → showdown: villain cards flip, winner calculated
5. Post-hand report: Groq analyzes every decision (~3s wait with skeleton)

## Villain AI (rule-based, no LLM latency)
- **Nit**: top 10% hands, rarely bluffs, folds to any aggression with marginal hands
- **TAG**: top 20% hands, 3-bets value, folds bluff catchers to big bets
- **LAG**: top 35% hands, floats, semi-bluffs, applies pressure
- **Fish**: random 40% of hands, calls too wide, rare raises

## Ranges Rewrite (separate task)
`src/data/ranges.ts` — replace AI-generated ranges with Jonathan Little-style 9-handed live cash ranges. Add `gameType: "cash" | "tournament"` toggle that swaps range sets. Tournament ranges tighter UTG, slightly wider BTN/CO due to ICM.

## Sidebar/Nav
Add `/simulate` to dashboard sidebar and bottom nav with a `Swords` icon.
