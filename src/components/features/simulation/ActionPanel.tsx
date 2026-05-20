"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type Props = {
  onAction: (action: "fold" | "call" | "raise", raiseBB?: number) => void;
  currentBet: number;
  pot: number;
  heroStack: number;
  disabled?: boolean;
};

export function ActionPanel({ onAction, currentBet, heroStack, disabled }: Props) {
  const [raiseBB, setRaiseBB] = useState(3);
  const callAmount = Math.min(currentBet, heroStack);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-16">Raise to:</span>
        <Slider
          min={2}
          max={20}
          step={1}
          value={[raiseBB]}
          onValueChange={([v]) => setRaiseBB(v ?? 3)}
          className="flex-1"
          disabled={disabled}
        />
        <span className="text-xs font-mono w-12 text-right">${(raiseBB * 2).toFixed(0)}</span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => onAction("fold")}
          disabled={disabled}
        >
          Fold
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onAction("call")}
          disabled={disabled}
        >
          Call ${(callAmount / 100).toFixed(0)}
        </Button>
        <Button
          className="flex-1"
          onClick={() => onAction("raise", raiseBB)}
          disabled={disabled}
        >
          Raise ${(raiseBB * 2).toFixed(0)}
        </Button>
      </div>
    </div>
  );
}
