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

  if (isFlush && isStraight) return mk(HandRank.StraightFlush, ranks[0]!);
  if (counts[0] === 4) return mk(HandRank.FourOfAKind, getGroupRank(rankCounts, 4));
  if (counts[0] === 3 && counts[1] === 2) return mk(HandRank.FullHouse, getGroupRank(rankCounts, 3));
  if (isFlush) return mk(HandRank.Flush, ranks[0]!);
  if (isStraight) return mk(HandRank.Straight, ranks[0]!);
  if (counts[0] === 3) return mk(HandRank.ThreeOfAKind, getGroupRank(rankCounts, 3));
  if (counts[0] === 2 && counts[1] === 2) return mk(HandRank.TwoPair, getGroupRank(rankCounts, 2));
  if (counts[0] === 2) return mk(HandRank.OnePair, getGroupRank(rankCounts, 2));
  return mk(HandRank.HighCard, ranks[0]!);
}

function mk(rank: HandRank, value: number): HandResult {
  return { rank, value, name: HandRankName[rank] };
}

function checkStraight(sortedRanks: number[]): boolean {
  if (sortedRanks[0]! - sortedRanks[4]! === 4 && new Set(sortedRanks).size === 5) return true;
  // Wheel: A-2-3-4-5
  return sortedRanks[0] === 14 && sortedRanks[1] === 5 && sortedRanks[2] === 4 && sortedRanks[3] === 3 && sortedRanks[4] === 2;
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
  return [
    ...combinations(rest, k - 1).map((combo) => [first!, ...combo]),
    ...combinations(rest, k),
  ];
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
