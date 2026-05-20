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
    const cards: Card[] = [c(14,"h"), c(14,"s"), c(13,"h"), c(12,"h"), c(11,"h"), c(10,"h"), c(2,"s")];
    const result = bestHandFrom(cards);
    expect(result.rank).toBe(HandRank.StraightFlush);
  });
});
