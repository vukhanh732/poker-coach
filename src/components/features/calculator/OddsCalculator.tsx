"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EquityBar } from "./EquityBar";
import { calcPotOdds, calcEquityByOuts } from "@/lib/utils";
import { cn } from "@/lib/utils";

const COMMON_DRAWS = [
  { label: "Flush draw", outs: 9 },
  { label: "OESD", outs: 8 },
  { label: "Double belly buster", outs: 8 },
  { label: "Combo draw (fd+sd)", outs: 15 },
  { label: "Gutshot", outs: 4 },
  { label: "Overcards", outs: 6 },
  { label: "Set → full house", outs: 10 },
  { label: "Two pair → full house", outs: 4 },
] as const;

export function OddsCalculator() {
  const [pot, setPot] = useState("");
  const [bet, setBet] = useState("");
  const [outs, setOuts] = useState("");
  const [cards, setCards] = useState<1 | 2>(2);

  const potNum = parseFloat(pot) || 0;
  const betNum = parseFloat(bet) || 0;
  const outsNum = parseInt(outs) || 0;

  const potOdds = potNum > 0 && betNum > 0 ? calcPotOdds(potNum, betNum) : null;
  const equity = outsNum > 0 ? calcEquityByOuts(outsNum, cards) : null;

  function reset() {
    setPot(""); setBet(""); setOuts("");
  }

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="pot">Pot size ($)</Label>
          <Input
            id="pot"
            type="number"
            min={0}
            placeholder="e.g. 45"
            value={pot}
            onChange={e => setPot(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bet">Villain&apos;s bet ($)</Label>
          <Input
            id="bet"
            type="number"
            min={0}
            placeholder="e.g. 30"
            value={bet}
            onChange={e => setBet(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="outs">Your outs</Label>
          <Input
            id="outs"
            type="number"
            min={0}
            max={20}
            placeholder="e.g. 9"
            value={outs}
            onChange={e => setOuts(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Cards to come</Label>
          <div className="flex gap-2">
            {([2, 1] as const).map(n => (
              <button
                key={n}
                onClick={() => setCards(n)}
                className={cn(
                  "flex-1 rounded-md border py-2 text-sm font-medium transition-colors",
                  cards === n
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-accent"
                )}
              >
                {n} card{n === 2 ? "s" : ""}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick-fill draw presets */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Quick fill — common draws</p>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_DRAWS.map(({ label, outs: o }) => (
            <button
              key={label}
              onClick={() => setOuts(String(o))}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                outsNum === o
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {label} ({o})
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {potOdds !== null && equity !== null && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-4">
          <EquityBar equity={equity} required={potOdds} />

          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{equity}%</p>
              <p className="text-xs text-muted-foreground">Your equity</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{potOdds.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Pot odds needed</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {outsNum} × {cards === 2 ? 4 : 2}
              </p>
              <p className="text-xs text-muted-foreground">Rule of {cards === 2 ? 4 : 2}</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Pot odds: </span>
            call ${betNum} to win ${(potNum + betNum).toFixed(0)} total
            ({potNum.toFixed(0)} + {betNum.toFixed(0)}) = {potOdds.toFixed(1)}% of final pot
          </div>
        </div>
      )}

      {(pot || bet || outs) && (
        <Button variant="outline" size="sm" onClick={reset} className="w-full">
          Clear
        </Button>
      )}

      {/* Rule explainer */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Rule of 2 &amp; 4</p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p><span className="font-medium text-foreground">2 cards to come (flop):</span> outs × 4 ≈ equity %</p>
          <p><span className="font-medium text-foreground">1 card to come (turn):</span> outs × 2 ≈ equity %</p>
          <p className="text-xs">Slightly overestimates at high out counts. For 15+ outs subtract 1% per out above 8.</p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground pt-1">
          {COMMON_DRAWS.map(({ label, outs: o }) => (
            <span key={label}>{label}: ~{o * 4}% / ~{o * 2}%</span>
          ))}
        </div>
      </div>
    </div>
  );
}
