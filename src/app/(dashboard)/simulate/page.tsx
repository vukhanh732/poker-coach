"use client";

import { useState } from "react";
import { SimulationSetup } from "@/components/features/simulation/SimulationSetup";
import { HoleCards } from "@/components/features/simulation/HoleCards";
import { CommunityCards } from "@/components/features/simulation/CommunityCards";
import { ActionPanel } from "@/components/features/simulation/ActionPanel";
import { EquityBadge } from "@/components/features/simulation/EquityBadge";
import { PostHandReport } from "@/components/features/simulation/PostHandReport";
import { useSimulation } from "@/hooks/useSimulation";
import { analyzeSimulation } from "@/app/actions/simulation";
import { cardToString } from "@/lib/poker/deck";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DecisionClock } from "@/components/simulate/DecisionClock";
import { useDecisionClockSettings } from "@/hooks/useDecisionClockSettings";
import type { SimulationAnalysis } from "@/app/actions/simulation";
import type { VillainType } from "@/lib/poker/villain";
import type { GameType } from "@/hooks/useSimulation";

export default function SimulatePage() {
  const { state, startGame, heroAct, resetGame } = useSimulation();
  const [analysis, setAnalysis] = useState<SimulationAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { settings: clockSettings } = useDecisionClockSettings();

  async function handleShowdown() {
    if (!state) return;
    setAnalyzing(true);
    const heroStr = state.heroCards.map(cardToString).join(" ");
    const villainStr = state.villainCards.map(cardToString).join(" ");
    const result = await analyzeSimulation(state.decisions, heroStr, villainStr, state.villainType);
    if ("success" in result) setAnalysis(result.analysis);
    setAnalyzing(false);
  }

  function handleStart(villainType: VillainType, gameType: GameType) {
    setAnalysis(null);
    startGame(villainType, gameType);
  }

  function handleReset() {
    setAnalysis(null);
    resetGame();
  }

  if (!state) {
    return <SimulationSetup onStart={handleStart} />;
  }

  const isShowdown = state.phase === "showdown" || state.phase === "analysis";

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto pb-24">
      <Card className="bg-[#1a472a] border-[#2d6a44]">
        <CardContent className="pt-4 flex flex-col gap-4 items-center">
          <HoleCards
            cards={state.villainCards}
            faceDown={!isShowdown}
            label={`Villain (${state.villainType}) — $${(state.villainStack / 100).toFixed(0)}`}
          />

          <div className="w-full">
            <CommunityCards cards={state.board} />
          </div>

          <div className="text-center">
            <p className="text-xs text-white/60">Pot</p>
            <p className="text-lg font-bold text-white">${(state.pot / 100).toFixed(0)}</p>
          </div>

          <HoleCards
            cards={state.heroCards}
            label={`You — $${(state.heroStack / 100).toFixed(0)}`}
          />
        </CardContent>
      </Card>

      {state.equity !== 0.5 && <EquityBadge equity={state.equity} />}

      {state.lastVillainAction && (
        <p className="text-center text-sm text-muted-foreground">
          Villain: <span className="font-medium text-foreground">{state.lastVillainAction}</span>
        </p>
      )}

      <div className="flex justify-center gap-2">
        {(["preflop", "flop", "turn", "river"] as const).map((s) => (
          <div
            key={s}
            className={`h-1.5 w-12 rounded-full transition-colors ${
              ["preflop", "flop", "turn", "river"].indexOf(state.phase as string) >=
              ["preflop", "flop", "turn", "river"].indexOf(s)
                ? "bg-primary"
                : "bg-muted"
            }`}
          />
        ))}
      </div>

      {!isShowdown ? (
        <div className="space-y-3">
          {clockSettings.enabled && (
            <div className="flex justify-center">
              <DecisionClock
                seconds={clockSettings.seconds}
                onExpire={() => heroAct("fold")}
                resetKey={state.phase}
                disabled={false}
              />
            </div>
          )}
          <ActionPanel
            onAction={heroAct}
            currentBet={state.currentBet}
            pot={state.pot}
            heroStack={state.heroStack}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-lg font-bold">
                {state.winner === "hero"
                  ? "You win!"
                  : state.winner === "villain"
                  ? "Villain wins"
                  : "Chop!"}
              </p>
            </CardContent>
          </Card>

          {!analysis && !analyzing && (
            <Button onClick={handleShowdown} className="w-full">
              Get AI Analysis
            </Button>
          )}

          {analyzing && (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {analysis && <PostHandReport analysis={analysis} />}

          <Button variant="outline" onClick={handleReset} className="w-full">
            Play Another Hand
          </Button>
        </div>
      )}
    </div>
  );
}
