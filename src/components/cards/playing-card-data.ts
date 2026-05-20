import type { Suit, CardSize } from "./PlayingCard";

export const SUIT_FILL: Record<Suit, string> = {
  h: "var(--color-gold-spec-400)",
  d: "var(--color-gold-spec-400)",
  s: "var(--color-ink-50)",
  c: "var(--color-ink-50)",
};

export const SIZE_STYLES: Record<
  CardSize,
  { width: string; rankSize: string; suitSize: string; padding: string }
> = {
  sm: { width: "w-8", rankSize: "text-[10px]", suitSize: "w-3 h-3", padding: "p-0.5" },
  lg: { width: "w-[60px]", rankSize: "text-base", suitSize: "w-5 h-5", padding: "p-1.5" },
};

// SVG path data for each suit (viewBox 0 0 24 24)
export const SUIT_PATHS: Record<Suit, string> = {
  h: "M12 21.6C6.4 16.1 1 11.3 1 7.2c0-3.8 3.1-5.2 5.3-5.2 1.3 0 4.1.5 5.7 4.5C13.6 2.5 16.5 2 17.7 2 20.2 2 23 3.6 23 7.2c0 4.1-5.1 8.6-11 14.4z",
  d: "M12 2 L22 12 L12 22 L2 12 Z",
  s: "M12 2C9 5.5 3 9 3 14c0 3 2 4.5 4.5 4-.5 1.5-1.5 2.5-3 3h15c-1.5-.5-2.5-1.5-3-3C19 18.5 21 17 21 14c0-5-6-8.5-9-12z",
  c: "M12 3a3.5 3.5 0 0 0-2.5 6A3.5 3.5 0 0 0 3 12.5 3.5 3.5 0 0 0 7 16c.6 0 1.1-.1 1.6-.3C8 17 7 18 5 19h14c-2-1-3-2-3.6-3.3.5.2 1 .3 1.6.3a3.5 3.5 0 0 0 4-3.5A3.5 3.5 0 0 0 14.5 9 3.5 3.5 0 0 0 12 3z",
};

export function getSuitFill(suit: Suit): string {
  return SUIT_FILL[suit];
}

export function isRedSuit(suit: Suit): boolean {
  return suit === "h" || suit === "d";
}
