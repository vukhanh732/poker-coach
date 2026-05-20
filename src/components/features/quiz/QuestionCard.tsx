"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Question } from "@/data/questions";
import { CheckCircle2, XCircle, Clock, ChevronRight } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  onAnswer: (correct: boolean, timeMs: number) => void;
}

const CATEGORY_LABELS: Record<Question["category"], string> = {
  preflop: "Preflop",
  pot_odds: "Pot Odds",
  board_texture: "Board Texture",
  bet_sizing: "Bet Sizing",
  exploits: "Exploits",
  river: "River",
};

const DIFFICULTY_COLORS: Record<Question["difficulty"], string> = {
  beginner: "bg-green-500/15 text-green-700 border-green-500/30",
  intermediate: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  advanced: "bg-red-500/15 text-red-700 border-red-500/30",
};

export function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset state when question changes
  useEffect(() => {
    setSelectedIndex(null);
    setAnswered(false);
    setElapsedMs(0);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [question.id]);

  function handleSelect(index: number) {
    if (answered) return;

    const responseTimeMs = Date.now() - startTimeRef.current;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setSelectedIndex(index);
    setAnswered(true);
    setElapsedMs(responseTimeMs);

    const correct = index === question.correctIndex;
    onAnswer(correct, responseTimeMs);
  }

  function getOptionClassName(index: number): string {
    const base =
      "w-full justify-start text-left h-auto py-3 px-4 rounded-lg border text-sm font-normal whitespace-normal";

    if (!answered) {
      return cn(base, "border-border bg-card hover:bg-muted hover:border-primary/30 transition-colors");
    }

    if (index === question.correctIndex) {
      return cn(base, "border-green-500 bg-green-500/10 text-green-800");
    }

    if (index === selectedIndex && selectedIndex !== question.correctIndex) {
      return cn(base, "border-red-500 bg-red-500/10 text-red-800");
    }

    return cn(base, "border-border bg-card opacity-50");
  }

  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  // Timer progress: 0–60 seconds mapped to 0–100%
  const timerProgress = Math.min((elapsedMs / 60000) * 100, 100);
  const isCorrect = answered && selectedIndex === question.correctIndex;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* Timer bar */}
      <div className="space-y-1">
        <Progress
          value={answered ? 0 : timerProgress}
          className="h-1"
        />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{elapsedSeconds}s</span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-xs">
          {CATEGORY_LABELS[question.category]}
        </Badge>
        <Badge
          variant="outline"
          className={cn("text-xs border", DIFFICULTY_COLORS[question.difficulty])}
        >
          {question.difficulty}
        </Badge>
      </div>

      {/* Question */}
      <p className="text-base font-semibold leading-relaxed">{question.question}</p>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            disabled={answered}
            className={getOptionClassName(index)}
          >
            <span className="flex items-start gap-3 w-full">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-semibold mt-0.5">
                {answered && index === question.correctIndex ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : answered && index === selectedIndex && !isCorrect ? (
                  <XCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <span>{String.fromCharCode(65 + index)}</span>
                )}
              </span>
              <span className="flex-1">{option}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Explanation + Next button */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "rounded-lg border p-4 space-y-3",
                isCorrect
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-red-500/30 bg-red-500/5"
              )}
            >
              <div className="flex items-center gap-2 font-semibold text-sm">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-green-700">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-700">Incorrect</span>
                  </>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {(elapsedMs / 1000).toFixed(1)}s
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {question.explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
