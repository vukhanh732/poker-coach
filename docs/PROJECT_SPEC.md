# Poker Coach — Full Project Spec

**Last updated:** 2026-05-20
**Status:** Active development
**Target audience:** Live $1/$2–$2/$3 cash game players

---

## 1. Product Overview

Poker Coach is a production-grade web app for live cash game players to study preflop ranges, practice pot odds, log hands, analyze play with AI coaching, and run interactive simulations against a rule-based AI villain. The app is mobile-first (played at the table on a phone) with a full desktop experience for deep study sessions.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React Server Components) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4, shadcn/ui primitives |
| Animations | Framer Motion |
| Charts | Recharts |
| ORM | Drizzle ORM |
| Database | Supabase Postgres (RLS-scoped per user) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Forms | React Hook Form + Zod |
| AI Coaching | Groq SDK (llama-3.3-70b-versatile) |
| Hand Analysis | Anthropic SDK / Claude claude-sonnet-4-6 |
| Package manager | Bun |
| Testing | Vitest |
| Deployment | Vercel |

---

## 3. Architecture

### App Router Structure

```
src/app/
  (auth)/
    login/          ← email/password + Google OAuth
    signup/         ← name, email, password, stake level
    callback/       ← OAuth redirect handler
  (dashboard)/      ← all routes require auth (middleware-protected)
    trainer/        ← preflop range trainer
    calculator/     ← pot odds calculator
    hands/          ← hand history logger
    quiz/           ← quiz engine with spaced repetition
    analyzer/       ← Claude AI hand analyzer
    simulate/       ← me vs machine simulation
    exploits/       ← exploit library
    progress/       ← study plan + streak tracker
    settings/       ← profile + preferences
  actions/          ← Next.js Server Actions (all mutations)
  layout.tsx        ← root layout, fonts, theme provider
```

### Navigation

- **Mobile (≤768px):** Fixed bottom tab bar — Trainer, Odds, Hands, Quiz, Simulate
- **Desktop (≥768px):** Left sidebar — full nav with all pages
- **Theme:** Felt-green dark (#1a472a accents), gold highlights, Space Mono for cards/numbers

### Auth & Data Security

- Supabase SSR clients (one for browser, one for server)
- Middleware at `src/middleware.ts` redirects unauthenticated users from `/dashboard/*` to `/login`
- All database tables use Row Level Security — users can only read/write their own data
- Server Actions validate session before any mutation

---

## 4. Database Schema

Six tables, all RLS-scoped to `auth.users.id`:

### `users`
App-level profile mirroring Supabase auth. Fields: `id`, `email`, `full_name`, `stake_level` (1_2 / 2_3 / 5_10), `location`, `study_goals`, timestamps.

### `hand_logs`
Each hand a user logs manually. Fields: `hand` (e.g. "AKs"), `position`, `streets` (jsonb — preflop/flop/turn/river actions), `tags` (mistake/tough_spot/bluff_caught/hero_call/value_bet), `result`, `pnl` (cents), `villain_notes`, `effective_stack`, `pot_size`.

### `quiz_attempts`
Per-question quiz history with SM-2 spaced repetition fields. Fields: `question_id`, `category`, `correct`, `response_time_ms`, `ease_factor`, `interval`, `repetitions`, `next_review_at`.

### `analyzed_hands`
Saved Claude AI analyses. Fields: `raw_hand` (pasted text), `analysis_json` (structured — summary, streets, key decision points, exploitative adjustments, solver perspective, verdict), `tags`.

### `villain_profiles`
User-created villain notes. Fields: `name`, `player_type`, `notes`, `tells[]`, `seat`, `casino`.

### `study_streaks`
One row per user. Fields: `current_streak`, `longest_streak`, `last_active_date`, `total_study_minutes`.

---

## 5. Features — Implemented

### 5.1 Preflop Range Trainer (`/trainer`)

**Study mode:** Position picker (8 positions: UTG through BB) → 13×13 hand grid color-coded by action (green=raise, yellow=call, red=fold, striped=mixed). Tap any cell → detail drawer with explanation, sizing recommendation, and common mistakes.

**Quiz mode:** Random hand + position → user picks raise/call/fold → result + explanation. Saves attempt to `quiz_attempts`.

**Drill mode:** 30-hand timed sprint, accuracy scoring, position breakdown.

**Cash/Tournament toggle:** Cash game uses Jonathan Little-style 9-handed exploitative ranges. Tournament mode uses ICM-adjusted ranges (tighter UTG, wider BTN steal spots).

**Range data:** `src/data/ranges.ts` — Set-based lookups for existing trainer, plus `CASH_RANGES`/`TOURNAMENT_RANGES` as `RangeEntry[]` for simulation/solver use.

### 5.2 Pot Odds Calculator (`/calculator`)

Live calculator: pot size + bet size + outs → equity needed vs equity you have. Rule of 2/4 explainer panel. Visual equity bars with threshold line. 20+ pre-loaded scenarios with a scenario quiz mode (call/fold + reasoning input).

### 5.3 Hand History Logger (`/hands`)

Mobile-first hand entry form with street-by-street action fields. Tag picker. Filter + search by hand/position/tag/date. Recharts P&L trend line and position win rate breakdown. Full CRUD via Server Actions.

### 5.4 AI Hand Analyzer (`/analyzer`)

Paste or type a hand history → Claude claude-sonnet-4-6 returns structured analysis: street-by-street breakdown, decision points, alternative lines, exploitative adjustments. Saved to `analyzed_hands` table with tagging and search.

### 5.5 Quiz Engine (`/quiz`)

50+ questions across 6 categories: preflop ranges, pot odds, board texture, bet sizing, exploits, river decisions. SM-2 spaced repetition algorithm — wrong answers surface sooner. Daily challenge: 10 questions, streak tracking. Difficulty: beginner / intermediate / advanced.

### 5.6 Me vs Machine Simulation (`/simulate`)

**Setup:** Pick villain type (Nit / TAG / LAG / Fish) and game type (Heads-Up / 6-Max).

**Game loop:** Cards dealt (random, Fisher-Yates shuffle). Hero sees hole cards, villain hidden. Street-by-street action: hero folds/calls/raises → villain responds via rule-based AI. Continues preflop → flop → turn → river → showdown.

**Villain AI** (`src/lib/poker/villain.ts`): Each type has thresholds for fold/call/raise based on hand strength (derived from Monte Carlo equity) and pot odds. Randomized bluff frequency per type. No LLM latency per action.

**Poker engine** (`src/lib/poker/`):
- `deck.ts` — 52-card deck, Fisher-Yates shuffle, deal
- `hand-eval.ts` — 5-card hand evaluator (HandRank enum + kickers), `bestHandFrom` for 7-card best-of
- `equity.ts` — Monte Carlo equity (200 random runouts per street)

**Post-hand analysis:** After showdown, "Get AI Analysis" calls Groq → structured per-street coaching: verdict (good/marginal/mistake) + tip + overall score 0–100.

**Tests:** 20 vitest tests covering deck, hand evaluator, equity, and villain AI. All passing.

### 5.7 Exploit Library (`/exploits`)

6 common $1/$2 player archetypes: calling station, nit, maniac, TAG, LAG, fish. Each has tells, counter-strategy, what NOT to do, and sample hand situations. User-created villain profiles stored in `villain_profiles` table.

### 5.8 Progress Tracker (`/progress`)

30-day study plan generated from weakest quiz categories. Daily streak + study time tracker. Achievement badges: first 100 hands, 90%+ preflop accuracy, 7-day streak.

### 5.9 Settings (`/settings`)

Stake selection, range export/import (JSON), account info, sign out.

---

## 6. Features — Planned (Solver Integration)

> See full spec: `docs/superpowers/specs/2026-05-20-solver-integration-design.md`

### 6.1 GTO Preflop Frequencies on Trainer

Pre-computed GTO preflop solutions (published solver outputs, 9-handed, 100BB effective) encoded as JSON files in `public/solver/preflop/`. One file per position, schema:

```json
{ "AKs": { "raise": 1.0, "call": 0.0, "fold": 0.0 }, "72o": { "raise": 0.0, "call": 0.0, "fold": 1.0 } }
```

`src/lib/solver/preflop.ts` fetches and caches these. `HandCell` in the trainer grid shows a `GTOFrequencyBar` overlay (raise/call/fold % as colored bars). Fallback: if JSON unavailable, trainer renders without overlay — no breakage.

### 6.2 Real-Time Postflop Solver on Simulate + Analyzer

`wasm-postflop` (Rust postflop solver compiled to WebAssembly) loaded client-side from `public/solver/postflop/`. A `useSolver` React hook manages loading, solve state, and results. After each street in `/simulate`, a `SolverPanel` shows GTO action frequencies for hero's current hand. On `/analyzer`, GTO frequencies render alongside Groq's coaching narrative (parallel, independent).

Solve time: 5–30s. Timeout at 45s with graceful fallback. WASM loads lazily on first use.

---

## 7. Key Source Files

```
src/
  lib/
    poker/
      deck.ts           ← Card type, makeDeck, shuffle, dealCards
      hand-eval.ts      ← HandRank enum, evaluateHand, bestHandFrom
      equity.ts         ← calculateEquity (Monte Carlo)
      villain.ts        ← VillainType, villainDecide
    db/
      schema.ts         ← all 6 Drizzle table definitions + relations
      index.ts          ← db singleton (postgres + drizzle)
    supabase/
      client.ts         ← browser Supabase client
      server.ts         ← server Supabase client (SSR)
    claude.ts           ← Anthropic SDK client with prompt caching
    srs.ts              ← SM-2 spaced repetition algorithm
  data/
    ranges.ts           ← all preflop range data + GTO mode types
    range-explanations.ts ← per-hand coaching text
    questions.ts        ← 50+ quiz questions
    scenarios.ts        ← 20+ pot odds scenarios
    player-types.ts     ← 6 villain archetypes
  hooks/
    useSimulation.ts    ← game state machine (phase, cards, pot, actions)
  app/
    actions/
      simulation.ts     ← analyzeSimulation() → Groq street-by-street critique
      analyzer.ts       ← analyzeHand() → Claude full hand analysis
      hand-logs.ts      ← CRUD for hand_logs table
      quiz.ts           ← saveQuizAttempt()
      quiz-engine.ts    ← SRS quiz logic
      villains.ts       ← CRUD for villain_profiles
      profile.ts        ← updateProfile()
      auth.ts           ← signOut()
```

---

## 8. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL        ← Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   ← Supabase anon key
DATABASE_URL                    ← Postgres connection string (pooled, for Drizzle)
GROQ_API_KEY                    ← Groq API key (simulation analysis)
ANTHROPIC_API_KEY               ← Anthropic API key (hand analyzer)
NEXT_PUBLIC_APP_URL             ← App URL for OAuth redirects
```

---

## 9. Development Commands

```bash
bun run dev          ← start dev server (Turbopack) at localhost:3000
bun run build        ← production build
bun run test         ← run vitest (20 tests, all passing)
bun run test:watch   ← watch mode
bun run type-check   ← tsc --noEmit (0 errors)
bun run db:generate  ← generate Drizzle migrations
bun run db:push      ← push schema to Supabase
bun run db:studio    ← open Drizzle Studio
```

---

## 10. Implementation Status

| Feature | Status |
|---|---|
| Auth (login/signup/OAuth) | ✅ Complete |
| Layout + navigation | ✅ Complete |
| Database schema + migrations | ✅ Complete |
| Preflop Range Trainer | ✅ Complete |
| Pot Odds Calculator | ✅ Complete |
| Hand History Logger | ✅ Complete |
| AI Hand Analyzer (Claude) | ✅ Complete |
| Quiz Engine (SM-2 SRS) | ✅ Complete |
| Exploit Library | ✅ Complete |
| Progress Tracker | ✅ Complete |
| Settings | ✅ Complete |
| Me vs Machine Simulation | ✅ Complete |
| GTO Preflop JSON (trainer) | 🔲 Planned |
| WASM Postflop Solver (simulate + analyzer) | 🔲 Planned |

---

## 11. Planned Work (Next)

1. **Solver integration** — see `docs/superpowers/specs/2026-05-20-solver-integration-design.md` for full spec
2. **PWA manifest** — offline-capable install for mobile use at the table
3. **Vercel deployment** — production deploy with env var configuration
