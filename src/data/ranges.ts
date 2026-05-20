export type RangeAction = "raise" | "call" | "fold" | "mixed";
export type Position = "UTG" | "UTG1" | "MP" | "HJ" | "CO" | "BTN" | "SB" | "BB";

export const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as const;
export type Rank = (typeof RANKS)[number];

/** Get hand notation from grid coordinates
 * row < col → suited (AKs), row > col → offsuit (AKo), row == col → pair (AA) */
export function getHandFromCoords(row: number, col: number): string {
  const r1 = RANKS[row]!;
  const r2 = RANKS[col]!;
  if (row === col) return `${r1}${r2}`;
  if (col > row) return `${r1}${r2}s`; // above diagonal = suited
  return `${r2}${r1}o`; // below diagonal = offsuit
}

/** Returns true if hand is suited */
export function isSuited(hand: string): boolean {
  return hand.endsWith("s");
}

/** Returns true if hand is a pair */
export function isPair(hand: string): boolean {
  return hand.length === 2 && hand[0] === hand[1];
}

// ─── Range definitions (exploitative $1/$2 live cash) ────────────────────────
// Sets of hands keyed by position. Everything not listed = fold.
// "raise" = open raise (RFI), "call" = cold-call or limp, "mixed" = sometimes raise/sometimes fold

const UTG_RAISE = new Set([
  "AA","KK","QQ","JJ","TT","99","88",
  "AKs","AQs","AJs","ATs","A9s","A5s","A4s",
  "KQs","KJs","KTs","QJs","JTs","T9s",
  "AKo","AQo","AJo","ATo",
]);
const UTG_MIXED = new Set(["77","A8s","A7s","A6s","A3s","A2s","KQo"]);

const UTG1_RAISE = new Set([
  ...UTG_RAISE,
  "77","A8s","A7s","A6s","A3s","A2s",
  "K9s","Q9s","QTs","98s","87s",
  "KQo","AJo",
]);
const UTG1_MIXED = new Set(["66","A5s","QJo"]);

const MP_RAISE = new Set([
  ...UTG1_RAISE,
  "66","55",
  "K8s","K7s","J9s","T8s","97s","76s","65s",
  "QJo","KJo",
]);
const MP_MIXED = new Set(["44","K6s","86s","75s"]);

const HJ_RAISE = new Set([
  ...MP_RAISE,
  "44","33",
  "K6s","K5s","K4s","K3s","K2s",
  "Q8s","J8s","86s","75s","64s","54s",
  "KTo","QTo","JTo",
]);
const HJ_MIXED = new Set(["22","Q7s","T7s","96s","74s","53s"]);

const CO_RAISE = new Set([
  ...HJ_RAISE,
  "22",
  "Q7s","Q6s","Q5s","T7s","96s","85s","74s","63s","53s","43s",
  "A9o","A8o","A7o","A6o","A5o",
  "K9o","Q9o","J9o","T9o",
]);
const CO_MIXED = new Set(["Q4s","Q3s","J7s","T6s","95s","84s","73s","62s","52s","42s","A4o","A3o","A2o"]);

const BTN_RAISE = new Set([
  ...CO_RAISE,
  "Q4s","Q3s","Q2s","J7s","J6s","J5s","T6s","T5s","95s","94s","84s","83s","73s","72s","62s","52s","42s","32s",
  "A4o","A3o","A2o","K8o","K7o","K6o","Q8o","Q7o","J8o","J7o","T8o","T7o","98o","97o","87o","76o","65o",
]);
const BTN_MIXED = new Set(["J4s","J3s","J2s","T4s","T3s","93s","92s","83s","82s","63s","53s","43s"]);

// SB is tricky — mostly raise-or-fold vs steal, limp some speculative hands
const SB_RAISE = new Set([
  ...BTN_RAISE,
  "J4s","T4s","T3s","93s","83s","63s","53s","43s",
  "K5o","K4o","K3o","K2o","Q6o","Q5o","Q4o","J6o","J5o","T6o","96o","86o","75o",
]);
const SB_CALL = new Set(["22","33","44","55","66","77"]);

// BB defends wide against opens
const BB_RAISE = new Set(["AA","KK","QQ","JJ","AKs","AQs","AKo"]);
const BB_CALL = new Set([
  "TT","99","88","77","66","55","44","33","22",
  "AJs","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s",
  "KQs","KJs","KTs","K9s","K8s","K7s","K6s","K5s","K4s","K3s","K2s",
  "QJs","QTs","Q9s","Q8s","Q7s","Q6s","Q5s","Q4s","Q3s","Q2s",
  "JTs","J9s","J8s","J7s","J6s","J5s",
  "T9s","T8s","T7s","T6s","T5s",
  "98s","97s","96s","95s","94s",
  "87s","86s","85s","84s","83s",
  "76s","75s","74s","73s","72s",
  "65s","64s","63s","62s",
  "54s","53s","52s","43s","42s","32s",
  "AQo","AJo","ATo","A9o","A8o","A7o","A6o","A5o","A4o","A3o","A2o",
  "KQo","KJo","KTo","K9o","K8o","K7o","K6o",
  "QJo","QTo","Q9o","Q8o",
  "JTo","J9o","J8o",
  "T9o","T8o",
  "98o","97o","87o","76o","65o",
]);

// ─── Range lookup function ─────────────────────────────────────────────────────

type RangeConfig = {
  raise: Set<string>;
  call?: Set<string>;
  mixed?: Set<string>;
};

const RANGE_DATA: Record<Position, RangeConfig> = {
  UTG: { raise: UTG_RAISE, mixed: UTG_MIXED },
  UTG1: { raise: UTG1_RAISE, mixed: UTG1_MIXED },
  MP: { raise: MP_RAISE, mixed: MP_MIXED },
  HJ: { raise: HJ_RAISE, mixed: HJ_MIXED },
  CO: { raise: CO_RAISE, mixed: CO_MIXED },
  BTN: { raise: BTN_RAISE, mixed: BTN_MIXED },
  SB: { raise: SB_RAISE, call: SB_CALL },
  BB: { raise: BB_RAISE, call: BB_CALL },
};

export function getHandAction(position: Position, hand: string): RangeAction {
  const config = RANGE_DATA[position];
  if (config.raise.has(hand)) return "raise";
  if (config.call?.has(hand)) return "call";
  if (config.mixed?.has(hand)) return "mixed";
  return "fold";
}

export function getPositionStats(position: Position): {
  raiseCount: number;
  callCount: number;
  foldCount: number;
  mixedCount: number;
  totalHands: number;
  raisePercent: number;
} {
  const config = RANGE_DATA[position];
  const raiseCount = config.raise.size;
  const callCount = config.call?.size ?? 0;
  const mixedCount = config.mixed?.size ?? 0;
  const totalHands = 169;
  const foldCount = totalHands - raiseCount - callCount - mixedCount;

  return {
    raiseCount,
    callCount,
    foldCount,
    mixedCount,
    totalHands,
    raisePercent: Math.round(((raiseCount + callCount + mixedCount * 0.5) / totalHands) * 100),
  };
}

export const POSITION_LABELS: Record<Position, string> = {
  UTG: "Under the Gun",
  UTG1: "UTG+1",
  MP: "Middle Position",
  HJ: "Hijack",
  CO: "Cutoff",
  BTN: "Button",
  SB: "Small Blind",
  BB: "Big Blind",
};

export const POSITIONS: Position[] = ["UTG", "UTG1", "MP", "HJ", "CO", "BTN", "SB", "BB"];

// ─── Simulation / mode-aware range additions ──────────────────────────────────

export type GameMode = "cash" | "tournament";

export type RangeEntry = {
  hand: string;
  action: "raise" | "call" | "fold";
  note?: string;
};

const UTG_CASH_SIM: RangeEntry[] = [
  { hand: "AA", action: "raise" }, { hand: "KK", action: "raise" },
  { hand: "QQ", action: "raise" }, { hand: "JJ", action: "raise" },
  { hand: "TT", action: "raise" }, { hand: "99", action: "raise" },
  { hand: "AKs", action: "raise" }, { hand: "AQs", action: "raise" },
  { hand: "AJs", action: "raise" }, { hand: "ATs", action: "raise" },
  { hand: "AKo", action: "raise" }, { hand: "AQo", action: "raise" },
  { hand: "KQs", action: "raise" },
];

const UTG1_CASH_SIM: RangeEntry[] = [
  ...UTG_CASH_SIM,
  { hand: "88", action: "raise" },
  { hand: "A9s", action: "raise" }, { hand: "KJs", action: "raise" },
  { hand: "QJs", action: "raise" }, { hand: "AJo", action: "raise" },
];

const UTG2_CASH_SIM: RangeEntry[] = [
  ...UTG1_CASH_SIM,
  { hand: "77", action: "raise" },
  { hand: "A8s", action: "raise" }, { hand: "A7s", action: "raise" },
  { hand: "KTs", action: "raise" }, { hand: "QTs", action: "raise" },
  { hand: "JTs", action: "raise" }, { hand: "KQo", action: "raise" },
];

const HJ_CASH_SIM: RangeEntry[] = [
  ...UTG2_CASH_SIM,
  { hand: "66", action: "raise" }, { hand: "55", action: "raise" },
  { hand: "A6s", action: "raise" }, { hand: "A5s", action: "raise" },
  { hand: "A4s", action: "raise" },
  { hand: "T9s", action: "raise" }, { hand: "98s", action: "raise" },
];

const CO_CASH_SIM: RangeEntry[] = [
  ...HJ_CASH_SIM,
  { hand: "44", action: "raise" }, { hand: "33", action: "raise" },
  { hand: "A3s", action: "raise" }, { hand: "A2s", action: "raise" },
  { hand: "K9s", action: "raise" }, { hand: "Q9s", action: "raise" },
  { hand: "J9s", action: "raise" }, { hand: "T8s", action: "raise" },
  { hand: "97s", action: "raise" }, { hand: "87s", action: "raise" },
  { hand: "76s", action: "raise" },
  { hand: "KJo", action: "raise" }, { hand: "QJo", action: "raise" },
  { hand: "ATo", action: "raise" },
];

const BTN_CASH_SIM: RangeEntry[] = [
  ...CO_CASH_SIM,
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

const SB_CASH_SIM: RangeEntry[] = [
  { hand: "AA", action: "raise" }, { hand: "KK", action: "raise" },
  { hand: "QQ", action: "raise" }, { hand: "JJ", action: "raise" },
  { hand: "TT", action: "raise" }, { hand: "99", action: "raise" },
  { hand: "AKs", action: "raise" }, { hand: "AQs", action: "raise" },
  { hand: "AJs", action: "raise" }, { hand: "ATs", action: "raise" },
  { hand: "A5s", action: "raise" }, { hand: "A4s", action: "raise" },
  { hand: "KQs", action: "raise" }, { hand: "KJs", action: "raise" },
  { hand: "AKo", action: "raise" }, { hand: "AQo", action: "raise" },
  { hand: "AJo", action: "raise" },
];

const BB_CASH_SIM: RangeEntry[] = [
  { hand: "AA", action: "raise" }, { hand: "KK", action: "raise" },
  { hand: "QQ", action: "raise" }, { hand: "JJ", action: "raise" },
  { hand: "AKs", action: "raise" }, { hand: "AQs", action: "raise" },
  { hand: "AKo", action: "raise" },
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

const UTG_TOURNEY_SIM: RangeEntry[] = [
  { hand: "AA", action: "raise" }, { hand: "KK", action: "raise" },
  { hand: "QQ", action: "raise" }, { hand: "JJ", action: "raise" },
  { hand: "TT", action: "raise" },
  { hand: "AKs", action: "raise" }, { hand: "AQs", action: "raise" },
  { hand: "AJs", action: "raise" },
  { hand: "AKo", action: "raise" }, { hand: "AQo", action: "raise" },
  { hand: "KQs", action: "raise" },
];

const CO_TOURNEY_SIM: RangeEntry[] = [
  ...UTG_TOURNEY_SIM,
  { hand: "99", action: "raise" }, { hand: "88", action: "raise" },
  { hand: "ATs", action: "raise" }, { hand: "A9s", action: "raise" },
  { hand: "KJs", action: "raise" }, { hand: "QJs", action: "raise" },
  { hand: "JTs", action: "raise" }, { hand: "T9s", action: "raise" },
  { hand: "AJo", action: "raise" }, { hand: "KQo", action: "raise" },
];

const BTN_TOURNEY_SIM: RangeEntry[] = [
  ...CO_TOURNEY_SIM,
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

export const CASH_RANGES: Record<string, RangeEntry[]> = {
  UTG: UTG_CASH_SIM,
  "UTG+1": UTG1_CASH_SIM,
  "UTG+2": UTG2_CASH_SIM,
  HJ: HJ_CASH_SIM,
  CO: CO_CASH_SIM,
  BTN: BTN_CASH_SIM,
  SB: SB_CASH_SIM,
  BB: BB_CASH_SIM,
};

export const TOURNAMENT_RANGES: Record<string, RangeEntry[]> = {
  UTG: UTG_TOURNEY_SIM,
  "UTG+1": UTG_TOURNEY_SIM,
  "UTG+2": UTG_TOURNEY_SIM,
  HJ: CO_TOURNEY_SIM,
  CO: CO_TOURNEY_SIM,
  BTN: BTN_TOURNEY_SIM,
  SB: SB_CASH_SIM,
  BB: BB_CASH_SIM,
};

export function getRangeForPosition(position: string, mode: GameMode): RangeEntry[] {
  const ranges = mode === "cash" ? CASH_RANGES : TOURNAMENT_RANGES;
  return ranges[position] ?? [];
}

export function getHandActionForMode(hand: string, position: string, mode: GameMode): "raise" | "call" | "fold" {
  const range = getRangeForPosition(position, mode);
  const entry = range.find((e) => e.hand === hand);
  return entry?.action ?? "fold";
}

export const POSITIONS_9H = ["UTG", "UTG+1", "UTG+2", "HJ", "CO", "BTN", "SB", "BB"];
