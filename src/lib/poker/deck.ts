export type Suit = "s" | "h" | "d" | "c";
export type Card = { rank: number; suit: Suit }; // rank: 2–14 (14=Ace)

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
