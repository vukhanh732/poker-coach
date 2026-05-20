"use client";

import { useState, useCallback } from "react";
import { makeDeck, shuffle, dealCards, cardToString } from "@/lib/poker/deck";
import { calculateEquity } from "@/lib/poker/equity";
import { villainDecide, VillainType } from "@/lib/poker/villain";
import { bestHandFrom } from "@/lib/poker/hand-eval";
import type { Card } from "@/lib/poker/deck";
import type { StreetDecision } from "@/app/actions/simulation";

export type GameType = "hu" | "6max";
export type Street = "setup" | "preflop" | "flop" | "turn" | "river" | "showdown" | "analysis";

export type SimState = {
  phase: Street;
  heroCards: Card[];
  villainCards: Card[];
  board: Card[];
  pot: number;
  heroStack: number;
  villainStack: number;
  currentBet: number;
  decisions: StreetDecision[];
  villainType: VillainType;
  gameType: GameType;
  lastVillainAction: string;
  deck: Card[];
  equity: number;
  winner: "hero" | "villain" | "tie" | null;
};

const STARTING_STACK = 20000;
const BIG_BLIND = 200;
const SMALL_BLIND = 100;

function freshState(villainType: VillainType, gameType: GameType): SimState {
  const deck = shuffle(makeDeck());
  const { cards: heroCards, remaining: r1 } = dealCards(deck, 2);
  const { cards: villainCards, remaining: r2 } = dealCards(r1, 2);
  return {
    phase: "preflop",
    heroCards,
    villainCards,
    board: [],
    pot: BIG_BLIND + SMALL_BLIND,
    heroStack: STARTING_STACK - BIG_BLIND,
    villainStack: STARTING_STACK - SMALL_BLIND,
    currentBet: BIG_BLIND,
    decisions: [],
    villainType,
    gameType,
    lastVillainAction: "posted small blind",
    deck: r2,
    equity: 0.5,
    winner: null,
  };
}

export function useSimulation() {
  const [state, setState] = useState<SimState | null>(null);

  const startGame = useCallback((villainType: VillainType, gameType: GameType) => {
    setState(freshState(villainType, gameType));
  }, []);

  const heroAct = useCallback(
    (action: "fold" | "call" | "raise", raiseSizeBB = 3) => {
      if (!state) return;
      setState((prev) => {
        if (!prev) return prev;
        const next = { ...prev };

        if (action === "fold") {
          next.phase = "showdown";
          next.winner = "villain";
          next.decisions = [
            ...prev.decisions,
            {
              street: prev.phase as StreetDecision["street"],
              heroAction: "folded",
              equity: prev.equity,
              board: prev.board.map(cardToString).join(" "),
              pot: prev.pot,
            },
          ];
          return next;
        }

        const callAmount = Math.min(prev.currentBet, prev.heroStack);
        let heroAction = "";
        if (action === "call") {
          next.heroStack = prev.heroStack - callAmount;
          next.pot = prev.pot + callAmount;
          next.currentBet = prev.currentBet;
          heroAction = `called $${(callAmount / 100).toFixed(0)}`;
        } else {
          const raiseAmount = raiseSizeBB * BIG_BLIND;
          next.heroStack = prev.heroStack - raiseAmount;
          next.pot = prev.pot + raiseAmount;
          next.currentBet = raiseAmount;
          heroAction = `raised to $${(raiseAmount / 100).toFixed(0)}`;
        }

        const equity = calculateEquity(prev.heroCards, prev.villainCards, prev.board, 200);
        const villainHandStrength = 1 - equity;
        const potOdds = next.currentBet / (next.pot + next.currentBet);
        const vDecision = villainDecide({
          villainType: prev.villainType,
          handStrength: villainHandStrength,
          potOdds,
          street: prev.phase as "preflop" | "flop" | "turn" | "river",
          facingAction: action === "raise" ? "raise" : "bet",
        });

        let villainActionStr = "";
        if (vDecision.action === "fold") {
          next.phase = "showdown";
          next.winner = "hero";
          villainActionStr = "folded";
        } else if (vDecision.action === "call") {
          const vCall = Math.min(next.currentBet, next.villainStack);
          next.villainStack = prev.villainStack - vCall;
          next.pot = next.pot + vCall;
          villainActionStr = `called $${(vCall / 100).toFixed(0)}`;
        } else {
          const vRaise = (vDecision.sizingBB ?? 3) * BIG_BLIND;
          next.villainStack = prev.villainStack - vRaise;
          next.pot = next.pot + vRaise;
          next.currentBet = vRaise;
          villainActionStr = `raised to $${(vRaise / 100).toFixed(0)}`;
        }

        next.lastVillainAction = villainActionStr;
        next.decisions = [
          ...prev.decisions,
          {
            street: prev.phase as StreetDecision["street"],
            heroAction,
            equity,
            board: prev.board.map(cardToString).join(" "),
            pot: next.pot,
          },
        ];
        next.equity = equity;

        if (next.phase !== "showdown") {
          const advanced = advanceStreet(prev.phase, next);
          return advanced;
        }

        return next;
      });
    },
    [state]
  );

  const resetGame = useCallback(() => setState(null), []);

  return { state, startGame, heroAct, resetGame };
}

function advanceStreet(current: Street, state: SimState): SimState {
  const streetOrder: Street[] = ["preflop", "flop", "turn", "river", "showdown"];
  const idx = streetOrder.indexOf(current);
  const next = streetOrder[idx + 1] ?? "showdown";
  const updated = { ...state };

  if (next === "flop") {
    const { cards, remaining } = dealCards(state.deck, 3);
    updated.board = cards;
    updated.deck = remaining;
    updated.currentBet = 0;
  } else if (next === "turn" || next === "river") {
    const { cards, remaining } = dealCards(state.deck, 1);
    updated.board = [...state.board, ...cards];
    updated.deck = remaining;
    updated.currentBet = 0;
  } else if (next === "showdown") {
    let deck = state.deck;
    let board = [...state.board];
    const needed = 5 - board.length;
    if (needed > 0) {
      const { cards, remaining } = dealCards(deck, needed);
      board = [...board, ...cards];
      deck = remaining;
    }
    updated.board = board;
    updated.deck = deck;
    const heroResult = bestHandFrom([...state.heroCards, ...board]);
    const villainResult = bestHandFrom([...state.villainCards, ...board]);
    if (heroResult.rank > villainResult.rank) updated.winner = "hero";
    else if (heroResult.rank < villainResult.rank) updated.winner = "villain";
    else updated.winner = "tie";
  }

  updated.phase = next;
  return updated;
}
