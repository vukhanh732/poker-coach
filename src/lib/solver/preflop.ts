export type GTOFrequencies = {
  raise: number;
  call: number;
  fold: number;
};

export type GTOSolution = Record<string, GTOFrequencies>;

const POSITION_FILES: Record<string, string> = {
  UTG: "utg",
  "UTG+1": "utg1",
  MP: "mp",
  HJ: "hj",
  CO: "co",
  BTN: "btn",
  SB: "sb",
  BB: "bb",
};

// In-memory cache after first fetch
const cache = new Map<string, GTOSolution>();

export async function loadPreflopGTO(
  position: string
): Promise<GTOSolution | null> {
  const file = POSITION_FILES[position];
  if (!file) return null;

  if (cache.has(position)) return cache.get(position)!;

  try {
    const res = await fetch(`/solver/preflop/${file}.json`);
    if (!res.ok) return null;
    const data = (await res.json()) as GTOSolution;
    cache.set(position, data);
    return data;
  } catch {
    return null;
  }
}

export function getGTOFreq(
  solution: GTOSolution | null,
  hand: string
): GTOFrequencies | undefined {
  return solution?.[hand];
}
