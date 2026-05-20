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
    const same = shuffled.every((c, i) => c.rank === deck[i]!.rank && c.suit === deck[i]!.suit);
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

describe("suitToSymbol", () => {
  it("converts suit letters to symbols", () => {
    expect(suitToSymbol("s")).toBe("♠");
    expect(suitToSymbol("h")).toBe("♥");
  });
});
