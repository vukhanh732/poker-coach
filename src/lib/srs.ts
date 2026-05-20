/**
 * SM-2 Spaced Repetition Algorithm
 *
 * easeFactor is stored as an integer × 100 (e.g., 250 = 2.5).
 * interval is in days.
 */

export type SM2Result = {
  repetitions: number;
  easeFactor: number; // integer × 100, e.g. 250 = 2.5
  interval: number;   // days until next review
  nextReviewAt: Date;
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
 * @returns              Updated SM-2 state.
 */
export function sm2(
  correct: boolean,
  repetitions: number,
  easeFactor: number,
  interval: number
): SM2Result {
  const now = new Date();

  if (!correct) {
    // On incorrect answer: reset streak, start over from day 1
    return {
      repetitions: 0,
      easeFactor: Math.max(MIN_EASE_FACTOR, easeFactor - 20), // slight ease factor drop
      interval: 1,
      nextReviewAt: addDays(now, 1),
    };
  }

  // Correct answer: update repetitions
  const newRepetitions = repetitions + 1;

  // Calculate new interval using SM-2 schedule
  let newInterval: number;
  if (newRepetitions === 1) {
    newInterval = 1;
  } else if (newRepetitions === 2) {
    newInterval = 6;
  } else {
    // interval × easeFactor (stored as ×100, so divide by 100)
    newInterval = Math.round(interval * (easeFactor / 100));
  }

  // Adjust ease factor using SM-2 formula (quality assumed 5 for correct, 2 for incorrect)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // For correct answers (q=5): EF' = EF + (0.1 - 0 * ...) = EF + 0.1
  // We'll use q=4 for correct (got it right but not instantly) to be conservative
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
  };
}

/**
 * Returns the default SM-2 state for a brand-new card (never seen).
 */
export function defaultSM2State(): {
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReviewAt: Date;
} {
  return {
    repetitions: 0,
    easeFactor: 250, // 2.5 × 100
    interval: 0,
    nextReviewAt: new Date(), // due immediately
  };
}
