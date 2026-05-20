# Poker Simulation Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a visual "me vs machine" poker simulation at `/simulate` where a user plays a full hand preflop→river against a rule-based AI villain and receives Groq-powered street-by-street analysis after showdown.

**Architecture:** Pure poker logic lives in `src/lib/poker/` (deck, hand evaluator, Monte Carlo equity, villain AI) and is tested with vitest. A `useSimulation` hook manages client-side game state. A single server action sends the completed hand to Groq for analysis. UI components render the table, cards, action panel, and post-hand report.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v4, Groq SDK (llama-3.3-70b-versatile), Framer Motion, vitest, shadcn/ui components.

---

## File Map

**New files to create:**
- `src/lib/poker/deck.ts` — Card type, 52-card deck, shuffle, deal N cards
- `src/lib/poker/hand-eval.ts` — Rank a 5-card hand (returns HandRank enum + kickers)
- `src/lib/poker/equity.ts` — Monte Carlo equity: given hero/villain hole cards + board, run 1000 random runouts
- `src/lib/poker/villain.ts` — Rule-based villain: Nit/TAG/LAG/Fish types, decide fold/call/raise
- `src/hooks/useSimulation.ts` — Game state machine hook
- `src/app/actions/simulation.ts` — Server action: send hand history to Groq, return per-street analysis
- `src/components/features/simulation/SimulationSetup.tsx` — Pick villain type + game type (HU/6-max)
- `src/components/features/simulation/PokerTable.tsx` — Table layout with seats, pot, stacks
- `src/components/features/simulation/HoleCards.tsx` — Animated card flip component
- `src/components/features/simulation/CommunityCards.tsx` — Board with cards revealed per street
- `src/components/features/simulation/ActionPanel.tsx` — Fold/Call/Raise buttons + raise slider
- `src/components/features/simulation/EquityBadge.tsx` — Brief equity % badge after each street
- `src/components/features/simulation/PostHandReport.tsx` — Groq analysis cards per street
- `src/app/(dashboard)/simulate/page.tsx` — Route page
- `src/lib/poker/__tests__/deck.test.ts` — Tests for deck
- `src/lib/poker/__tests__/hand-eval.test.ts` — Tests for hand evaluator
- `src/lib/poker/__tests__/equity.test.ts` — Tests for equity calculator
- `src/lib/poker/__tests__/villain.test.ts` — Tests for villain AI

**Files to modify:**
- `src/components/layout/Sidebar.tsx` — Add `/simulate` to primaryNav
- `src/components/layout/BottomNav.tsx` — Add `/simulate` to navItems
- `src/data/ranges.ts` — Rewrite with Jonathan Little 9-handed live cash ranges + tournament toggle
- `package.json` — Add vitest + @vitest/ui

---

## Task 1: Install vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install vitest**

```bash
cd /home/vukhanh732/poker-coach && bun add -d vitest @vitest/ui
```

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Add test script to package.json**

In `package.json` scripts, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Verify vitest runs**

```bash
cd /home/vukhanh732/poker-coach && bun run test 2>&1 | head -20
```
Expected: "No test files found" or similar (no errors).

---

## Task 2: Card types and deck

**Files:**
- Create: `src/lib/poker/deck.ts`
- Create: `src/lib/poker/__tests__/deck.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/poker/__tests__/deck.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { makeDeck, shuffle, dealCards, rankToString, suitToSymbol } from "../deck";

describe("makeDeck", () => {
  it("returns 52 unique cards", () => {
    const deck = makeDeck();
    expect(deck).toHaveLength(52);
    const uniq = new Set(deck.map((c) => `${c.rank}${c.suit}`));
    expect(uniq.size).toBe(52);
  });
});

describe("shuffle", () => {
  it("returns same 52 cards in different order", () => {
    const deck = makeDeck();
    const shuffled = shuffle([...deck]);
    expect(shuffled).toHaveLength(52);
    // Extremely unlikely to be identical
    const same = shuffled.every((c, i) => c.rank === deck[i].rank && c.suit === deck[i].suit);
    expect(same).toBe(false);
  });
});

describe("dealCards", () => {
  it("removes N cards from deck and returns them", () => {
    const deck = makeDeck();
    const { cards, remaining } = dealCards(deck, 2);
    expect(cards).toHaveLength(2);
    expect(remaining).toHaveLength(50);
  });
});

describe("rankToString", () => {
  it("converts rank numbers to display strings", () => {
    expect(rankToString(14)).toBe("A");
    expect(rankToString(13)).toBe("K");
    expect(rankToString(2)).toBe("2");
    expect(rankToString(10)).toBe("T");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/vukhanh732/poker-coach && bun run test 2>&1 | tail -10
```
Expected: FAIL — "Cannot find module '../deck'"

- [ ] **Step 3: Implement deck.ts**

Create `src/lib/poker/deck.ts`:
```ts
export type Suit = "s" | "h" | "d" | "c";
export type Card = { rank: number; suit: Suit }; // rank: 2-14 (14=Ace)

const SUITS: Suit[] = ["s", "h", "d", "c"];
const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export function makeDeck(): Card[] {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, suit })));
}

export function shuffle(deck: Card[]): Card[] {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

export function dealCards(deck: Card[], n: number): { cards: Card[]; remaining: Card[] } {
  return { cards: deck.slice(0, n), remaining: deck.slice(n) };
}

export function rankToString(rank: number): string {
  if (rank === 14) return "A";
  if (rank === 13) return "K";
  if (rank === 12) return "Q";
  if (rank === 11) return "J";
  if (rank === 10) return "T";
  return String(rank);
}

export function suitToSymbol(suit: Suit): string {
  return { s: "♠", h: "♥", d: "♦", c: "♣" }[suit];
}

export function cardToString(card: Card): string {
  return `${rankToString(card.rank)}${card.suit}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/vukhanh732/poker-coach && bun run test 2>&1 | tail -10
```
Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/vukhanh732/poker-coach && git add src/lib/poker/deck.ts src/lib/poker/__tests__/deck.test.ts vitest.config.ts package.json bun.lock && git commit -m "feat: add card deck utilities + vitest setup"
```

---

## Task 3: Hand evaluator

**Files:**
- Create: `src/lib/poker/hand-eval.ts`
- Create: `src/lib/poker/__tests__/hand-eval.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/poker/__tests__/hand-eval.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { evaluateHand, HandRank, bestHandFrom } from "../hand-eval";
import type { Card } from "../deck";

const c = (rank: number, suit: "s" | "h" | "d" | "c"): Card => ({ rank, suit });

describe("evaluateHand", () => {
  it("identifies a straight flush", () => {
    const hand = [c(9,"s"), c(10,"s"), c(11,"s"), c(12,"s"), c(13,"s")];
    expect(evaluateHand(hand).rank).toBe(HandRank.StraightFlush);
  });

  it("identifies four of a kind", () => {
    const hand = [c(14,"s"), c(14,"h"), c(14,"d"), c(14,"c"), c(2,"s")];
    expect(evaluateHand(hand).rank).toBe(HandRank.FourOfAKind);
  });

  it("identifies a full house", () => {
    const hand = [c(10,"s"), c(10,"h"), c(10,"d"), c(5,"s"), c(5,"h")];
    expect(evaluateHand(hand).rank).toBe(HandRank.FullHouse);
  });

  it("identifies a flush", () => {
    const hand = [c(2,"s"), c(5,"s"), c(7,"s"), c(9,"s"), c(13,"s")];
    expect(evaluateHand(hand).rank).toBe(HandRank.Flush);
  });

  it("identifies a straight", () => {
    const hand = [c(5,"s"), c(6,"h"), c(7,"d"), c(8,"c"), c(9,"s")];
    expect(evaluateHand(hand).rank).toBe(HandRank.Straight);
  });

  it("identifies three of a kind", () => {
    const hand = [c(7,"s"), c(7,"h"), c(7,"d"), c(2,"c"), c(4,"s")];
    expect(evaluateHand(hand).rank).toBe(HandRank.ThreeOfAKind);
  });

  it("identifies two pair", () => {
    const hand = [c(8,"s"), c(8,"h"), c(3,"d"), c(3,"c"), c(14,"s")];
    expect(evaluateHand(hand).rank).toBe(HandRank.TwoPair);
  });

  it("identifies one pair", () => {
    const hand = [c(6,"s"), c(6,"h"), c(2,"d"), c(9,"c"), c(14,"s")];
    expect(evaluateHand(hand).rank).toBe(HandRank.OnePair);
  });

  it("identifies high card", () => {
    const hand = [c(2,"s"), c(5,"h"), c(7,"d"), c(9,"c"), c(14,"s")];
    expect(evaluateHand(hand).rank).toBe(HandRank.HighCard);
  });
});

describe("bestHandFrom", () => {
  it("picks best 5 from 7 cards (texas holdem)", () => {
    // Hero has AA, board has A-K-Q-J-T = royal flush possible? No — AA + board
    // Hero: Ah, As. Board: Kh, Qh, Jh, Th, 2s => best = Kh Qh Jh Th + Ah = royal flush
    const cards: Card[] = [c(14,"h"), c(14,"s"), c(13,"h"), c(12,"h"), c(11,"h"), c(10,"h"), c(2,"s")];
    const result = bestHandFrom(cards);
    expect(result.rank).toBe(HandRank.StraightFlush); // A-high straight flush = royal flush
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/vukhanh732/poker-coach && bun run test 2>&1 | tail -10
```
Expected: FAIL — "Cannot find module '../hand-eval'"

- [ ] **Step 3: Implement hand-eval.ts**

Create `src/lib/poker/hand-eval.ts`:
```ts
import type { Card } from "./deck";

export enum HandRank {
  HighCard = 1,
  OnePair = 2,
  TwoPair = 3,
  ThreeOfAKind = 4,
  Straight = 5,
  Flush = 6,
  FullHouse = 7,
  FourOfAKind = 8,
  StraightFlush = 9,
}

export const HandRankName: Record<HandRank, string> = {
  [HandRank.HighCard]: "High Card",
  [HandRank.OnePair]: "One Pair",
  [HandRank.TwoPair]: "Two Pair",
  [HandRank.ThreeOfAKind]: "Three of a Kind",
  [HandRank.Straight]: "Straight",
  [HandRank.Flush]: "Flush",
  [HandRank.FullHouse]: "Full House",
  [HandRank.FourOfAKind]: "Four of a Kind",
  [HandRank.StraightFlush]: "Straight Flush",
};

export type HandResult = { rank: HandRank; value: number; name: string };

export function evaluateHand(hand: Card[]): HandResult {
  const ranks = hand.map((c) => c.rank).sort((a, b) => b - a);
  const suits = hand.map((c) => c.suit);

  const rankCounts = new Map<number, number>();
  for (const r of ranks) rankCounts.set(r, (rankCounts.get(r) ?? 0) + 1);
  const counts = [...rankCounts.values()].sort((a, b) => b - a);

  const isFlush = suits.every((s) => s === suits[0]);
  const isStraight = checkStraight(ranks);

  if (isFlush && isStraight) return { rank: HandRank.StraightFlush, value: ranks[0]!, name: HandRankName[HandRank.StraightFlush] };
  if (counts[0] === 4) return { rank: HandRank.FourOfAKind, value: getGroupRank(rankCounts, 4), name: HandRankName[HandRank.FourOfAKind] };
  if (counts[0] === 3 && counts[1] === 2) return { rank: HandRank.FullHouse, value: getGroupRank(rankCounts, 3), name: HandRankName[HandRank.FullHouse] };
  if (isFlush) return { rank: HandRank.Flush, value: ranks[0]!, name: HandRankName[HandRank.Flush] };
  if (isStraight) return { rank: HandRank.Straight, value: ranks[0]!, name: HandRankName[HandRank.Straight] };
  if (counts[0] === 3) return { rank: HandRank.ThreeOfAKind, value: getGroupRank(rankCounts, 3), name: HandRankName[HandRank.ThreeOfAKind] };
  if (counts[0] === 2 && counts[1] === 2) return { rank: HandRank.TwoPair, value: getGroupRank(rankCounts, 2), name: HandRankName[HandRank.TwoPair] };
  if (counts[0] === 2) return { rank: HandRank.OnePair, value: getGroupRank(rankCounts, 2), name: HandRankName[HandRank.OnePair] };
  return { rank: HandRank.HighCard, value: ranks[0]!, name: HandRankName[HandRank.HighCard] };
}

function checkStraight(sortedRanks: number[]): boolean {
  // Normal straight
  if (sortedRanks[0]! - sortedRanks[4]! === 4 && new Set(sortedRanks).size === 5) return true;
  // Wheel: A-2-3-4-5
  const isWheel = sortedRanks[0] === 14 && sortedRanks[1] === 5 && sortedRanks[2] === 4 && sortedRanks[3] === 3 && sortedRanks[4] === 2;
  return isWheel;
}

function getGroupRank(rankCounts: Map<number, number>, groupSize: number): number {
  let best = 0;
  for (const [rank, count] of rankCounts) {
    if (count === groupSize && rank > best) best = rank;
  }
  return best;
}

function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = combinations(rest, k - 1).map((combo) => [first!, ...combo]);
  const withoutFirst = combinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

export function bestHandFrom(cards: Card[]): HandResult {
  const combos = combinations(cards, 5);
  let best: HandResult | null = null;
  for (const combo of combos) {
    const result = evaluateHand(combo);
    if (!best || result.rank > best.rank || (result.rank === best.rank && result.value > best.value)) {
      best = result;
    }
  }
  return best!;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/vukhanh732/poker-coach && bun run test 2>&1 | tail -15
```
Expected: All 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/vukhanh732/poker-coach && git add src/lib/poker/hand-eval.ts src/lib/poker/__tests__/hand-eval.test.ts && git commit -m "feat: add 5-card hand evaluator"
```

---

## Task 4: Monte Carlo equity

**Files:**
- Create: `src/lib/poker/equity.ts`
- Create: `src/lib/poker/__tests__/equity.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/poker/__tests__/equity.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { calculateEquity } from "../equity";

describe("calculateEquity", () => {
  it("AA vs KK preflop is ~80% for AA", () => {
    const heroEquity = calculateEquity(
      [{ rank: 14, suit: "s" }, { rank: 14, suit: "h" }],
      [{ rank: 13, suit: "s" }, { rank: 13, suit: "h" }],
      [],
      500
    );
    // AA is ~80% equity vs KK preflop
    expect(heroEquity).toBeGreaterThan(0.70);
    expect(heroEquity).toBeLessThan(0.90);
  });

  it("returns ~0.5 in a rough coin-flip", () => {
    // AKo vs QQ is roughly 50/50
    const heroEquity = calculateEquity(
      [{ rank: 14, suit: "s" }, { rank: 13, suit: "h" }],
      [{ rank: 12, suit: "s" }, { rank: 12, suit: "h" }],
      [],
      500
    );
    expect(heroEquity).toBeGreaterThan(0.38);
    expect(heroEquity).toBeLessThan(0.62);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/vukhanh732/poker-coach && bun run test 2>&1 | tail -10
```
Expected: FAIL — "Cannot find module '../equity'"

- [ ] **Step 3: Implement equity.ts**

Create `src/lib/poker/equity.ts`:
```ts
import { makeDeck, shuffle, dealCards } from "./deck";
import { bestHandFrom } from "./hand-eval";
import type { Card } from "./deck";

export function calculateEquity(
  heroCards: Card[],
  villainCards: Card[],
  board: Card[],
  iterations = 1000
): number {
  const knownCards = new Set([...heroCards, ...villainCards, ...board].map((c) => `${c.rank}${c.suit}`));

  let wins = 0;
  let ties = 0;

  for (let i = 0; i < iterations; i++) {
    const remaining = shuffle(makeDeck().filter((c) => !knownCards.has(`${c.rank}${c.suit}`)));
    const needed = 5 - board.length;
    const { cards: runout } = dealCards(remaining, needed);
    const fullBoard = [...board, ...runout];

    const heroResult = bestHandFrom([...heroCards, ...fullBoard]);
    const villainResult = bestHandFrom([...villainCards, ...fullBoard]);

    if (heroResult.rank > villainResult.rank) wins++;
    else if (heroResult.rank === villainResult.rank) {
      if (heroResult.value > villainResult.value) wins++;
      else if (heroResult.value === villainResult.value) ties++;
    }
  }

  return (wins + ties * 0.5) / iterations;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/vukhanh732/poker-coach && bun run test 2>&1 | tail -10
```
Expected: All tests PASS (Monte Carlo results are probabilistic — retries allowed).

- [ ] **Step 5: Commit**

```bash
cd /home/vukhanh732/poker-coach && git add src/lib/poker/equity.ts src/lib/poker/__tests__/equity.test.ts && git commit -m "feat: add Monte Carlo equity calculator"
```

---

## Task 5: Villain AI

**Files:**
- Create: `src/lib/poker/villain.ts`
- Create: `src/lib/poker/__tests__/villain.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/poker/__tests__/villain.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { villainDecide, VillainType } from "../villain";

describe("villainDecide - Nit", () => {
  it("folds weak hand to raise", () => {
    const action = villainDecide({
      villainType: VillainType.Nit,
      handStrength: 0.2, // weak
      potOdds: 0.33,
      street: "flop",
      facingAction: "raise",
    });
    expect(action.action).toBe("fold");
  });

  it("calls with strong hand", () => {
    const action = villainDecide({
      villainType: VillainType.Nit,
      handStrength: 0.85,
      potOdds: 0.33,
      street: "flop",
      facingAction: "bet",
    });
    expect(["call", "raise"]).toContain(action.action);
  });
});

describe("villainDecide - Fish", () => {
  it("calls more often than a nit with marginal hands", () => {
    let fishCalls = 0;
    let nitCalls = 0;
    for (let i = 0; i < 100; i++) {
      const fish = villainDecide({ villainType: VillainType.Fish, handStrength: 0.4, potOdds: 0.25, street: "flop", facingAction: "bet" });
      const nit = villainDecide({ villainType: VillainType.Nit, handStrength: 0.4, potOdds: 0.25, street: "flop", facingAction: "bet" });
      if (fish.action !== "fold") fishCalls++;
      if (nit.action !== "fold") nitCalls++;
    }
    expect(fishCalls).toBeGreaterThan(nitCalls);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/vukhanh732/poker-coach && bun run test 2>&1 | tail -10
```
Expected: FAIL — "Cannot find module '../villain'"

- [ ] **Step 3: Implement villain.ts**

Create `src/lib/poker/villain.ts`:
```ts
export enum VillainType {
  Nit = "Nit",
  TAG = "TAG",
  LAG = "LAG",
  Fish = "Fish",
}

export type VillainAction = { action: "fold" | "call" | "raise"; sizingBB?: number };

export type VillainDecideInput = {
  villainType: VillainType;
  handStrength: number; // 0-1, from equity calc or range position
  potOdds: number;      // fraction of pot: e.g. 0.33 = need 25% equity to call
  street: "preflop" | "flop" | "turn" | "river";
  facingAction: "check" | "bet" | "raise" | "3bet";
};

// Thresholds: [foldBelow, callBelow, raiseAbove]
const thresholds: Record<VillainType, { foldBelow: number; raiseAbove: number; bluffFreq: number }> = {
  [VillainType.Nit]:  { foldBelow: 0.65, raiseAbove: 0.80, bluffFreq: 0.02 },
  [VillainType.TAG]:  { foldBelow: 0.45, raiseAbove: 0.70, bluffFreq: 0.10 },
  [VillainType.LAG]:  { foldBelow: 0.35, raiseAbove: 0.60, bluffFreq: 0.20 },
  [VillainType.Fish]: { foldBelow: 0.25, raiseAbove: 0.75, bluffFreq: 0.05 },
};

export function villainDecide(input: VillainDecideInput): VillainAction {
  const { villainType, handStrength, facingAction } = input;
  const t = thresholds[villainType];

  // Check if bluffing
  const isBluff = Math.random() < t.bluffFreq;

  if (facingAction === "check") {
    if (handStrength > t.raiseAbove || isBluff) return { action: "raise", sizingBB: 2 };
    if (handStrength > t.foldBelow) return { action: "call" }; // "call" = check-behind
    return { action: "call" }; // check back
  }

  if (handStrength < t.foldBelow && !isBluff) return { action: "fold" };
  if (handStrength >= t.raiseAbove || isBluff) return { action: "raise", sizingBB: 3 };
  return { action: "call" };
}

// Estimate hand strength from equity (0-1)
export function strengthFromEquity(equity: number): number {
  return equity;
}

// Preflop hand strength by range position (0 = top, 1 = bottom)
export function preflopStrength(rankInRange: number): number {
  return 1 - rankInRange;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/vukhanh732/poker-coach && bun run test 2>&1 | tail -15
```
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/vukhanh732/poker-coach && git add src/lib/poker/villain.ts src/lib/poker/__tests__/villain.test.ts && git commit -m "feat: add rule-based villain AI"
```

---

## Task 6: Simulation server action

**Files:**
- Create: `src/app/actions/simulation.ts`

- [ ] **Step 1: Create simulation.ts**

Create `src/app/actions/simulation.ts`:
```ts
"use server";

import Groq from "groq-sdk";

export type StreetDecision = {
  street: "preflop" | "flop" | "turn" | "river";
  heroAction: string;       // e.g. "raised to $12"
  equity: number;           // 0-1 hero equity at that point
  board: string;            // e.g. "Ah Kd 7s"
  pot: number;              // in cents
};

export type StreetAnalysis = {
  street: string;
  heroAction: string;
  equity: number;
  verdict: "good" | "marginal" | "mistake";
  tip: string;
};

export type SimulationAnalysis = {
  overall: string;
  streets: StreetAnalysis[];
  score: number; // 0-100
};

export async function analyzeSimulation(
  decisions: StreetDecision[],
  heroCards: string,
  villainCards: string,
  villainType: string
): Promise<{ success: true; analysis: SimulationAnalysis } | { error: string }> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `You are an expert poker coach analyzing a hand played at $1/$2 live cash.

Hero's hole cards: ${heroCards}
Villain type: ${villainType}
Villain's hole cards (revealed at showdown): ${villainCards}

Decisions made:
${decisions.map((d, i) => `${i + 1}. ${d.street.toUpperCase()}: Hero ${d.heroAction}. Board: ${d.board || "preflop"}. Hero equity: ${Math.round(d.equity * 100)}%. Pot: $${(d.pot / 100).toFixed(0)}`).join("\n")}

Analyze each decision. For each street, give:
- verdict: "good", "marginal", or "mistake"
- tip: one concrete sentence of coaching advice

Also give an overall summary (2 sentences) and a score from 0-100.

Respond in JSON only:
{
  "overall": "...",
  "score": 75,
  "streets": [
    { "street": "preflop", "heroAction": "...", "equity": 0.65, "verdict": "good", "tip": "..." }
  ]
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return { error: "No response from AI" };

    const parsed = JSON.parse(content) as SimulationAnalysis;
    return { success: true, analysis: parsed };
  } catch (e) {
    return { error: `Analysis failed: ${e instanceof Error ? e.message : String(e)}` };
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/vukhanh732/poker-coach && bun run type-check 2>&1 | grep -E "simulation|error" | head -10
```
Expected: No errors relating to simulation.ts.

- [ ] **Step 3: Commit**

```bash
cd /home/vukhanh732/poker-coach && git add src/app/actions/simulation.ts && git commit -m "feat: add simulation Groq analysis server action"
```

---

## Task 7: useSimulation hook

**Files:**
- Create: `src/hooks/useSimulation.ts`

- [ ] **Step 1: Create useSimulation.ts**

Create `src/hooks/useSimulation.ts`:
```ts
"use client";

import { useState, useCallback } from "react";
import { makeDeck, shuffle, dealCards, cardToString } from "@/lib/poker/deck";
import { calculateEquity } from "@/lib/poker/equity";
import { villainDecide, VillainType } from "@/lib/poker/villain";
import type { Card } from "@/lib/poker/deck";
import type { StreetDecision } from "@/app/actions/simulation";

export type GameType = "hu" | "6max";
export type Street = "setup" | "preflop" | "flop" | "turn" | "river" | "showdown" | "analysis";

export type SimState = {
  phase: Street;
  heroCards: Card[];
  villainCards: Card[];
  board: Card[];
  pot: number;       // cents
  heroStack: number; // cents
  villainStack: number;
  currentBet: number;
  decisions: StreetDecision[];
  villainType: VillainType;
  gameType: GameType;
  lastVillainAction: string;
  deck: Card[];
  equity: number;
  winner: "hero" | "villain" | "tie" | null;
};

const STARTING_STACK = 20000; // $200 in cents
const BIG_BLIND = 200; // $2
const SMALL_BLIND = 100;

function freshState(villainType: VillainType, gameType: GameType): SimState {
  const deck = shuffle(makeDeck());
  const { cards: heroCards, remaining: r1 } = dealCards(deck, 2);
  const { cards: villainCards, remaining: r2 } = dealCards(r1, 2);
  return {
    phase: "preflop",
    heroCards,
    villainCards,
    board: [],
    pot: BIG_BLIND + SMALL_BLIND,
    heroStack: STARTING_STACK - BIG_BLIND,
    villainStack: STARTING_STACK - SMALL_BLIND,
    currentBet: BIG_BLIND,
    decisions: [],
    villainType,
    gameType,
    lastVillainAction: "posted small blind",
    deck: r2,
    equity: 0.5,
    winner: null,
  };
}

export function useSimulation() {
  const [state, setState] = useState<SimState | null>(null);

  const startGame = useCallback((villainType: VillainType, gameType: GameType) => {
    setState(freshState(villainType, gameType));
  }, []);

  const heroAct = useCallback(
    (action: "fold" | "call" | "raise", raiseSizeBB = 3) => {
      if (!state) return;
      setState((prev) => {
        if (!prev) return prev;
        const next = { ...prev };

        if (action === "fold") {
          next.phase = "showdown";
          next.winner = "villain";
          next.decisions.push({
            street: prev.phase as StreetDecision["street"],
            heroAction: "folded",
            equity: prev.equity,
            board: prev.board.map(cardToString).join(" "),
            pot: prev.pot,
          });
          return next;
        }

        const callAmount = Math.min(prev.currentBet, prev.heroStack);
        let heroAction = "";
        if (action === "call") {
          next.heroStack -= callAmount;
          next.pot += callAmount;
          heroAction = `called $${(callAmount / 100).toFixed(0)}`;
        } else {
          const raiseAmount = raiseSizeBB * BIG_BLIND;
          next.heroStack -= raiseAmount;
          next.pot += raiseAmount;
          next.currentBet = raiseAmount;
          heroAction = `raised to $${(raiseAmount / 100).toFixed(0)}`;
        }

        // Villain responds
        const equity = calculateEquity(prev.heroCards, prev.villainCards, prev.board, 200);
        const villainHandStrength = 1 - equity; // villain's equity
        const potOdds = next.currentBet / (next.pot + next.currentBet);
        const vDecision = villainDecide({
          villainType: prev.villainType,
          handStrength: villainHandStrength,
          potOdds,
          street: prev.phase as "preflop" | "flop" | "turn" | "river",
          facingAction: action === "raise" ? "raise" : "bet",
        });

        let villainActionStr = "";
        if (vDecision.action === "fold") {
          next.phase = "showdown";
          next.winner = "hero";
          villainActionStr = "folded";
        } else if (vDecision.action === "call") {
          const vCall = Math.min(next.currentBet, next.villainStack);
          next.villainStack -= vCall;
          next.pot += vCall;
          villainActionStr = `called $${(vCall / 100).toFixed(0)}`;
        } else {
          const vRaise = (vDecision.sizingBB ?? 3) * BIG_BLIND;
          next.villainStack -= vRaise;
          next.pot += vRaise;
          next.currentBet = vRaise;
          villainActionStr = `raised to $${(vRaise / 100).toFixed(0)}`;
        }

        next.lastVillainAction = villainActionStr;
        next.decisions.push({
          street: prev.phase as StreetDecision["street"],
          heroAction,
          equity,
          board: prev.board.map(cardToString).join(" "),
          pot: next.pot,
        });
        next.equity = equity;

        // Advance street if villain didn't fold
        if (next.phase !== "showdown") {
          next.phase = nextStreet(prev.phase, next);
        }

        return next;
      });
    },
    [state]
  );

  const resetGame = useCallback(() => setState(null), []);

  return { state, startGame, heroAct, resetGame };
}

function nextStreet(current: Street, state: SimState): Street {
  const streetOrder: Street[] = ["preflop", "flop", "turn", "river", "showdown"];
  const idx = streetOrder.indexOf(current);
  const next = streetOrder[idx + 1] ?? "showdown";

  if (next === "flop") {
    const { cards, remaining } = dealCards(state.deck, 3);
    state.board = cards;
    state.deck = remaining;
    state.currentBet = 0;
  } else if (next === "turn" || next === "river") {
    const { cards, remaining } = dealCards(state.deck, 1);
    state.board = [...state.board, ...cards];
    state.deck = remaining;
    state.currentBet = 0;
  } else if (next === "showdown") {
    // Fill remaining board cards if needed
    const needed = 5 - state.board.length;
    if (needed > 0) {
      const { cards, remaining } = dealCards(state.deck, needed);
      state.board = [...state.board, ...cards];
      state.deck = remaining;
    }
    // Determine winner
    const { bestHandFrom } = require("@/lib/poker/hand-eval");
    const heroResult = bestHandFrom([...state.heroCards, ...state.board]);
    const villainResult = bestHandFrom([...state.villainCards, ...state.board]);
    if (heroResult.rank > villainResult.rank) state.winner = "hero";
    else if (heroResult.rank < villainResult.rank) state.winner = "villain";
    else state.winner = "tie";
  }

  return next;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/vukhanh732/poker-coach && bun run type-check 2>&1 | grep "useSimulation\|error TS" | head -10
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
cd /home/vukhanh732/poker-coach && git add src/hooks/useSimulation.ts && git commit -m "feat: add useSimulation game state hook"
```

---

## Task 8: Simulation UI components

**Files:**
- Create: `src/components/features/simulation/SimulationSetup.tsx`
- Create: `src/components/features/simulation/HoleCards.tsx`
- Create: `src/components/features/simulation/CommunityCards.tsx`
- Create: `src/components/features/simulation/ActionPanel.tsx`
- Create: `src/components/features/simulation/EquityBadge.tsx`
- Create: `src/components/features/simulation/PostHandReport.tsx`

- [ ] **Step 1: Create SimulationSetup.tsx**

Create `src/components/features/simulation/SimulationSetup.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VillainType } from "@/lib/poker/villain";
import type { GameType } from "@/hooks/useSimulation";

const VILLAIN_TYPES = [
  { type: VillainType.Nit, label: "Nit", desc: "Tight-passive, top 10% hands only" },
  { type: VillainType.TAG, label: "TAG", desc: "Tight-aggressive, solid fundamentals" },
  { type: VillainType.LAG, label: "LAG", desc: "Loose-aggressive, applies pressure" },
  { type: VillainType.Fish, label: "Fish", desc: "Loose-passive, calls too wide" },
];

type Props = {
  onStart: (villainType: VillainType, gameType: GameType) => void;
};

export function SimulationSetup({ onStart }: Props) {
  const [selectedVillain, setSelectedVillain] = useState<VillainType>(VillainType.TAG);
  const [gameType, setGameType] = useState<GameType>("hu");

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Me vs Machine</h2>
        <p className="mt-1 text-muted-foreground">Play a full hand and get AI coaching after showdown</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Game Type</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button
            variant={gameType === "hu" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setGameType("hu")}
          >
            Heads-Up
          </Button>
          <Button
            variant={gameType === "6max" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setGameType("6max")}
          >
            6-Max
          </Button>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Villain Type</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {VILLAIN_TYPES.map(({ type, label, desc }) => (
            <button
              key={type}
              onClick={() => setSelectedVillain(type)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                selectedVillain === type
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Button size="lg" className="w-full max-w-md" onClick={() => onStart(selectedVillain, gameType)}>
        Deal Cards
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Create HoleCards.tsx**

Create `src/components/features/simulation/HoleCards.tsx`:
```tsx
"use client";

import { motion } from "framer-motion";
import { rankToString, suitToSymbol } from "@/lib/poker/deck";
import type { Card } from "@/lib/poker/deck";
import { cn } from "@/lib/utils";

type Props = {
  cards: Card[];
  faceDown?: boolean;
  label?: string;
  small?: boolean;
};

const suitColor: Record<string, string> = {
  h: "text-red-500",
  d: "text-red-500",
  s: "text-foreground",
  c: "text-foreground",
};

export function HoleCards({ cards, faceDown = false, label, small = false }: Props) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {label && <p className="text-xs text-muted-foreground font-medium">{label}</p>}
      <div className="flex gap-1.5">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ rotateY: 180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border-2 border-border bg-card font-bold select-none",
              small ? "h-10 w-7 text-xs" : "h-14 w-10 text-sm",
              faceDown && "bg-primary/20 border-primary/40"
            )}
          >
            {faceDown ? (
              <span className="text-primary/60">?</span>
            ) : (
              <>
                <span className={cn(suitColor[card.suit])}>{rankToString(card.rank)}</span>
                <span className={cn("text-xs", suitColor[card.suit])}>{suitToSymbol(card.suit)}</span>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create CommunityCards.tsx**

Create `src/components/features/simulation/CommunityCards.tsx`:
```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { rankToString, suitToSymbol } from "@/lib/poker/deck";
import type { Card } from "@/lib/poker/deck";
import { cn } from "@/lib/utils";

const suitColor: Record<string, string> = {
  h: "text-red-500",
  d: "text-red-500",
  s: "text-foreground",
  c: "text-foreground",
};

type Props = { cards: Card[] };

export function CommunityCards({ cards }: Props) {
  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3, 4].map((i) => {
        const card = cards[i];
        return (
          <div
            key={i}
            className="h-16 w-11 rounded-lg border-2 border-border bg-card flex flex-col items-center justify-center"
          >
            <AnimatePresence>
              {card ? (
                <motion.div
                  key={`${card.rank}${card.suit}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <span className={cn("text-sm font-bold", suitColor[card.suit])}>
                    {rankToString(card.rank)}
                  </span>
                  <span className={cn("text-xs", suitColor[card.suit])}>
                    {suitToSymbol(card.suit)}
                  </span>
                </motion.div>
              ) : (
                <span className="text-muted-foreground/30 text-lg">·</span>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Create ActionPanel.tsx**

Create `src/components/features/simulation/ActionPanel.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type Props = {
  onAction: (action: "fold" | "call" | "raise", raiseBB?: number) => void;
  currentBet: number;
  pot: number;
  heroStack: number;
  disabled?: boolean;
};

export function ActionPanel({ onAction, currentBet, pot, heroStack, disabled }: Props) {
  const [raiseBB, setRaiseBB] = useState(3);
  const callAmount = Math.min(currentBet, heroStack);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-16">Raise to:</span>
        <Slider
          min={2}
          max={20}
          step={1}
          value={[raiseBB]}
          onValueChange={([v]) => setRaiseBB(v ?? 3)}
          className="flex-1"
          disabled={disabled}
        />
        <span className="text-xs font-mono w-12 text-right">${(raiseBB * 2).toFixed(0)}</span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => onAction("fold")}
          disabled={disabled}
        >
          Fold
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onAction("call")}
          disabled={disabled}
        >
          Call ${(callAmount / 100).toFixed(0)}
        </Button>
        <Button
          className="flex-1"
          onClick={() => onAction("raise", raiseBB)}
          disabled={disabled}
        >
          Raise ${(raiseBB * 2).toFixed(0)}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create EquityBadge.tsx**

Create `src/components/features/simulation/EquityBadge.tsx`:
```tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = { equity: number };

export function EquityBadge({ equity }: Props) {
  const pct = Math.round(equity * 100);
  const color = pct >= 60 ? "text-green-500" : pct >= 40 ? "text-yellow-500" : "text-red-500";

  return (
    <motion.div
      key={pct}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn("text-center", color)}
    >
      <p className="text-2xl font-bold">{pct}%</p>
      <p className="text-xs text-muted-foreground">equity</p>
    </motion.div>
  );
}
```

- [ ] **Step 6: Create PostHandReport.tsx**

Create `src/components/features/simulation/PostHandReport.tsx`:
```tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SimulationAnalysis } from "@/app/actions/simulation";
import { cn } from "@/lib/utils";

const verdictColor: Record<string, string> = {
  good: "bg-green-500/10 text-green-600 border-green-500/30",
  marginal: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  mistake: "bg-red-500/10 text-red-600 border-red-500/30",
};

type Props = { analysis: SimulationAnalysis };

export function PostHandReport({ analysis }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Hand Score</CardTitle>
            <span className="text-2xl font-bold">{analysis.score}/100</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={analysis.score} className="h-2" />
          <p className="mt-3 text-sm text-muted-foreground">{analysis.overall}</p>
        </CardContent>
      </Card>

      {analysis.streets.map((s, i) => (
        <Card key={i} className={cn("border", verdictColor[s.verdict])}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.street}</p>
                <p className="text-sm font-medium mt-0.5">{s.heroAction}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{Math.round(s.equity * 100)}% equity</p>
              </div>
              <Badge variant="outline" className={cn("shrink-0", verdictColor[s.verdict])}>
                {s.verdict}
              </Badge>
            </div>
            <p className="mt-2 text-sm">{s.tip}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Verify TypeScript**

```bash
cd /home/vukhanh732/poker-coach && bun run type-check 2>&1 | grep -E "simulation|error TS" | head -20
```
Expected: No errors.

- [ ] **Step 8: Commit**

```bash
cd /home/vukhanh732/poker-coach && git add src/components/features/simulation/ && git commit -m "feat: add simulation UI components"
```

---

## Task 9: Simulate page + navigation

**Files:**
- Create: `src/app/(dashboard)/simulate/page.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/BottomNav.tsx`

- [ ] **Step 1: Create simulate/page.tsx**

Create `src/app/(dashboard)/simulate/page.tsx`:
```tsx
"use client";

import { useState } from "react";
import { SimulationSetup } from "@/components/features/simulation/SimulationSetup";
import { HoleCards } from "@/components/features/simulation/HoleCards";
import { CommunityCards } from "@/components/features/simulation/CommunityCards";
import { ActionPanel } from "@/components/features/simulation/ActionPanel";
import { EquityBadge } from "@/components/features/simulation/EquityBadge";
import { PostHandReport } from "@/components/features/simulation/PostHandReport";
import { useSimulation } from "@/hooks/useSimulation";
import { analyzeSimulation } from "@/app/actions/simulation";
import { cardToString } from "@/lib/poker/deck";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SimulationAnalysis } from "@/app/actions/simulation";
import type { VillainType } from "@/lib/poker/villain";
import type { GameType } from "@/hooks/useSimulation";

export default function SimulatePage() {
  const { state, startGame, heroAct, resetGame } = useSimulation();
  const [analysis, setAnalysis] = useState<SimulationAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function handleShowdown() {
    if (!state) return;
    setAnalyzing(true);
    const heroStr = state.heroCards.map(cardToString).join(" ");
    const villainStr = state.villainCards.map(cardToString).join(" ");
    const result = await analyzeSimulation(state.decisions, heroStr, villainStr, state.villainType);
    if ("success" in result) setAnalysis(result.analysis);
    setAnalyzing(false);
  }

  function handleStart(villainType: VillainType, gameType: GameType) {
    setAnalysis(null);
    startGame(villainType, gameType);
  }

  function handleReset() {
    setAnalysis(null);
    resetGame();
  }

  if (!state) {
    return <SimulationSetup onStart={handleStart} />;
  }

  const isShowdown = state.phase === "showdown" || state.phase === "analysis";

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto pb-24">
      {/* Table */}
      <Card className="bg-[#1a472a] border-[#2d6a44]">
        <CardContent className="pt-4 flex flex-col gap-4 items-center">
          {/* Villain */}
          <HoleCards
            cards={state.villainCards}
            faceDown={!isShowdown}
            label={`Villain (${state.villainType}) — $${(state.villainStack / 100).toFixed(0)}`}
          />

          {/* Board */}
          <div className="w-full">
            <CommunityCards cards={state.board} />
          </div>

          {/* Pot */}
          <div className="text-center">
            <p className="text-xs text-white/60">Pot</p>
            <p className="text-lg font-bold text-white">${(state.pot / 100).toFixed(0)}</p>
          </div>

          {/* Hero */}
          <HoleCards
            cards={state.heroCards}
            label={`You — $${(state.heroStack / 100).toFixed(0)}`}
          />
        </CardContent>
      </Card>

      {/* Equity */}
      {state.equity !== 0.5 && <EquityBadge equity={state.equity} />}

      {/* Villain last action */}
      {state.lastVillainAction && (
        <p className="text-center text-sm text-muted-foreground">
          Villain: <span className="font-medium text-foreground">{state.lastVillainAction}</span>
        </p>
      )}

      {/* Phase indicator */}
      <div className="flex justify-center gap-2">
        {(["preflop", "flop", "turn", "river"] as const).map((s) => (
          <div
            key={s}
            className={`h-1.5 w-12 rounded-full transition-colors ${
              ["preflop", "flop", "turn", "river"].indexOf(state.phase as string) >=
              ["preflop", "flop", "turn", "river"].indexOf(s)
                ? "bg-primary"
                : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Actions or result */}
      {!isShowdown ? (
        <ActionPanel
          onAction={heroAct}
          currentBet={state.currentBet}
          pot={state.pot}
          heroStack={state.heroStack}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-lg font-bold">
                {state.winner === "hero" ? "🏆 You win!" : state.winner === "villain" ? "Villain wins" : "Chop!"}
              </p>
            </CardContent>
          </Card>

          {!analysis && !analyzing && (
            <Button onClick={handleShowdown} className="w-full">
              Get AI Analysis
            </Button>
          )}

          {analyzing && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {analysis && <PostHandReport analysis={analysis} />}

          <Button variant="outline" onClick={handleReset} className="w-full">
            Play Another Hand
          </Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add `/simulate` to Sidebar**

In `src/components/layout/Sidebar.tsx`, add `Swords` to imports and add to primaryNav:
```tsx
// In imports, add Swords:
import { Grid3X3, Calculator, BookOpen, Brain, Trophy, Users, Zap, Settings, LogOut, Spade, Swords } from "lucide-react";

// In primaryNav array, add after Zap entry:
{ href: "/simulate", icon: Swords, label: "Simulate" },
```

- [ ] **Step 3: Add `/simulate` to BottomNav**

In `src/components/layout/BottomNav.tsx`:
```tsx
// In imports, add Swords:
import { Grid3X3, Calculator, BookOpen, Brain, Trophy, Swords } from "lucide-react";

// Replace Trophy entry with Swords (5 items max for mobile):
{ href: "/simulate", icon: Swords, label: "Simulate" },
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd /home/vukhanh732/poker-coach && bun run type-check 2>&1 | grep "error TS" | head -20
```
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
cd /home/vukhanh732/poker-coach && git add src/app/\(dashboard\)/simulate/ src/components/layout/Sidebar.tsx src/components/layout/BottomNav.tsx && git commit -m "feat: add simulate page and navigation links"
```

---

## Task 10: Rewrite ranges with Jonathan Little-style cash + tournament

**Files:**
- Modify: `src/data/ranges.ts`

- [ ] **Step 1: Rewrite ranges.ts**

Replace the full content of `src/data/ranges.ts` with the following (Jonathan Little 9-handed live cash, tighter early positions, plus tournament range set):

```ts
// Jonathan Little-inspired 9-handed live cash ranges ($1/$2–$2/$5)
// and tournament ranges (ICM-adjusted, tighter early, wider steal spots)

export type Action = "raise" | "call" | "fold";
export type GameMode = "cash" | "tournament";

export type RangeEntry = {
  hand: string;
  action: Action;
  note?: string;
};

export type PositionRange = {
  position: string;
  hands: RangeEntry[];
};

// ── Cash game RFI ranges (9-handed) ────────────────────────────────────────

const UTG_CASH: RangeEntry[] = [
  // Premium pairs
  { hand: "AA", action: "raise" }, { hand: "KK", action: "raise" },
  { hand: "QQ", action: "raise" }, { hand: "JJ", action: "raise" },
  { hand: "TT", action: "raise" }, { hand: "99", action: "raise" },
  // Strong aces
  { hand: "AKs", action: "raise" }, { hand: "AQs", action: "raise" },
  { hand: "AJs", action: "raise" }, { hand: "ATs", action: "raise" },
  { hand: "AKo", action: "raise" }, { hand: "AQo", action: "raise" },
  // Strong broadway
  { hand: "KQs", action: "raise" },
  // Everything else fold preflop UTG 9-handed
];

const UTG1_CASH: RangeEntry[] = [
  ...UTG_CASH,
  { hand: "88", action: "raise" },
  { hand: "A9s", action: "raise" }, { hand: "KJs", action: "raise" },
  { hand: "QJs", action: "raise" }, { hand: "AJo", action: "raise" },
];

const UTG2_CASH: RangeEntry[] = [
  ...UTG1_CASH,
  { hand: "77", action: "raise" },
  { hand: "A8s", action: "raise" }, { hand: "A7s", action: "raise" },
  { hand: "KTs", action: "raise" }, { hand: "QTs", action: "raise" },
  { hand: "JTs", action: "raise" }, { hand: "KQo", action: "raise" },
];

const HJ_CASH: RangeEntry[] = [
  ...UTG2_CASH,
  { hand: "66", action: "raise" }, { hand: "55", action: "raise" },
  { hand: "A6s", action: "raise" }, { hand: "A5s", action: "raise" },
  { hand: "A4s", action: "raise" }, { hand: "KJs", action: "raise" },
  { hand: "T9s", action: "raise" }, { hand: "98s", action: "raise" },
];

const CO_CASH: RangeEntry[] = [
  ...HJ_CASH,
  { hand: "44", action: "raise" }, { hand: "33", action: "raise" },
  { hand: "A3s", action: "raise" }, { hand: "A2s", action: "raise" },
  { hand: "K9s", action: "raise" }, { hand: "Q9s", action: "raise" },
  { hand: "J9s", action: "raise" }, { hand: "T8s", action: "raise" },
  { hand: "97s", action: "raise" }, { hand: "87s", action: "raise" },
  { hand: "76s", action: "raise" },
  { hand: "KJo", action: "raise" }, { hand: "QJo", action: "raise" },
  { hand: "ATo", action: "raise" },
];

const BTN_CASH: RangeEntry[] = [
  ...CO_CASH,
  { hand: "22", action: "raise" },
  { hand: "K8s", action: "raise" }, { hand: "K7s", action: "raise" },
  { hand: "K6s", action: "raise" }, { hand: "Q8s", action: "raise" },
  { hand: "J8s", action: "raise" }, { hand: "T7s", action: "raise" },
  { hand: "96s", action: "raise" }, { hand: "86s", action: "raise" },
  { hand: "75s", action: "raise" }, { hand: "65s", action: "raise" },
  { hand: "54s", action: "raise" },
  { hand: "KTo", action: "raise" }, { hand: "QTo", action: "raise" },
  { hand: "JTo", action: "raise" }, { hand: "K9o", action: "raise" },
];

const SB_CASH: RangeEntry[] = [
  // SB vs unopened: 3-bet or fold, don't complete
  { hand: "AA", action: "raise" }, { hand: "KK", action: "raise" },
  { hand: "QQ", action: "raise" }, { hand: "JJ", action: "raise" },
  { hand: "TT", action: "raise" }, { hand: "99", action: "raise" },
  { hand: "AKs", action: "raise" }, { hand: "AQs", action: "raise" },
  { hand: "AJs", action: "raise" }, { hand: "ATs", action: "raise" },
  { hand: "A5s", action: "raise" }, { hand: "A4s", action: "raise" }, // bluff 3-bets
  { hand: "KQs", action: "raise" }, { hand: "KJs", action: "raise" },
  { hand: "AKo", action: "raise" }, { hand: "AQo", action: "raise" },
  { hand: "AJo", action: "raise" },
];

const BB_CASH: RangeEntry[] = [
  // BB defend range vs BTN open (calling wide, 3-betting premiums)
  { hand: "AA", action: "raise" }, { hand: "KK", action: "raise" },
  { hand: "QQ", action: "raise" }, { hand: "JJ", action: "raise" },
  { hand: "AKs", action: "raise" }, { hand: "AQs", action: "raise" },
  { hand: "AKo", action: "raise" },
  // Defend (call) a wide range
  { hand: "TT", action: "call" }, { hand: "99", action: "call" },
  { hand: "88", action: "call" }, { hand: "77", action: "call" },
  { hand: "66", action: "call" }, { hand: "55", action: "call" },
  { hand: "44", action: "call" }, { hand: "33", action: "call" },
  { hand: "22", action: "call" },
  { hand: "AJs", action: "call" }, { hand: "ATs", action: "call" },
  { hand: "A9s", action: "call" }, { hand: "A8s", action: "call" },
  { hand: "A7s", action: "call" }, { hand: "A6s", action: "call" },
  { hand: "A5s", action: "call" }, { hand: "A4s", action: "call" },
  { hand: "A3s", action: "call" }, { hand: "A2s", action: "call" },
  { hand: "KQs", action: "call" }, { hand: "KJs", action: "call" },
  { hand: "KTs", action: "call" }, { hand: "K9s", action: "call" },
  { hand: "QJs", action: "call" }, { hand: "QTs", action: "call" },
  { hand: "JTs", action: "call" }, { hand: "T9s", action: "call" },
  { hand: "98s", action: "call" }, { hand: "87s", action: "call" },
  { hand: "76s", action: "call" }, { hand: "65s", action: "call" },
  { hand: "AQo", action: "call" }, { hand: "AJo", action: "call" },
  { hand: "ATo", action: "call" }, { hand: "KQo", action: "call" },
];

// ── Tournament RFI ranges (ICM-adjusted, tighter EP) ───────────────────────

const UTG_TOURNEY: RangeEntry[] = [
  { hand: "AA", action: "raise" }, { hand: "KK", action: "raise" },
  { hand: "QQ", action: "raise" }, { hand: "JJ", action: "raise" },
  { hand: "TT", action: "raise" },
  { hand: "AKs", action: "raise" }, { hand: "AQs", action: "raise" },
  { hand: "AJs", action: "raise" },
  { hand: "AKo", action: "raise" }, { hand: "AQo", action: "raise" },
  { hand: "KQs", action: "raise" },
];

const CO_TOURNEY: RangeEntry[] = [
  ...UTG_TOURNEY,
  { hand: "99", action: "raise" }, { hand: "88", action: "raise" },
  { hand: "ATs", action: "raise" }, { hand: "A9s", action: "raise" },
  { hand: "KJs", action: "raise" }, { hand: "QJs", action: "raise" },
  { hand: "JTs", action: "raise" }, { hand: "T9s", action: "raise" },
  { hand: "AJo", action: "raise" }, { hand: "KQo", action: "raise" },
];

const BTN_TOURNEY: RangeEntry[] = [
  ...CO_TOURNEY,
  { hand: "77", action: "raise" }, { hand: "66", action: "raise" },
  { hand: "55", action: "raise" }, { hand: "44", action: "raise" },
  { hand: "A8s", action: "raise" }, { hand: "A7s", action: "raise" },
  { hand: "A6s", action: "raise" }, { hand: "A5s", action: "raise" },
  { hand: "A4s", action: "raise" }, { hand: "A3s", action: "raise" },
  { hand: "K9s", action: "raise" }, { hand: "KTs", action: "raise" },
  { hand: "Q9s", action: "raise" }, { hand: "QTs", action: "raise" },
  { hand: "98s", action: "raise" }, { hand: "87s", action: "raise" },
  { hand: "76s", action: "raise" }, { hand: "65s", action: "raise" },
  { hand: "ATo", action: "raise" }, { hand: "KJo", action: "raise" },
  { hand: "QJo", action: "raise" },
];

// ── Exported range maps ─────────────────────────────────────────────────────

export const CASH_RANGES: Record<string, RangeEntry[]> = {
  UTG: UTG_CASH,
  "UTG+1": UTG1_CASH,
  "UTG+2": UTG2_CASH,
  HJ: HJ_CASH,
  CO: CO_CASH,
  BTN: BTN_CASH,
  SB: SB_CASH,
  BB: BB_CASH,
};

export const TOURNAMENT_RANGES: Record<string, RangeEntry[]> = {
  UTG: UTG_TOURNEY,
  "UTG+1": UTG_TOURNEY,
  "UTG+2": UTG_TOURNEY,
  HJ: CO_TOURNEY,
  CO: CO_TOURNEY,
  BTN: BTN_TOURNEY,
  SB: SB_CASH, // reuse SB 3-bet-or-fold logic
  BB: BB_CASH,
};

export function getRangeForPosition(position: string, mode: GameMode): RangeEntry[] {
  const ranges = mode === "cash" ? CASH_RANGES : TOURNAMENT_RANGES;
  return ranges[position] ?? [];
}

export function getHandAction(hand: string, position: string, mode: GameMode): Action {
  const range = getRangeForPosition(position, mode);
  const entry = range.find((e) => e.hand === hand);
  return entry?.action ?? "fold";
}

export const POSITIONS_9H = ["UTG", "UTG+1", "UTG+2", "HJ", "CO", "BTN", "SB", "BB"];
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /home/vukhanh732/poker-coach && bun run type-check 2>&1 | grep "error TS" | head -20
```
Expected: No errors. If the trainer page imports differently from ranges.ts, fix the import shape.

- [ ] **Step 3: Commit**

```bash
cd /home/vukhanh732/poker-coach && git add src/data/ranges.ts && git commit -m "feat: rewrite ranges with Jonathan Little 9-handed live cash + tournament"
```

---

## Task 11: Wire ranges mode toggle into trainer UI

**Files:**
- Modify: `src/app/(dashboard)/trainer/page.tsx`

- [ ] **Step 1: Read current trainer page**

```bash
cat /home/vukhanh732/poker-coach/src/app/\(dashboard\)/trainer/page.tsx
```

- [ ] **Step 2: Add GameMode state and toggle**

At the top of the trainer page component, add:
```tsx
const [gameMode, setGameMode] = useState<GameMode>("cash");
```

Add a toggle above or below the existing tabs:
```tsx
<div className="flex items-center gap-2 justify-end">
  <span className="text-xs text-muted-foreground">Mode:</span>
  <Button
    size="sm"
    variant={gameMode === "cash" ? "default" : "outline"}
    onClick={() => setGameMode("cash")}
  >
    Cash
  </Button>
  <Button
    size="sm"
    variant={gameMode === "tournament" ? "default" : "outline"}
    onClick={() => setGameMode("tournament")}
  >
    Tournament
  </Button>
</div>
```

Pass `gameMode` down to the range trainer component/hook so it calls `getHandAction(hand, position, gameMode)`.

- [ ] **Step 3: Verify TypeScript and commit**

```bash
cd /home/vukhanh732/poker-coach && bun run type-check 2>&1 | grep "error TS" | head -10
```

```bash
cd /home/vukhanh732/poker-coach && git add src/app/\(dashboard\)/trainer/ && git commit -m "feat: add cash/tournament mode toggle to trainer"
```

---

## Task 12: Full type-check + smoke test

- [ ] **Step 1: Run all tests**

```bash
cd /home/vukhanh732/poker-coach && bun run test 2>&1
```
Expected: All tests PASS.

- [ ] **Step 2: Full type-check**

```bash
cd /home/vukhanh732/poker-coach && bun run type-check 2>&1
```
Expected: 0 errors.

- [ ] **Step 3: Start dev server and verify manually**

```bash
cd /home/vukhanh732/poker-coach && bun run dev &
```

Visit in browser:
- `/simulate` — setup screen loads, deal cards works, actions respond, analysis loads after showdown
- `/trainer` — cash/tournament toggle visible, ranges use tighter UTG range
- Sidebar shows "Simulate" link with Swords icon
- Bottom nav updated on mobile

- [ ] **Step 4: Final commit if any cleanup needed**

```bash
cd /home/vukhanh732/poker-coach && git add -A && git commit -m "chore: final type fixes and smoke test cleanup"
```
