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
    expect(heroEquity).toBeGreaterThan(0.70);
    expect(heroEquity).toBeLessThan(0.90);
  });

  it("river with complete board returns exact result (no sampling)", () => {
    // AA vs KK on a board with no improvement for KK — AA always wins
    const heroEquity = calculateEquity(
      [{ rank: 14, suit: "s" }, { rank: 14, suit: "h" }],
      [{ rank: 13, suit: "s" }, { rank: 13, suit: "h" }],
      [
        { rank: 2, suit: "c" },
        { rank: 5, suit: "d" },
        { rank: 7, suit: "h" },
        { rank: 9, suit: "c" },
        { rank: 3, suit: "s" },
      ]
    );
    expect(heroEquity).toBe(1); // exact: AA > KK on this board
  });

  it("returns ~0.5 in a rough coin-flip (AKo vs QQ)", () => {
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
