import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCents(cents: number): string {
  const dollars = cents / 100;
  const sign = dollars >= 0 ? "+" : "";
  return `${sign}$${Math.abs(dollars).toFixed(2)}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(d);
}

/** Parse "AKs", "AKo", "AA" into a display label */
export function formatHand(hand: string): string {
  return hand;
}

/** Convert dollars to cents */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/** Convert cents to dollars */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/** Calculate pot odds as a percentage */
export function calcPotOdds(pot: number, bet: number): number {
  if (bet <= 0) return 0;
  return (bet / (pot + bet)) * 100;
}

/** Rule of 4 (for 2 cards to come) or rule of 2 (for 1 card to come) */
export function calcEquityByOuts(outs: number, cards: 1 | 2): number {
  return outs * (cards === 2 ? 4 : 2);
}
