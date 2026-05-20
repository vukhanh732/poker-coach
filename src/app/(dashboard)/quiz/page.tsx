"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestionCard } from "@/components/features/quiz/QuestionCard";
import {
  getDueQuestions,
  getQuestionsByCategory,
  submitAnswer,
} from "@/app/actions/quiz-engine";
import { questions, type Question } from "@/data/questions";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Flame,
  RefreshCw,
  CheckCircle2,
  XCircle,
  BookOpen,
  Zap,
} from "lucide-react";

type Category = Question["category"];

const CATEGORY_LABELS: Record<Category, string> = {
  preflop: "Preflop",
  pot_odds: "Pot Odds",
  board_texture: "Board Texture",
  bet_sizing: "Bet Sizing",
  exploits: "Exploits",
  river: "River",
};

const ALL_CATEGORIES: Category[] = [
  "preflop",
  "pot_odds",
  "board_texture",
  "bet_sizing",
  "exploits",
  "river",
];

interface SessionAnswer {
  questionId: string;
  correct: boolean;
  timeMs: number;
}

// ─── Daily Quiz ───────────────────────────────────────────────────────────────

function DailyQuiz() {
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [pendingNext, setPendingNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    const due = await getDueQuestions(10);
    setSessionQuestions(due);
    setCurrentIndex(0);
    setAnswers([]);
    setPendingNext(false);
    setSessionComplete(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  async function handleAnswer(correct: boolean, timeMs: number) {
    const question = sessionQuestions[currentIndex];
    if (!question) return;

    const answer: SessionAnswer = { questionId: question.id, correct, timeMs };
    setAnswers((prev) => [...prev, answer]);
    setPendingNext(true);

    // Submit to server in background
    submitAnswer(question.id, question.category, correct, timeMs).catch(console.error);
  }

  function handleNext() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= sessionQuestions.length) {
      setSessionComplete(true);
    } else {
      setCurrentIndex(nextIndex);
      setPendingNext(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-20 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (sessionQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <Trophy className="h-12 w-12 text-yellow-500" />
        <div>
          <p className="font-semibold text-lg">All caught up!</p>
          <p className="text-sm text-muted-foreground mt-1">
            No questions are due right now. Check back later or explore all topics.
          </p>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    const correctCount = answers.filter((a) => a.correct).length;
    const totalCount = answers.length;
    const pct = Math.round((correctCount / totalCount) * 100);
    const avgTimeMs =
      answers.reduce((sum, a) => sum + a.timeMs, 0) / answers.length;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col items-center gap-6 py-8 text-center"
      >
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-4xl font-bold text-primary">
            {pct}%
          </div>
        </div>

        <div>
          <p className="text-xl font-bold">Session Complete!</p>
          <p className="text-muted-foreground mt-1">
            {correctCount} of {totalCount} correct
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
          <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{correctCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Correct</p>
          </div>
          <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-red-600">
              {totalCount - correctCount}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Wrong</p>
          </div>
          <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-2xl font-bold">{(avgTimeMs / 1000).toFixed(1)}s</p>
            <p className="text-xs text-muted-foreground mt-0.5">Avg Time</p>
          </div>
        </div>

        <Button onClick={loadQuestions} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          New Session
        </Button>
      </motion.div>
    );
  }

  const currentQuestion = sessionQuestions[currentIndex];
  const progress = ((currentIndex) / sessionQuestions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {currentIndex + 1} of {sessionQuestions.length}
          </span>
          <span className="text-muted-foreground">
            {answers.filter((a) => a.correct).length} correct
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            onAnswer={handleAnswer}
          />
        )}
      </AnimatePresence>

      {/* Next button */}
      <AnimatePresence>
        {pendingNext && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <Button onClick={handleNext} className="w-full gap-2">
              {currentIndex + 1 >= sessionQuestions.length ? (
                <>
                  <Trophy className="h-4 w-4" />
                  View Results
                </>
              ) : (
                <>
                  Next Question
                  <span className="text-xs opacity-70">
                    {currentIndex + 1}/{sessionQuestions.length}
                  </span>
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── All Topics ───────────────────────────────────────────────────────────────

function AllTopics() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("preflop");
  const [categoryQuestions, setCategoryQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [pendingNext, setPendingNext] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadCategory = useCallback(async (category: Category) => {
    setLoading(true);
    const qs = await getQuestionsByCategory(category);
    setCategoryQuestions(qs);
    setCurrentIndex(0);
    setAnswers([]);
    setPendingNext(false);
    setSessionComplete(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCategory(selectedCategory);
  }, [selectedCategory, loadCategory]);

  function handleCategorySelect(category: Category) {
    setSelectedCategory(category);
  }

  async function handleAnswer(correct: boolean, timeMs: number) {
    const question = categoryQuestions[currentIndex];
    if (!question) return;

    const answer: SessionAnswer = { questionId: question.id, correct, timeMs };
    setAnswers((prev) => [...prev, answer]);
    setPendingNext(true);

    submitAnswer(question.id, question.category, correct, timeMs).catch(console.error);
  }

  function handleNext() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= categoryQuestions.length) {
      setSessionComplete(true);
    } else {
      setCurrentIndex(nextIndex);
      setPendingNext(false);
    }
  }

  const categoryCounts: Record<Category, number> = {} as Record<Category, number>;
  for (const cat of ALL_CATEGORIES) {
    categoryCounts[cat] = questions.filter((q) => q.category === cat).length;
  }

  return (
    <div className="space-y-6">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategorySelect(cat)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
              selectedCategory === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            {CATEGORY_LABELS[cat]}
            <span className="text-xs opacity-70">({categoryCounts[cat]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-20 w-full" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : sessionComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 py-8 text-center"
        >
          <Trophy className="h-12 w-12 text-yellow-500" />
          <div>
            <p className="text-xl font-bold">
              {answers.filter((a) => a.correct).length}/{answers.length} Correct
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {CATEGORY_LABELS[selectedCategory]} complete
            </p>
          </div>
          <Button
            onClick={() => loadCategory(selectedCategory)}
            className="gap-2"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4" />
            Restart Category
          </Button>
        </motion.div>
      ) : categoryQuestions.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No questions available for this category.
        </p>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {currentIndex + 1} of {categoryQuestions.length}
            </span>
            <Progress
              value={((currentIndex) / categoryQuestions.length) * 100}
              className="h-1.5 w-32"
            />
          </div>

          <AnimatePresence mode="wait">
            {categoryQuestions[currentIndex] && (
              <QuestionCard
                key={categoryQuestions[currentIndex].id}
                question={categoryQuestions[currentIndex]}
                onAnswer={handleAnswer}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {pendingNext && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
              >
                <Button onClick={handleNext} className="w-full gap-2">
                  {currentIndex + 1 >= categoryQuestions.length ? (
                    <>
                      <Trophy className="h-4 w-4" />
                      View Results
                    </>
                  ) : (
                    "Next Question"
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuizPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Engine</h1>
          <p className="text-muted-foreground mt-1">
            Sharpen your $1/$2 live cash fundamentals
          </p>
        </div>
        <Badge className="gap-1.5 bg-orange-500/15 text-orange-700 border border-orange-500/30 shrink-0">
          <Flame className="h-3.5 w-3.5" />
          Daily Challenge
        </Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Total Q's</p>
              <p className="font-semibold">{questions.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Categories</p>
              <p className="font-semibold">6</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Algorithm</p>
              <p className="font-semibold">SM-2</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily">Daily Quiz</TabsTrigger>
          <TabsTrigger value="topics">All Topics</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <DailyQuiz />
        </TabsContent>

        <TabsContent value="topics">
          <AllTopics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
