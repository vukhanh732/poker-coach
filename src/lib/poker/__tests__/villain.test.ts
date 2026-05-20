import { describe, it, expect } from "vitest";
import { villainDecide, VillainType } from "../villain";

describe("villainDecide - Nit", () => {
  it("folds weak hand to raise", () => {
    const action = villainDecide({
      villainType: VillainType.Nit,
      handStrength: 0.2,
      potOdds: 0.33,
      street: "flop",
      facingAction: "raise",
    });
    expect(action.action).toBe("fold");
  });

  it("calls or raises with strong hand", () => {
    const action = villainDecide({
      villainType: VillainType.Nit,
      handStrength: 0.85,
      potOdds: 0.33,
      street: "flop",
      facingAction: "bet",
    });
    expect(["call", "raise"]).toContain(action.action);
  });
});

describe("villainDecide - Fish", () => {
  it("calls more often than a nit with marginal hands", () => {
    let fishCalls = 0;
    let nitCalls = 0;
    for (let i = 0; i < 100; i++) {
      const fish = villainDecide({ villainType: VillainType.Fish, handStrength: 0.4, potOdds: 0.25, street: "flop", facingAction: "bet" });
      const nit = villainDecide({ villainType: VillainType.Nit, handStrength: 0.4, potOdds: 0.25, street: "flop", facingAction: "bet" });
      if (fish.action !== "fold") fishCalls++;
      if (nit.action !== "fold") nitCalls++;
    }
    expect(fishCalls).toBeGreaterThan(nitCalls);
  });
});
