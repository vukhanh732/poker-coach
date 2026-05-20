"use client";

import { useEffect } from "react";
import { useSolver } from "@/hooks/useSolver";
import { GTOFrequencyBar } from "@/components/trainer/GTOFrequencyBar";
import { Skeleton } from "@/components/ui/skeleton";

interface SolverPanelProps {
  heroCards: string[];
  board: string[];
  pot: number;
  effectiveStack: number;
  /** Trigger a new solve when this key changes */
  solveKey?: string | number;
}

export function SolverPanel({
  heroCards,
  board,
  pot,
  effectiveStack,
  solveKey,
}: SolverPanelProps) {
  const { state, solve, reset } = useSolver();

  useEffect(() => {
    if (board.length < 3) { reset(); return; }
    solve({ heroCards, villainRange: "random", board, pot, effectiveStack });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solveKey]);

  if (board.length < 3) return null;

  if (state.status === "idle") return null;

  if (state.status === "loading" || state.status === "solving") {
    return (
      <div className="space-y-2 rounded-lg border border-border bg-card p-3">
        <p className="text-xs text-muted-foreground">Solving…</p>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (state.status === "unavailable" || state.status === "error") {
    return (
      <div className="rounded-lg border border-border bg-card/50 px-3 py-2">
        <p className="text-xs text-muted-foreground">
          🔬 Postflop solver coming soon (Phase 7)
        </p>
      </div>
    );
  }

  if (state.status === "done" && state.result) {
    const { strategy, equity, ev } = state.result;
    const raise = strategy["raise"] ?? 0;
    const call = strategy["call"] ?? 0;
    const fold = strategy["fold"] ?? 0;

    return (
      <div className="rounded-lg border border-border bg-card p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium">GTO Strategy</p>
          <span className="text-xs font-mono text-muted-foreground">
            EV {ev >= 0 ? "+" : ""}{ev.toFixed(2)}bb · eq {Math.round(equity * 100)}%
          </span>
        </div>
        <GTOFrequencyBar raise={raise} call={call} fold={fold} height={20} />
        <div className="flex gap-3 text-xs text-muted-foreground">
          {raise > 0 && <span>Raise {Math.round(raise * 100)}%</span>}
          {call > 0 && <span>Call {Math.round(call * 100)}%</span>}
          {fold > 0 && <span>Fold {Math.round(fold * 100)}%</span>}
        </div>
      </div>
    );
  }

  return null;
}
