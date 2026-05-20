# Poker Coach Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade poker study app for live $1/$2–$2/$3 cash players covering preflop training, pot odds, hand logging, AI analysis, quiz engine, and exploit library.

**Architecture:** Next.js 15 App Router with React Server Components, Supabase for auth + Postgres (RLS-scoped), Drizzle ORM for type-safe queries, Server Actions for mutations. Mobile-first with bottom tab nav on phone, sidebar on desktop.

**Tech Stack:** Next.js 15, TypeScript strict, Tailwind CSS v4, shadcn/ui, Framer Motion, Recharts, Drizzle ORM, Supabase Auth, React Hook Form + Zod, Claude API, Vercel deployment.

---

## STEP 1 — Foundation Scaffold

### Task 1: Next.js 15 project + dependencies

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`
- Create: `.env.example`, `.env.local` (gitignored)

- [ ] Bootstrap project with bun + Next.js 15
- [ ] Install all production dependencies in one pass
- [ ] Install dev dependencies
- [ ] Verify `bun run build` produces zero TS errors

### Task 2: Tailwind v4 design system

**Files:**
- Create: `src/app/globals.css` — all design tokens + Tailwind imports
- Create: `tailwind.config.ts` — if needed for v4 compat

- [ ] Configure Tailwind v4 with felt-green palette and gold accents
- [ ] Define CSS custom properties for all design tokens
- [ ] Add Space Mono (numbers/cards) and Inter (body) via next/font

### Task 3: shadcn/ui + base components

**Files:**
- Create: `components.json`
- Create: `src/components/ui/*` — shadcn primitives (Button, Dialog, Tabs, Select, Card, Badge, Input, Label, Skeleton)

- [ ] Initialize shadcn/ui for Tailwind v4
- [ ] Add all required primitives

### Task 4: Drizzle ORM + Supabase schema

**Files:**
- Create: `src/lib/db/schema.ts` — all 6 tables
- Create: `src/lib/db/index.ts` — db singleton
- Create: `drizzle.config.ts`
- Create: `drizzle/migrations/0000_init.sql`

- [ ] Define all tables with RLS annotations
- [ ] Generate and verify migration SQL

### Task 5: Supabase auth + middleware

**Files:**
- Create: `src/lib/supabase/client.ts` — browser client
- Create: `src/lib/supabase/server.ts` — server client
- Create: `src/middleware.ts` — protect dashboard routes

- [ ] Configure Supabase SSR clients
- [ ] Add middleware to redirect unauthenticated users

### Task 6: Base layout + navigation

**Files:**
- Create: `src/app/layout.tsx` — root layout, fonts, theme
- Create: `src/app/(dashboard)/layout.tsx` — authenticated shell
- Create: `src/components/layout/BottomNav.tsx` — mobile tab bar
- Create: `src/components/layout/Sidebar.tsx` — desktop sidebar
- Create: `src/components/layout/Header.tsx` — page header

- [ ] Felt-green dark theme shell
- [ ] Responsive: bottom nav on ≤768px, sidebar on ≥768px

### Task 7: Auth pages

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/signup/page.tsx`
- Create: `src/app/(auth)/callback/route.ts` — OAuth callback

- [ ] Login with email/password + Google OAuth button
- [ ] Signup with name, email, password, stake level
- [ ] Redirect to dashboard on success

---

## STEP 2 — Phase 1 Features

### Task 8: Preflop range data layer

**Files:**
- Create: `src/data/ranges.ts` — 9-position range maps keyed by hand notation
- Create: `src/data/range-explanations.ts` — per-hand explanations

- [ ] Define GTO-ish but exploitative $1/$2 ranges for all 9 positions
- [ ] Each hand: action (raise/call/fold/raise-or-fold), sizing, explanation, common mistakes

### Task 9: Hand grid component

**Files:**
- Create: `src/components/features/trainer/HandGrid.tsx`
- Create: `src/components/features/trainer/HandCell.tsx`
- Create: `src/components/features/trainer/HandDetail.tsx` — tap-to-expand drawer

- [ ] 13×13 grid, color-coded by action (green=raise, yellow=call, red=fold, striped=mixed)
- [ ] Mobile-scrollable, tap opens detail drawer with explanation + sizing

### Task 10: Preflop trainer page (Study + Quiz + Drill modes)

**Files:**
- Create: `src/app/(dashboard)/trainer/page.tsx`
- Create: `src/components/features/trainer/QuizMode.tsx`
- Create: `src/components/features/trainer/DrillMode.tsx`
- Create: `src/lib/validators/quiz.ts`
- Create: `src/app/actions/quiz.ts` — Server Action to save quiz_attempts

- [ ] Study mode: position picker → hand grid
- [ ] Quiz mode: random hand+position → raise/call/fold choice → result + explanation
- [ ] Drill mode: 30-hand timed sprint, accuracy scoring, position breakdown

### Task 11: Pot odds calculator

**Files:**
- Create: `src/data/scenarios.ts` — 20+ pre-loaded scenarios
- Create: `src/components/features/calculator/OddsCalculator.tsx`
- Create: `src/components/features/calculator/EquityBar.tsx`
- Create: `src/components/features/calculator/ScenarioQuiz.tsx`
- Create: `src/app/(dashboard)/calculator/page.tsx`

- [ ] Live calculator: pot + bet + outs → equity needed vs have
- [ ] Rule of 2/4 explainer panel
- [ ] Visual equity bars with threshold line
- [ ] Scenario quiz mode with call/fold + reasoning input

### Task 12: Hand history logger

**Files:**
- Create: `src/lib/validators/hand-log.ts` — Zod schema (shared client+server)
- Create: `src/app/actions/hand-logs.ts` — CRUD Server Actions
- Create: `src/components/features/hands/HandForm.tsx`
- Create: `src/components/features/hands/HandCard.tsx`
- Create: `src/components/features/hands/HandFilters.tsx`
- Create: `src/components/features/hands/PnlChart.tsx` — Recharts line chart
- Create: `src/app/(dashboard)/hands/page.tsx`
- Create: `src/app/(dashboard)/hands/new/page.tsx`

- [ ] Mobile-first hand entry form with street-by-street actions (jsonb)
- [ ] Tag picker (mistake, tough spot, bluff caught, hero call, value bet)
- [ ] Filter + search by hand/position/tag/date
- [ ] Recharts P&L trend line + position win rate breakdown

---

## STEP 3 — Phase 2 Features

### Task 13: Hand analyzer (Claude API)

**Files:**
- Create: `src/lib/claude.ts` — Anthropic SDK client with prompt caching
- Create: `src/lib/validators/analyzer.ts`
- Create: `src/app/actions/analyzer.ts` — Server Action calling Claude
- Create: `src/components/features/analyzer/HandInput.tsx`
- Create: `src/components/features/analyzer/AnalysisResult.tsx`
- Create: `src/app/(dashboard)/analyzer/page.tsx`

- [ ] Hand input (paste or builder form)
- [ ] Claude claude-sonnet-4-6 analysis: street-by-street, decision points, alternative lines, exploitative adjustments
- [ ] Save to analyzed_hands table, tag + search library

### Task 14: Quiz engine with spaced repetition

**Files:**
- Create: `src/data/questions.ts` — question bank (50+ questions, 6 categories)
- Create: `src/lib/srs.ts` — SM-2 algorithm
- Create: `src/lib/validators/quiz-engine.ts`
- Create: `src/app/actions/quiz-engine.ts`
- Create: `src/components/features/quiz/QuestionCard.tsx`
- Create: `src/components/features/quiz/DailyChallenge.tsx`
- Create: `src/app/(dashboard)/quiz/page.tsx`

- [ ] SM-2 spaced repetition: wrong answers surface sooner
- [ ] Daily challenge: 10 questions, streak tracking
- [ ] Categories: preflop ranges, pot odds, board texture, bet sizing, exploits, river decisions
- [ ] Difficulty: beginner / intermediate / advanced

### Task 15: Exploit library

**Files:**
- Create: `src/data/player-types.ts` — 6 common $1/$2 player archetypes
- Create: `src/lib/validators/villain.ts`
- Create: `src/app/actions/villains.ts`
- Create: `src/components/features/exploits/PlayerTypeCard.tsx`
- Create: `src/components/features/exploits/VillainForm.tsx`
- Create: `src/app/(dashboard)/exploits/page.tsx`

- [ ] 6 archetypes: calling station, nit, maniac, TAG, LAG, fish (tells, counter-strategy, what NOT to do, sample hands)
- [ ] Custom villain profiles tied to villain_profiles table per user

---

## STEP 4 — Phase 3 Features

### Task 16: Study plan + progress tracker

**Files:**
- Create: `src/lib/study-plan.ts` — plan generator from quiz weakness data
- Create: `src/components/features/progress/StreakCard.tsx`
- Create: `src/components/features/progress/AchievementBadge.tsx`
- Create: `src/app/(dashboard)/progress/page.tsx`

- [ ] 30-day study plan based on weakest quiz categories
- [ ] Daily streak + study time tracker
- [ ] Achievement badges: first 100 hands, 90%+ preflop accuracy, 7-day streak

### Task 17: Settings + profile

**Files:**
- Create: `src/lib/validators/profile.ts`
- Create: `src/app/actions/profile.ts`
- Create: `src/app/(dashboard)/settings/page.tsx`

- [ ] Stake selection (1/2, 2/3, 5/10)
- [ ] Range export/import (JSON download/upload)
- [ ] Account info, sign out

---

## STEP 5 — Polish Pass

### Task 18: Animations + empty states + error boundaries

**Files:**
- Create: `src/components/ui/LoadingSkeleton.tsx`
- Create: `src/components/ui/EmptyState.tsx`
- Create: `src/app/error.tsx`
- Create: `src/app/not-found.tsx`
- Modify all page components to add Framer Motion transitions

- [ ] Card flip animation for quiz reveal
- [ ] Tab change fade transitions
- [ ] Skeleton loaders for all data-fetching screens
- [ ] Empty states with helpful CTAs

### Task 19: PWA config + SEO + deployment

**Files:**
- Create: `public/manifest.json`
- Create: `src/app/sitemap.ts`
- Modify: `src/app/layout.tsx` — add metadata, OG tags
- Create: `vercel.json`

- [ ] PWA manifest for offline-capable install
- [ ] OpenGraph metadata
- [ ] Vercel deployment config with env var documentation
