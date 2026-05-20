export enum VillainType {
  Nit = "Nit",
  TAG = "TAG",
  LAG = "LAG",
  Fish = "Fish",
}

export type VillainAction = { action: "fold" | "call" | "raise"; sizingBB?: number };

export type VillainDecideInput = {
  villainType: VillainType;
  handStrength: number; // 0-1
  potOdds: number;
  street: "preflop" | "flop" | "turn" | "river";
  facingAction: "check" | "bet" | "raise" | "3bet";
};

const thresholds: Record<VillainType, { foldBelow: number; raiseAbove: number; bluffFreq: number }> = {
  [VillainType.Nit]:  { foldBelow: 0.65, raiseAbove: 0.80, bluffFreq: 0.02 },
  [VillainType.TAG]:  { foldBelow: 0.45, raiseAbove: 0.70, bluffFreq: 0.10 },
  [VillainType.LAG]:  { foldBelow: 0.35, raiseAbove: 0.60, bluffFreq: 0.20 },
  [VillainType.Fish]: { foldBelow: 0.25, raiseAbove: 0.75, bluffFreq: 0.05 },
};

export function villainDecide(input: VillainDecideInput): VillainAction {
  const { villainType, handStrength, facingAction } = input;
  const t = thresholds[villainType];
  const isBluff = Math.random() < t.bluffFreq;

  if (facingAction === "check") {
    if (handStrength > t.raiseAbove || isBluff) return { action: "raise", sizingBB: 2 };
    return { action: "call" }; // check behind
  }

  if (handStrength < t.foldBelow && !isBluff) return { action: "fold" };
  if (handStrength >= t.raiseAbove || isBluff) return { action: "raise", sizingBB: 3 };
  return { action: "call" };
}

export function strengthFromEquity(equity: number): number {
  return equity;
}
