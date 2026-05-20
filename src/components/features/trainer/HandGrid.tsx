"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RANKS,
  POSITIONS,
  Position,
  RangeAction,
  getHandFromCoords,
  getHandAction,
} from "@/data/ranges";
import { getHandExplanation } from "@/data/range-explanations";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { HandCell } from "@/components/trainer/HandCell";

const ACTION_BADGE: Record<RangeAction, "raise" | "call" | "fold" | "outline"> = {
  raise: "raise",
  call: "call",
  fold: "fold",
  mixed: "outline",
};

interface HandGridProps {
  position: Position;
  highlightAction?: RangeAction | null;
}

export function HandGrid({ position, highlightAction }: HandGridProps) {
  const [selected, setSelected] = useState<{
    hand: string;
    action: RangeAction;
    row: number;
    col: number;
  } | null>(null);

  const explanation = selected
    ? getHandExplanation(position, selected.hand, selected.action)
    : null;

  return (
    <div className="w-full">
      {/* Grid */}
      <div className="overflow-x-auto">
        <div
          className="grid gap-0.5"
          style={{
            gridTemplateColumns: `repeat(13, minmax(0, 1fr))`,
            minWidth: 300,
          }}
        >
          {RANKS.map((_, row) =>
            RANKS.map((_, col) => {
              const hand = getHandFromCoords(row, col);
              const action = getHandAction(position, hand);
              const isSelected =
                selected?.row === row && selected?.col === col;
              const dimmed =
                highlightAction != null && action !== highlightAction;

              return (
                <HandCell
                  key={`${row}-${col}`}
                  hand={hand}
                  action={action}
                  selected={isSelected}
                  dimmed={dimmed}
                  onClick={() =>
                    setSelected(isSelected ? null : { hand, action, row, col })
                  }
                />
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-2">
        {(["raise", "call", "mixed", "fold"] as RangeAction[]).map((a) => (
          <span key={a} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="h-3 w-3 rounded-sm"
              style={{
                background:
                  a === "raise" ? "var(--color-felt-spec-700)" :
                  a === "call"  ? "var(--color-gold-spec-500)" :
                  a === "mixed" ? "linear-gradient(135deg, var(--color-action-mixed-a) 50%, var(--color-action-mixed-b) 50%)" :
                  "var(--color-action-fold)",
              }}
            />
            {a.charAt(0).toUpperCase() + a.slice(1)}
          </span>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && explanation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="mt-4 rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-foreground">
                  {selected.hand}
                </span>
                <Badge variant={ACTION_BADGE[selected.action]}>
                  {explanation.action.toUpperCase()}
                </Badge>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Sizing: </span>
              {explanation.sizing}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Why: </span>
              {explanation.why}
            </p>

            {explanation.mistakes.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-destructive">
                  Common mistakes:
                </p>
                <ul className="mt-1 space-y-0.5">
                  {explanation.mistakes.map((m) => (
                    <li key={m} className="text-xs text-muted-foreground">
                      • {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
