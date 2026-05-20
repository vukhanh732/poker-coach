import { makeDeck, shuffle, dealCards } from "./deck";
import { bestHandFrom } from "./hand-eval";
import type { Card } from "./deck";

function compareHands(heroCards: Card[], villainCards: Card[], board: Card[]): number {
  const heroResult = bestHandFrom([...heroCards, ...board]);
  const villainResult = bestHandFrom([...villainCards, ...board]);
  if (heroResult.rank > villainResult.rank) return 1;
  if (heroResult.rank < villainResult.rank) return 0;
  if (heroResult.value > villainResult.value) return 1;
  if (heroResult.value < villainResult.value) return 0;
  return 0.5;
}

export function calculateEquity(
  heroCards: Card[],
  villainCards: Card[],
  board: Card[],
  iterations = 2000
): number {
  const needed = 5 - board.length;

  // River: board is complete — exact result, no sampling needed
  if (needed === 0) {
    return compareHands(heroCards, villainCards, board);
  }

  const knownCards = new Set(
    [...heroCards, ...villainCards, ...board].map((c) => `${c.rank}${c.suit}`)
  );

  let wins = 0;
  let ties = 0;

  for (let i = 0; i < iterations; i++) {
    const remaining = shuffle(
      makeDeck().filter((c) => !knownCards.has(`${c.rank}${c.suit}`))
    );
    const { cards: runout } = dealCards(remaining, needed);
    const fullBoard = [...board, ...runout];

    const result = compareHands(heroCards, villainCards, fullBoard);
    if (result === 1) wins++;
    else if (result === 0.5) ties++;
  }

  return (wins + ties * 0.5) / iterations;
}
