import { describe, it, expect } from "vitest";
import {
  SUIT_FILL,
  SIZE_STYLES,
  SUIT_PATHS,
  getSuitFill,
  isRedSuit,
} from "../playing-card-data";

describe("PlayingCard data", () => {
  it("hearts use gold-spec-400 fill", () => {
    expect(SUIT_FILL.h).toContain("gold-spec-400");
  });

  it("diamonds use gold-spec-400 fill", () => {
    expect(SUIT_FILL.d).toContain("gold-spec-400");
  });

  it("spades use ink-50 fill", () => {
    expect(SUIT_FILL.s).toContain("ink-50");
  });

  it("clubs use ink-50 fill", () => {
    expect(SUIT_FILL.c).toContain("ink-50");
  });

  it("getSuitFill returns gold for hearts", () => {
    expect(getSuitFill("h")).toContain("gold-spec-400");
  });

  it("isRedSuit: hearts and diamonds are red", () => {
    expect(isRedSuit("h")).toBe(true);
    expect(isRedSuit("d")).toBe(true);
    expect(isRedSuit("s")).toBe(false);
    expect(isRedSuit("c")).toBe(false);
  });

  it("sm size is 32px wide (w-8)", () => {
    expect(SIZE_STYLES.sm.width).toBe("w-8");
  });

  it("lg size is 60px wide (w-[60px])", () => {
    expect(SIZE_STYLES.lg.width).toBe("w-[60px]");
  });

  it("all suits have SVG path data", () => {
    for (const suit of ["h", "d", "s", "c"] as const) {
      expect(SUIT_PATHS[suit].length).toBeGreaterThan(0);
    }
  });

  it("suit path data snapshot", () => {
    expect(SUIT_PATHS).toMatchSnapshot();
  });
});
