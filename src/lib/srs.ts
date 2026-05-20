/**
 * SM-2 Spaced Repetition Algorithm
 *
 * easeFactor is stored as an integer × 100 (e.g., 250 = 2.5).
 * interval is in days.
 * lapses counts lifetime failures; ≥4 marks the card as a "leech".
 */

export type SM2Result = {
  repetitions: number;
  easeFactor: number; // integer × 100, e.g. 250 = 2.5
  interval: number;   // days until next review
  nextReviewAt: Date;
  lapses: number;
};

const MIN_EASE_FACTOR = 130; // 1.3 × 100

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * SM-2 algorithm.
 *
 * @param correct        Whether the answer was correct.
 * @param repetitions    Current repetition count.
 * @param easeFactor     Current ease factor (stored as integer × 100).
 * @param interval       Current interval in days.
 * @param lapses         Current lifetime failure count.
 * @returns              Updated SM-2 state.
 */
export function sm2(
  correct: boolean,
  repetitions: number,
  easeFactor: number,
  interval: number,
  lapses: number = 0
): SM2Result {
  const now = new Date();

  if (!correct) {
    return {
      repetitions: 0,
      easeFactor: Math.max(MIN_EASE_FACTOR, easeFactor - 20),
      interval: 1,
      nextReviewAt: addDays(now, 1),
      lapses: lapses + 1,
    };
  }

  const newRepetitions = repetitions + 1;

  let newInterval: number;
  if (newRepetitions === 1) {
    newInterval = 1;
  } else if (newRepetitions === 2) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * (easeFactor / 100));
  }

  // EF updated with quality=4 (correct but not instant)
  const quality = 4;
  const easeFactorReal = easeFactor / 100;
  const newEaseFactorReal =
    easeFactorReal + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const newEaseFactor = Math.max(
    MIN_EASE_FACTOR,
    Math.round(newEaseFactorReal * 100)
  );

  return {
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    interval: newInterval,
    nextReviewAt: addDays(now, newInterval),
    lapses,
  };
}

/** A card with lapses ≥ 4 is a "leech" — flag it for the user's attention. */
export function isLeech(lapses: number): boolean {
  return lapses >= 4;
}

export function defaultSM2State(): {
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReviewAt: Date;
  lapses: number;
} {
  return {
    repetitions: 0,
    easeFactor: 250,
    interval: 0,
    nextReviewAt: new Date(),
    lapses: 0,
  };
}
