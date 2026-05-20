"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VillainType } from "@/lib/poker/villain";
import type { GameType } from "@/hooks/useSimulation";

const VILLAIN_TYPES = [
  { type: VillainType.Nit, label: "Nit", desc: "Tight-passive, top 10% hands only" },
  { type: VillainType.TAG, label: "TAG", desc: "Tight-aggressive, solid fundamentals" },
  { type: VillainType.LAG, label: "LAG", desc: "Loose-aggressive, applies pressure" },
  { type: VillainType.Fish, label: "Fish", desc: "Loose-passive, calls too wide" },
];

type Props = {
  onStart: (villainType: VillainType, gameType: GameType) => void;
};

export function SimulationSetup({ onStart }: Props) {
  const [selectedVillain, setSelectedVillain] = useState<VillainType>(VillainType.TAG);
  const [gameType, setGameType] = useState<GameType>("hu");

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Me vs Machine</h2>
        <p className="mt-1 text-muted-foreground">Play a full hand and get AI coaching after showdown</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Game Type</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button
            variant={gameType === "hu" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setGameType("hu")}
          >
            Heads-Up
          </Button>
          <Button
            variant={gameType === "6max" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setGameType("6max")}
          >
            6-Max
          </Button>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Villain Type</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {VILLAIN_TYPES.map(({ type, label, desc }) => (
            <button
              key={type}
              onClick={() => setSelectedVillain(type)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                selectedVillain === type
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Button size="lg" className="w-full max-w-md" onClick={() => onStart(selectedVillain, gameType)}>
        Deal Cards
      </Button>
    </div>
  );
}
