"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SCENARIOS, type Scenario } from "@/data/scenarios";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EquityBar } from "./EquityBar";
import { saveQuizAttempt } from "@/app/actions/quiz";
import { calcPotOdds, calcEquityByOuts } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";

type Phase = "question" | "result" | "summary";

interface Result {
  scenario: Scenario;
  chosen: "call" | "fold";
  correct: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function ScenarioQuiz() {
  const [phase, setPhase] = useState<Phase>("question");
  const [deck, setDeck] = useState<Scenario[]>(() => shuffle(SCENARIOS));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [lastResult, setLastResult] = useState<Result | null>(null);

  const current = deck[index]!;
  const total = deck.length;
  const potOdds = calcPotOdds(current.pot, current.bet);
  const equity = calcEquityByOuts(current.outs, current.cardsTocome);

  const handleAnswer = useCallback(async (chosen: "call" | "fold") => {
    const correct = chosen === current.correctAction;
    const result: Result = { scenario: current, chosen, correct };
    setLastResult(result);
    setResults(prev => [...prev, result]);
    setPhase("result");

    await saveQuizAttempt({
      questionId: `scenario-${current.id}`,
      category: "pot_odds",
      correct,
    });
  }, [current]);

  const handleNext = useCallback(() => {
    if (index + 1 >= total) { setPhase("summary"); return; }
    setIndex(i => i + 1);
    setPhase("question");
  }, [index, total]);

  const handleRestart = useCallback(() => {
    setDeck(shuffle(SCENARIOS));
    setIndex(0);
    setResults([]);
    setLastResult(null);
    setPhase("question");
  }, []);

  if (phase === "summary") {
    const correct = results.filter(r => r.correct).length;
    const accuracy = Math.round((correct / results.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 py-4 text-center"
      >
        <p className={cn(
          "text-4xl font-bold",
          accuracy >= 80 ? "text-green-400" : accuracy >= 60 ? "text-yellow-400" : "text-red-400"
        )}>{accuracy}%</p>
        <p className="text-muted-foreground">{correct}/{results.length} correct</p>
        <div className="w-full space-y-2">
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm text-left">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{r.scenario.title}</p>
                <p className="text-xs text-muted-foreground">
                  Correct: <span className="capitalize">{r.scenario.correctAction}</span>
                </p>
              </div>
              {r.correct
                ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
                : <XCircle className="h-4 w-4 shrink-0 text-red-400" />}
            </div>
          ))}
        </div>
        <Button onClick={handleRestart} className="gap-2 w-full">
          <RotateCcw className="h-4 w-4" /> Play again
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Scenario {index + 1} of {total}</span>
          <span>{results.filter(r => r.correct).length} correct</span>
        </div>
        <Progress value={(index / total) * 100} className="h-1.5" />
      </div>

      <AnimatePresence mode="wait">
        {phase === "question" && (
          <motion.div
            key={`q-${current.id}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="font-semibold text-foreground">{current.title}</p>
              <p className="text-sm text-muted-foreground">{current.description}</p>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-muted p-2">
                  <p className="font-bold text-foreground">${current.pot}</p>
                  <p className="text-xs text-muted-foreground">Pot</p>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <p className="font-bold text-foreground">${current.bet}</p>
                  <p className="text-xs text-muted-foreground">Bet</p>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <p className="font-bold text-foreground">{current.outs}</p>
                  <p className="text-xs text-muted-foreground">Outs</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 h-14 bg-green-700 hover:bg-green-600 text-white text-base font-semibold"
                onClick={() => handleAnswer("call")}
              >
                Call
              </Button>
              <Button
                size="lg"
                className="flex-1 h-14 bg-red-900 hover:bg-red-800 text-white text-base font-semibold"
                onClick={() => handleAnswer("fold")}
              >
                Fold
              </Button>
            </div>
          </motion.div>
        )}

        {phase === "result" && lastResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className={cn(
              "flex items-center gap-3 rounded-xl border p-4",
              lastResult.correct ? "border-green-700/40 bg-green-700/10" : "border-red-700/40 bg-red-700/10"
            )}>
              {lastResult.correct
                ? <CheckCircle2 className="h-6 w-6 shrink-0 text-green-400" />
                : <XCircle className="h-6 w-6 shrink-0 text-red-400" />}
              <p className={cn("font-semibold", lastResult.correct ? "text-green-400" : "text-red-400")}>
                {lastResult.correct ? "Correct!" : `Should ${lastResult.scenario.correctAction}`}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <EquityBar equity={equity} required={potOdds} />
              <p className="text-sm text-muted-foreground">{current.explanation}</p>
            </div>

            <Button size="lg" className="w-full gap-2" onClick={handleNext}>
              {index + 1 >= total ? "See results" : "Next scenario"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
