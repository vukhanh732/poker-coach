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
| Charts | Recharts (progress page only — use raw SVG for sparklines) |
| ORM | Drizzle ORM |
| Database | Supabase Postgres (RLS-scoped per user) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Forms | React Hook Form + Zod |
| AI Coaching | Groq SDK (llama-3.3-70b-versatile) |
| Hand Analysis | Anthropic SDK / Claude claude-sonnet-4-6 |
| Package manager | Bun |
| Testing | Vitest |
| Rate limiting | Upstash Redis |
| Error tracking | Sentry |
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

- **Mobile (≤768px):** Fixed bottom tab bar — Trainer, Odds, **Hands (center, elevated, with + overlay)**, Quiz, Simulate
- **Desktop (≥768px):** Left sidebar — full nav with all pages

### Auth & Data Security

- Supabase SSR clients (one for browser, one for server)
- Middleware at `src/middleware.ts` redirects unauthenticated users from `/dashboard/*` to `/login`
- All database tables use Row Level Security — users can only read/write their own data
- **All Server Actions MUST use the SSR client with the user's JWT — never a service-role key**. This ensures RLS enforces ownership on writes, not just reads.
- Server Actions validate session before any mutation.

### Database Connection (Drizzle + Supabase)

- `DATABASE_URL` uses the **pooled** connection string for Drizzle in serverless functions
- Because pgBouncer in transaction mode breaks prepared statements, the postgres-js client MUST be initialized with `prepare: false`:
  ```ts
  import postgres from 'postgres';
  const client = postgres(process.env.DATABASE_URL!, { prepare: false });
  ```
- For migrations (`db:push`, `db:generate`), use the **session-mode** connection string in a separate `DATABASE_URL_UNPOOLED` env var.

---

## 4. Design System (LOCKED)

> These tokens are authoritative. Do not improvise replacements.

### Color tokens

```css
/* Felt palette */
--felt-900: #0d2818;       /* page background */
--felt-800: #1a472a;       /* primary surface / felt accent */
--felt-700: #2d8659;       /* raise / success / primary action */
--felt-600: #3da66f;       /* raise hover */

/* Gold accents */
--gold-500: #d4a627;       /* call action / muted gold */
--gold-400: #f5c518;       /* selection ring / highlight / hearts+diamonds */

/* Action states */
--action-fold: #3a1f1f;    /* warm dark, NOT red — red reads as "error" */
--action-mixed-stripe-a: #2d8659;  /* diagonal stripe with gold */
--action-mixed-stripe-b: #d4a627;

/* Neutrals */
--ink-50:  #f5f1e8;        /* primary text on dark */
--ink-300: #a8a496;        /* secondary text */
--ink-500: #6b6859;        /* tertiary text / labels */
--surface-elevated: #1f3a2a;  /* card surface */
--border-subtle: rgba(245, 241, 232, 0.08);
--border-strong:  rgba(245, 241, 232, 0.16);

/* Semantic (use sparingly) */
--success: #2d8659;
--danger:  #b84545;        /* errors only — never for "fold" */
--warning: #d4a627;
```

### Typography

- **Display / headings:** Fraunces (variable serif), optical-size axis pushed high. Weights 500–600.
- **Body:** IBM Plex Sans, 400/500.
- **Numerics, cards, ranks, P&L, stack sizes:** Space Mono, 400/500.
- Load via `next/font/google` with `display: 'swap'`.

### Component primitives

These must be built as reusable components, not inlined per-page:

1. **`<PlayingCard size="sm" | "lg" rank suit />`**
   - `sm`: 32px wide (hand-log rows)
   - `lg`: 60px wide (simulate, analyzer)
   - Rank in Space Mono
   - Suit as inline SVG (never Unicode — renders inconsistently on mobile)
   - Hearts/diamonds in `--gold-400` (NOT red — red is reserved for errors only)
   - Spades/clubs in `--ink-50`
   - Card body: `--ink-50` on `--surface-elevated`, 0.5px `--border-strong` inner border
   - No shadow, no gloss

2. **`<HandCell hand action gtoFreq selected />`**
   - Single cell in the 13×13 grid
   - `action` ∈ `raise | call | mixed | fold`, drives background color
   - `gtoFreq` (optional): `{ raise: number, call: number, fold: number }` → renders a 4px-tall frequency strip along the bottom edge
   - Selection state: 2.5px `--gold-400` ring
   - Hand label in Space Mono, 11px, color matches contrast against fill

3. **`<GTOFrequencyBar raise call fold height={24} />`**
   - Three flex segments, each labeled with its % if ≥15% of bar width
   - Used in the trainer detail panel AND in `<SolverPanel>` on simulate/analyzer

4. **`<DecisionClock seconds={15} onExpire />`**
   - Thin circular SVG ring around the action button row in `/simulate`
   - 15s default, configurable in settings, can be disabled
   - Hits `--gold-400` at 5s, `--danger` at 2s

5. **`<Sparkline data height={40} />`**
   - Raw SVG, single path, no axes
   - Used for P&L on hand-log rows and `/progress`
   - Replaces Recharts for this use case (Recharts stays for the position-breakdown bar chart only)

### Motion

- Framer Motion for: card deal (stagger 60ms, x/y from deck position), action button press (scale 0.96), detail-panel slide-in (200ms ease-out).
- Reduce-motion: respect `prefers-reduced-motion` everywhere.

---

## 5. Database Schema

All RLS-scoped to `auth.users.id`. **Bold = changed/new since previous spec.**

### `users`
`id`, `email`, `full_name`, `stake_level` (1_2 / 2_3 / 5_10), `location`, `study_goals`, timestamps.

### `hand_logs`
`hand` (e.g. "AKs"), `position`, **`game_type` (cash / tournament — NEW)**, `streets` (jsonb), `tags` (Postgres enum: mistake / tough_spot / bluff_caught / hero_call / value_bet), `result`, `pnl` (cents — integer, never float), `villain_notes`, `effective_stack`, `pot_size`.

### `quiz_attempts`
`question_id`, `category`, **`game_type` (cash / tournament — NEW)**, `correct`, `response_time_ms`, `ease_factor`, `interval`, `repetitions`, **`lapses` (integer, default 0 — NEW; increments on every failure, flag as "leech" at ≥4)**, `next_review_at`.

### `analyzed_hands`
`raw_hand`, `analysis_json`, `tags`.

### `villain_profiles`
`name`, `player_type`, `notes`, `tells[]`, `seat`, `casino`.

### `study_streaks`
One row per user. `current_streak`, `longest_streak`, `last_active_date`, `total_study_minutes`.

### Schema rules (enforced)

- `tags` columns are Postgres enums or `CHECK` constraints, never freeform text
- All money in cents (integer)
- All timestamps `timestamptz`

---

## 6. Features — Implemented

### 6.1 Preflop Range Trainer (`/trainer`)

Position picker (8 positions: UTG through BB) → 13×13 hand grid. Study / Quiz / Drill modes. Cash/Tournament toggle. Range data in `src/data/ranges.ts`.

### 6.2 Pot Odds Calculator (`/calculator`)

Live calculator with rule of 2/4 explainer. 20+ pre-loaded scenarios with quiz mode.

### 6.3 Hand History Logger (`/hands`)

Mobile-first hand entry. Tag picker. Filter/search. P&L sparkline. CRUD via Server Actions.

### 6.4 AI Hand Analyzer (`/analyzer`)

Claude (claude-sonnet-4-6) returns structured analysis. Saved to `analyzed_hands`.

### 6.5 Quiz Engine (`/quiz`)

50+ questions, 6 categories. SM-2 spaced repetition. Daily challenge, streak tracking.

### 6.6 Me vs Machine Simulation (`/simulate`)

Villain types (Nit / TAG / LAG / Fish), heads-up or 6-max. Rule-based AI in `src/lib/poker/villain.ts`. Poker engine in `src/lib/poker/`. Post-hand Groq analysis. 20 vitest tests passing.

### 6.7 Exploit Library (`/exploits`)

6 archetypes with counter-strategy. User-created villain profiles.

### 6.8 Progress Tracker (`/progress`)

30-day study plan, streak tracker, achievement badges.

### 6.9 Settings (`/settings`)

Stake, range export/import, account, sign out.

---

## 7. Phased Work Plan

> Each phase is one PR. Phases are ordered by priority — ship in order, do not skip ahead.

### PHASE 1 — Reliability & Security Fixes

**Goal:** Make existing code production-safe before adding new features.

**Tasks:**

1. **Audit all Server Actions** in `src/app/actions/`. For each one:
   - Confirm it uses the SSR Supabase client (`createServerClient` from `@supabase/ssr`)
   - Confirm it does NOT use the service-role key
   - Confirm it calls `supabase.auth.getUser()` before any mutation and returns 401 if no user
   - Add a comment at the top of each action: `// RLS-enforced via SSR client`

2. **Fix Drizzle pgBouncer compatibility** in `src/lib/db/index.ts`:
   - Initialize postgres-js with `{ prepare: false }`
   - Add a separate `DATABASE_URL_UNPOOLED` env var for migrations
   - Update `bun run db:push` and `bun run db:generate` to use the unpooled URL
   - Document both vars in `.env.example`

3. **Increase Monte Carlo equity precision** in `src/lib/poker/equity.ts`:
   - Bump default runouts from 200 → 2000
   - For river spots (5 board cards already known), enumerate exactly instead of sampling — there are only C(44,2) = 946 villain hands max, this is cheap and removes variance entirely
   - Add a `runouts?: number` parameter so tests can use lower counts for speed
   - Update villain AI tests to verify equity-based decisions still pass with new precision

4. **Add rate limiting** to AI endpoints using Upstash Redis:
   - `/analyzer` (Claude): 10 requests per user per hour
   - `/simulate` post-hand analysis (Groq): 30 per user per hour
   - Return 429 with a clear error message and reset time
   - Add `RATELIMIT_REDIS_URL` and `RATELIMIT_REDIS_TOKEN` to env

5. **Add Sentry** for error tracking:
   - `@sentry/nextjs` with sourcemap upload on Vercel
   - Set up sample rate: 100% errors, 10% performance
   - Add `SENTRY_DSN` to env

**Acceptance:** All existing tests pass. Manual smoke test: log in, log a hand, run a simulation, analyze a hand. No regressions.

---

### PHASE 2 — Schema Updates

**Goal:** Add the missing fields the spec calls for.

**Tasks:**

1. **Generate migration** adding:
   - `hand_logs.game_type` (enum: `cash` | `tournament`, default `cash`, NOT NULL)
   - `quiz_attempts.game_type` (same enum, default `cash`, NOT NULL)
   - `quiz_attempts.lapses` (integer, default 0, NOT NULL)

2. **Convert `hand_logs.tags` to a Postgres enum** if not already:
   - Values: `mistake | tough_spot | bluff_caught | hero_call | value_bet`
   - Add a backfill step for any existing freeform values

3. **Update Drizzle schema** in `src/lib/db/schema.ts` to match.

4. **Update SM-2 logic** in `src/lib/srs.ts`:
   - Increment `lapses` on every failure
   - Expose a `isLeech(attempt)` helper: `attempt.lapses >= 4`
   - Surface leeches in the `/quiz` UI with a small warning badge

5. **Update hand-log filter UI** to include game_type as a filter chip.

**Acceptance:** Migration runs cleanly on a fresh DB. Existing hand_logs default to `cash`. Quiz UI shows a leech badge on the affected card.

---

### PHASE 3 — Design System Foundation

**Goal:** Lock in the visual language before building new features on top.

**Tasks:**

1. **Set up fonts** via `next/font/google` in `src/app/layout.tsx`:
   - Fraunces (variable, opsz axis)
   - IBM Plex Sans (weights 400, 500)
   - Space Mono (weights 400, 700)
   - Expose as CSS variables `--font-display`, `--font-body`, `--font-mono`

2. **Update Tailwind config** with the locked color tokens from Section 4. Define semantic Tailwind class names: `bg-felt-900`, `text-ink-50`, `border-border-subtle`, etc.

3. **Build `<PlayingCard>`** in `src/components/cards/PlayingCard.tsx`:
   - Props per spec in Section 4
   - Storybook story (or `.examples.tsx` file) showing all 52 cards in both sizes
   - Vitest snapshot test

4. **Build `<HandCell>`** in `src/components/trainer/HandCell.tsx`:
   - Replace the existing cell implementation in the trainer grid
   - Include GTO frequency strip at bottom (renders nothing if no GTO data)

5. **Build `<GTOFrequencyBar>`** in `src/components/trainer/GTOFrequencyBar.tsx`.

6. **Build `<Sparkline>`** in `src/components/charts/Sparkline.tsx`:
   - Replace Recharts line chart in `/hands` and `/progress`
   - Keep Recharts for the position-breakdown bar chart in `/progress` only

7. **Build `<DecisionClock>`** in `src/components/simulate/DecisionClock.tsx`:
   - Wire into `/simulate` action button row
   - Add a settings toggle (default: enabled, 15s)

**Acceptance:** Trainer grid renders with new HandCell components. Hand-log P&L uses Sparkline. Simulate shows the decision clock. Visual regression: take screenshots of each route and compare to designs — no off-palette colors anywhere.

---

### PHASE 4 — Hand Log Entry Redesign

**Goal:** Make logging a hand take <15 seconds.

**Tasks:**

1. **Build "Quick Log" mode** as the default on `/hands`:
   - 4 fields only: hand, position, result (won/lost/folded), P&L
   - Single screen, no streets
   - Full Log mode behind a "Add streets" expansion

2. **Redesign Full Log entry** so postflop streets only appear if the hand reached the flop:
   - Preflop section always visible
   - Flop section appears after user toggles "Saw flop"
   - Turn section appears after user toggles "Saw turn"
   - Same for river

3. **Reduce preflop entry to 3 taps:**
   - Tap 1: position (chip row)
   - Tap 2: action (raise / call / 3-bet / fold)
   - Tap 3: sizing (preset chips: 2bb, 2.5bb, 3bb, custom)

4. **Empty state** on `/hands` for new users:
   - Render one example hand inline (AKs, BTN, won $42, tagged "value_bet")
   - Label it "← example, swipe to delete"
   - Removes itself on first real hand logged

5. **(Stretch) Voice input** on mobile:
   - Web Speech API behind a feature flag
   - Parses "ace king suited, button, raised to 12, called by big blind" into form fields
   - If unavailable or parse fails, fall through to form

**Acceptance:** A user can log a basic won-hand in 4 taps. Postflop fields don't appear if irrelevant. New users see the example hand.

---

### PHASE 5 — PWA & Table-Use Optimization

**Goal:** Ship the at-the-table experience before solver work.

**Tasks:**

1. **PWA manifest** in `public/manifest.json`:
   - Standalone display mode
   - Icons (192, 512, maskable)
   - Theme color `#0d2818`, background `#0d2818`

2. **Service worker** (via `next-pwa` or workbox):
   - Cache `/trainer`, `/calculator`, `/exploits` shells for offline use
   - Cache range JSON files
   - Network-first for `/hands`, `/quiz`, `/simulate` (need fresh data)

3. **Install prompt** on `/settings` and as a one-time banner on first mobile session.

4. **High-contrast mode toggle** in settings — boosts text contrast for casino lighting.

5. **Big-touch-target audit:** every interactive element on mobile must be ≥44×44px. Add a Vitest + Playwright check.

**Acceptance:** App installs as PWA on iOS and Android. Trainer + calculator work fully offline. Lighthouse PWA score ≥90.

---

### PHASE 6 — GTO Preflop JSON Overlay

**Goal:** Layer GTO data onto the trainer.

**Tasks:**

1. **Generate or source** 9-handed 100bb GTO preflop solutions (raise/call/fold frequencies) per position. Store as JSON in `public/solver/preflop/`:
   ```
   public/solver/preflop/utg.json
   public/solver/preflop/utg1.json
   ...
   public/solver/preflop/bb.json
   ```
   Schema: `{ "AKs": { "raise": 1.0, "call": 0.0, "fold": 0.0 }, ... }`

2. **Build `src/lib/solver/preflop.ts`:**
   - `loadPreflopGTO(position): Promise<GTOFrequencies>`
   - In-memory cache after first fetch
   - Return `null` gracefully if file missing — trainer must not crash

3. **Wire GTO data into `<HandCell>` and trainer detail panel.**

4. **Add a toggle** in `/settings`: "Show GTO frequencies" (default on).

**Acceptance:** Every position's grid shows the frequency strip on each cell. Detail panel shows the full bar. Disabling in settings cleanly removes the overlay.

---

### PHASE 7 — WASM Postflop Solver (Stretch)

**Goal:** Real-time postflop solves in simulate + analyzer.

**Tasks:**

1. **Integrate `wasm-postflop`** — load from `public/solver/postflop/` via dynamic import on first use.

2. **Build `useSolver` hook** managing: loading state, solve in progress, results, error.

3. **Reduce range granularity for mobile:**
   - Detect mobile/low-memory devices
   - Cluster ranges to ~20 strategic combos instead of 169 on mobile
   - Cap tree depth at 2 streets ahead

4. **Build `<SolverPanel>`** showing GTO action frequencies for hero's current hand on `/simulate`.

5. **Wire into `/analyzer`** alongside Claude's narrative (parallel, independent).

6. **Timeout at 45s** with graceful fallback message: "Solver took too long — try a simpler spot or use the Claude analysis."

7. **Server-side solve endpoint** as fallback for mobile users hitting timeouts (optional, behind feature flag).

**Acceptance:** Postflop solve completes in <30s on desktop, <60s on mid-range mobile. Timeout case shows a clear fallback. Lazy load doesn't block first paint.

---

## 8. Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# Database (Drizzle)
DATABASE_URL              ← pooled (transaction mode) for serverless
DATABASE_URL_UNPOOLED     ← session mode for migrations

# AI
GROQ_API_KEY
ANTHROPIC_API_KEY

# App
NEXT_PUBLIC_APP_URL

# Rate limiting
RATELIMIT_REDIS_URL
RATELIMIT_REDIS_TOKEN

# Error tracking
SENTRY_DSN
SENTRY_AUTH_TOKEN         ← for sourcemap upload on Vercel
```

---

## 9. Development Commands

```bash
bun run dev          ← start dev server (Turbopack) at localhost:3000
bun run build        ← production build
bun run test         ← run vitest
bun run test:watch   ← watch mode
bun run type-check   ← tsc --noEmit
bun run db:generate  ← generate Drizzle migrations (uses DATABASE_URL_UNPOOLED)
bun run db:push      ← push schema to Supabase (uses DATABASE_URL_UNPOOLED)
bun run db:studio    ← open Drizzle Studio
```

---

## 10. Implementation Status

| Feature | Status |
|---|---|
| Auth (login/signup/OAuth) | ✅ Complete |
| Layout + navigation | ✅ Complete |
| Database schema + migrations | ✅ Complete (Phase 2 updates pending) |
| Preflop Range Trainer | ✅ Complete |
| Pot Odds Calculator | ✅ Complete |
| Hand History Logger | ✅ Complete (Phase 4 redesign pending) |
| AI Hand Analyzer (Claude) | ✅ Complete |
| Quiz Engine (SM-2 SRS) | ✅ Complete (Phase 2 lapses field pending) |
| Exploit Library | ✅ Complete |
| Progress Tracker | ✅ Complete |
| Settings | ✅ Complete |
| Me vs Machine Simulation | ✅ Complete |
| Phase 1: Reliability & Security | 🔲 Planned |
| Phase 2: Schema Updates | 🔲 Planned |
| Phase 3: Design System | 🔲 Planned |
| Phase 4: Hand Log Redesign | 🔲 Planned |
| Phase 5: PWA | 🔲 Planned |
| Phase 6: GTO Preflop JSON | 🔲 Planned |
| Phase 7: WASM Postflop Solver | 🔲 Planned |

---

## 11. Notes for Claude Code

- **One phase = one PR.** Do not bundle phases.
- **Run `bun run test` and `bun run type-check` before opening any PR.** Both must pass.
- **Design tokens in Section 4 are LOCKED.** Do not substitute fonts or colors. If a token is missing for a use case, ask before improvising.
- **No new dependencies without justification** — check if existing libs (Framer Motion, shadcn primitives) solve the problem first.
- **Server Actions: SSR client only. Never service-role.** This is non-negotiable.
- **Money in cents, integers only. Timestamps in `timestamptz`. Tags in enums.**