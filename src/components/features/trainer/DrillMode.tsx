"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { POSITIONS, Position, RangeAction, getHandFromCoords, getHandAction } from "@/data/ranges";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { saveQuizAttempt } from "@/app/actions/quiz";
import { cn } from "@/lib/utils";
import { Timer, CheckCircle2, XCircle, RotateCcw, Zap } from "lucide-react";

const DRILL_TOTAL = 30;
const DRILL_TIME_LIMIT = 90; // seconds

const POSITION_LABELS: Record<Position, string> = {
  UTG: "UTG", UTG1: "UTG+1", MP: "MP", HJ: "HJ", CO: "CO", BTN: "BTN", SB: "SB", BB: "BB",
};

const ACTIONS: { value: RangeAction; label: string; key: string; color: string }[] = [
  { value: "raise", label: "R", key: "R", color: "bg-green-700 hover:bg-green-600 text-white" },
  { value: "call", label: "C", key: "C", color: "bg-yellow-700 hover:bg-yellow-600 text-white" },
  { value: "fold", label: "F", key: "F", color: "bg-red-900 hover:bg-red-800 text-white" },
];

interface DrillHand {
  hand: string;
  position: Position;
  correctAction: RangeAction;
}

function generateDrillDeck(): DrillHand[] {
  const hands: DrillHand[] = [];
  const positions = Object.keys(POSITION_LABELS) as Position[];
  while (hands.length < DRILL_TOTAL) {
    const position = positions[Math.floor(Math.random() * positions.length)]!;
    const row = Math.floor(Math.random() * 13);
    const col = Math.floor(Math.random() * 13);
    const hand = getHandFromCoords(row, col);
    const correctAction = getHandAction(position, hand);
    hands.push({ hand, position, correctAction });
  }
  return hands;
}

interface PositionStat {
  correct: number;
  total: number;
}

export function DrillMode() {
  const [phase, setPhase] = useState<"idle" | "drilling" | "done">("idle");
  const [deck, setDeck] = useState<DrillHand[]>([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DRILL_TIME_LIMIT);
  const [posStats, setPosStats] = useState<Partial<Record<Position, PositionStat>>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const endDrill = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("done");
  }, []);

  const startDrill = useCallback(() => {
    setDeck(generateDrillDeck());
    setIndex(0);
    setCorrectCount(0);
    setTimeLeft(DRILL_TIME_LIMIT);
    setPosStats({});
    setFeedback(null);
    setPhase("drilling");
  }, []);

  useEffect(() => {
    if (phase !== "drilling") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { endDrill(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, endDrill]);

  const handleAnswer = useCallback(async (chosen: RangeAction) => {
    if (feedback !== null) return;
    const current = deck[index]!;
    const correct = chosen === current.correctAction || (current.correctAction === "mixed" && chosen === "raise");

    setFeedback(correct ? "correct" : "wrong");
    if (correct) setCorrectCount(c => c + 1);

    setPosStats(prev => {
      const stat = prev[current.position] ?? { correct: 0, total: 0 };
      return {
        ...prev,
        [current.position]: { correct: stat.correct + (correct ? 1 : 0), total: stat.total + 1 },
      };
    });

    saveQuizAttempt({ questionId: `${current.position}-${current.hand}`, category: "preflop_drill", correct });

    setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= DRILL_TOTAL) { endDrill(); }
      else { setIndex(i => i + 1); }
    }, 400);
  }, [deck, index, feedback, endDrill]);

  // Keyboard shortcuts
  useEffect(() => {
    if (phase !== "drilling") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key.toUpperCase() === "R") handleAnswer("raise");
      else if (e.key.toUpperCase() === "C") handleAnswer("call");
      else if (e.key.toUpperCase() === "F") handleAnswer("fold");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, handleAnswer]);

  if (phase === "idle") {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Speed Drill</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            30 hands · {DRILL_TIME_LIMIT}s · R/C/F keys or buttons
          </p>
        </div>
        <Button size="lg" onClick={startDrill} className="gap-2">
          <Zap className="h-4 w-4" /> Start drill
        </Button>
      </div>
    );
  }

  if (phase === "done") {
    const accuracy = Math.round((correctCount / DRILL_TOTAL) * 100);
    const handsAnswered = Object.values(posStats).reduce((s, p) => s + p!.total, 0);

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <p className={cn(
            "text-4xl font-bold",
            accuracy >= 80 ? "text-green-400" : accuracy >= 60 ? "text-yellow-400" : "text-red-400"
          )}>{accuracy}%</p>
          <p className="text-muted-foreground">{correctCount}/{handsAnswered} correct</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">By position</p>
          {(Object.entries(posStats) as [Position, PositionStat][])
            .sort((a, b) => b[1].total - a[1].total)
            .map(([pos, stat]) => {
              const pct = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={pos} className="flex items-center gap-3">
                  <span className="w-12 text-sm font-medium text-foreground">{POSITION_LABELS[pos]}</span>
                  <Progress value={pct} className="flex-1 h-2" />
                  <span className="w-10 text-right text-sm text-muted-foreground">{pct}%</span>
                </div>
              );
            })}
        </div>

        <Button onClick={startDrill} className="gap-2">
          <RotateCcw className="h-4 w-4" /> Drill again
        </Button>
      </motion.div>
    );
  }

  const current = deck[index]!;
  const timerPct = (timeLeft / DRILL_TIME_LIMIT) * 100;

  return (
    <div className="flex flex-col gap-4">
      {/* Timer + count */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span className={cn("font-mono font-medium", timeLeft <= 10 && "text-red-400")}>{timeLeft}s</span>
        </div>
        <span className="text-muted-foreground">{index + 1}/{DRILL_TOTAL}</span>
        <span className="font-medium text-foreground">{correctCount} ✓</span>
      </div>
      <Progress
        value={timerPct}
        className={cn("h-1", timeLeft <= 10 && "[&>div]:bg-red-500")}
      />

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "rounded-xl border p-6 text-center transition-colors",
            feedback === "correct" && "border-green-600 bg-green-700/10",
            feedback === "wrong" && "border-red-600 bg-red-700/10",
            feedback === null && "border-border bg-card"
          )}
        >
          <p className="text-sm text-muted-foreground">{POSITION_LABELS[current.position]}</p>
          <p className="mt-1 font-mono text-5xl font-bold text-foreground">{current.hand}</p>
          {feedback && (
            <div className="mt-2 flex justify-center">
              {feedback === "correct"
                ? <CheckCircle2 className="h-6 w-6 text-green-400" />
                : <XCircle className="h-6 w-6 text-red-400" />}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-3">
        {ACTIONS.map(({ value, label, key, color }) => (
          <Button
            key={value}
            size="lg"
            className={cn("h-16 flex-col gap-0.5 text-xl font-bold", color)}
            onClick={() => handleAnswer(value)}
            disabled={feedback !== null}
          >
            {label}
            <span className="text-xs font-normal opacity-60">[{key}]</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
