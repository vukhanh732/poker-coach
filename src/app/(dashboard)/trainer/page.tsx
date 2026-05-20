"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { HandGrid } from "@/components/features/trainer/HandGrid";
import { QuizMode } from "@/components/features/trainer/QuizMode";
import { DrillMode } from "@/components/features/trainer/DrillMode";
import { POSITIONS, POSITION_LABELS, Position, RangeAction, getPositionStats, GameMode } from "@/data/ranges";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACTION_FILTER_LABELS: { value: RangeAction | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "raise", label: "Raise" },
  { value: "call", label: "Call" },
  { value: "mixed", label: "Mixed" },
  { value: "fold", label: "Fold" },
];

export default function TrainerPage() {
  const [position, setPosition] = useState<Position>("BTN");
  const [actionFilter, setActionFilter] = useState<RangeAction | "all">("all");
  const [gameMode, setGameMode] = useState<GameMode>("cash");

  const stats = getPositionStats(position);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Range Trainer</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">$1/$2 live cash · 9-handed · exploitative ranges</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            variant={gameMode === "cash" ? "default" : "outline"}
            onClick={() => setGameMode("cash")}
          >
            Cash
          </Button>
          <Button
            size="sm"
            variant={gameMode === "tournament" ? "default" : "outline"}
            onClick={() => setGameMode("tournament")}
          >
            Tourney
          </Button>
        </div>
      </div>

      <Tabs defaultValue="study">
        <TabsList className="mb-6 w-full">
          <TabsTrigger value="study" className="flex-1">Study</TabsTrigger>
          <TabsTrigger value="quiz" className="flex-1">Quiz</TabsTrigger>
          <TabsTrigger value="drill" className="flex-1">Drill</TabsTrigger>
        </TabsList>

        {/* ── Study mode ── */}
        <TabsContent value="study" className="space-y-5">
          {/* Position picker */}
          <div className="flex items-center gap-3">
            <Select value={position} onValueChange={v => setPosition(v as Position)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map(pos => (
                  <SelectItem key={pos} value={pos}>
                    {pos} — {POSITION_LABELS[pos]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-green-700/40 bg-green-700/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
              Raise {stats.raiseCount}
            </span>
            {stats.callCount > 0 && (
              <span className="rounded-full border border-yellow-700/40 bg-yellow-700/10 px-2.5 py-0.5 text-xs font-medium text-yellow-400">
                Call {stats.callCount}
              </span>
            )}
            {stats.mixedCount > 0 && (
              <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Mixed {stats.mixedCount}
              </span>
            )}
            <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              Fold {stats.foldCount}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              Open ~{stats.raisePercent}%
            </span>
          </div>

          {/* Action filter */}
          <div className="flex flex-wrap gap-1.5">
            {ACTION_FILTER_LABELS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActionFilter(value)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  actionFilter === value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <HandGrid
            position={position}
            highlightAction={actionFilter === "all" ? null : actionFilter}
          />
        </TabsContent>

        {/* ── Quiz mode ── */}
        <TabsContent value="quiz">
          <QuizMode totalQuestions={15} />
        </TabsContent>

        {/* ── Drill mode ── */}
        <TabsContent value="drill">
          <DrillMode />
        </TabsContent>
      </Tabs>
    </div>
  );
}
