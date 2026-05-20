"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RANKS, POSITIONS, Position, RangeAction, getHandFromCoords, getHandAction } from "@/data/ranges";
import { getHandExplanation } from "@/data/range-explanations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { saveQuizAttempt } from "@/app/actions/quiz";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";

type QuizState = "question" | "result" | "summary";

interface QuizQuestion {
  hand: string;
  position: Position;
  correctAction: RangeAction;
  startedAt: number;
}

interface QuizResult {
  question: QuizQuestion;
  chosen: RangeAction;
  correct: boolean;
  timeMs: number;
}

const ACTIONS: { value: RangeAction; label: string; color: string }[] = [
  { value: "raise", label: "Raise", color: "bg-green-700 hover:bg-green-600 text-white" },
  { value: "call", label: "Call / Limp", color: "bg-yellow-700 hover:bg-yellow-600 text-white" },
  { value: "fold", label: "Fold", color: "bg-red-900 hover:bg-red-800 text-white" },
];

const POSITION_LABELS: Record<Position, string> = {
  UTG: "UTG", UTG1: "UTG+1", MP: "MP", HJ: "HJ", CO: "CO", BTN: "BTN", SB: "SB", BB: "BB",
};

function randomQuestion(positionFilter?: Position): QuizQuestion {
  const positions = (positionFilter ? [positionFilter] : Object.keys(POSITION_LABELS)) as Position[];
  const position = positions[Math.floor(Math.random() * positions.length)]!;
  const row = Math.floor(Math.random() * 13);
  const col = Math.floor(Math.random() * 13);
  const hand = getHandFromCoords(row, col);
  const correctAction = getHandAction(position, hand);
  return { hand, position, correctAction, startedAt: Date.now() };
}

interface QuizModeProps {
  positionFilter?: Position;
  totalQuestions?: number;
}

export function QuizMode({ positionFilter, totalQuestions = 15 }: QuizModeProps) {
  const [state, setState] = useState<QuizState>("question");
  const [current, setCurrent] = useState<QuizQuestion>(() => randomQuestion(positionFilter));
  const [results, setResults] = useState<QuizResult[]>([]);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);

  const questionNumber = results.length + 1;
  const isLast = results.length === totalQuestions - 1 && state === "result";

  const handleAnswer = useCallback(async (chosen: RangeAction) => {
    const timeMs = Date.now() - current.startedAt;
    const correct = chosen === current.correctAction || (current.correctAction === "mixed" && chosen === "raise");
    const result: QuizResult = { question: current, chosen, correct, timeMs };
    setLastResult(result);
    setResults(prev => [...prev, result]);
    setState("result");

    await saveQuizAttempt({
      questionId: `${current.position}-${current.hand}`,
      category: "preflop",
      correct,
      responseTimeMs: timeMs,
    });
  }, [current]);

  const handleNext = useCallback(() => {
    if (results.length >= totalQuestions) {
      setState("summary");
      return;
    }
    setCurrent(randomQuestion(positionFilter));
    setState("question");
  }, [results.length, totalQuestions, positionFilter]);

  const handleRestart = useCallback(() => {
    setResults([]);
    setLastResult(null);
    setCurrent(randomQuestion(positionFilter));
    setState("question");
  }, [positionFilter]);

  if (state === "summary") {
    const correct = results.filter(r => r.correct).length;
    const accuracy = Math.round((correct / results.length) * 100);
    const avgTime = Math.round(results.reduce((s, r) => s + r.timeMs, 0) / results.length / 100) / 10;

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 py-8 text-center"
      >
        <div className={cn(
          "flex h-20 w-20 items-center justify-center rounded-full text-4xl",
          accuracy >= 80 ? "bg-green-700/20 text-green-400" : accuracy >= 60 ? "bg-yellow-700/20 text-yellow-400" : "bg-red-900/20 text-red-400"
        )}>
          {accuracy >= 80 ? "🏆" : accuracy >= 60 ? "📈" : "🎯"}
        </div>
        <div>
          <p className="text-3xl font-bold text-foreground">{accuracy}%</p>
          <p className="text-muted-foreground">{correct}/{results.length} correct · avg {avgTime}s</p>
        </div>
        <div className="w-full max-w-sm space-y-2">
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <span className="font-mono font-medium">{r.question.hand}</span>
              <span className="text-muted-foreground">{POSITION_LABELS[r.question.position]}</span>
              {r.correct
                ? <CheckCircle2 className="h-4 w-4 text-green-400" />
                : <XCircle className="h-4 w-4 text-red-400" />}
            </div>
          ))}
        </div>
        <Button onClick={handleRestart} className="gap-2">
          <RotateCcw className="h-4 w-4" /> Play again
        </Button>
      </motion.div>
    );
  }

  const explanation = state === "result" && lastResult
    ? getHandExplanation(lastResult.question.position, lastResult.question.hand, lastResult.question.correctAction)
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Question {Math.min(questionNumber, totalQuestions)} of {totalQuestions}</span>
          <span>{results.filter(r => r.correct).length} correct</span>
        </div>
        <Progress value={(results.length / totalQuestions) * 100} className="h-1.5" />
      </div>

      <AnimatePresence mode="wait">
        {state === "question" && (
          <motion.div
            key={`q-${current.hand}-${current.position}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="mb-1 text-sm text-muted-foreground">Position: <span className="font-medium text-foreground">{POSITION_LABELS[current.position]}</span></p>
              <p className="font-mono text-5xl font-bold tracking-tight text-foreground">{current.hand}</p>
              <p className="mt-2 text-sm text-muted-foreground">9-handed · $1/$2 live · No previous action</p>
            </div>
            <div className="flex flex-col gap-3">
              {ACTIONS.map(({ value, label, color }) => (
                <Button
                  key={value}
                  size="lg"
                  className={cn("h-14 text-base font-semibold", color)}
                  onClick={() => handleAnswer(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {state === "result" && lastResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            <div className={cn(
              "flex items-center gap-3 rounded-xl border p-4",
              lastResult.correct ? "border-green-700/40 bg-green-700/10" : "border-red-700/40 bg-red-700/10"
            )}>
              {lastResult.correct
                ? <CheckCircle2 className="h-6 w-6 shrink-0 text-green-400" />
                : <XCircle className="h-6 w-6 shrink-0 text-red-400" />}
              <div>
                <p className={cn("font-semibold", lastResult.correct ? "text-green-400" : "text-red-400")}>
                  {lastResult.correct ? "Correct!" : "Incorrect"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {!lastResult.correct && <>Correct action: <span className="font-medium text-foreground capitalize">{lastResult.question.correctAction}</span> · </>}
                  You chose: <span className="font-medium text-foreground capitalize">{lastResult.chosen}</span>
                </p>
              </div>
            </div>

            {explanation && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold">{lastResult.question.hand}</span>
                  <Badge variant={lastResult.question.correctAction === "raise" ? "raise" : lastResult.question.correctAction === "call" ? "call" : "fold"}>
                    {lastResult.question.correctAction.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Sizing: </span>{explanation.sizing}</p>
                <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Why: </span>{explanation.why}</p>
              </div>
            )}

            <Button size="lg" className="gap-2" onClick={handleNext}>
              {isLast ? "See results" : "Next hand"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
