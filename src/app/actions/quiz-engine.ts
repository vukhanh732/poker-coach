"use server";

// RLS-enforced via SSR client
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { quizAttempts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { questions, type Question } from "@/data/questions";
import { sm2, defaultSM2State, isLeech } from "@/lib/srs";
import type { InferSelectModel } from "drizzle-orm";
import { ensureUser } from "@/lib/ensure-user";

type QuizAttempt = InferSelectModel<typeof quizAttempts>;

export type QuestionWithSRS = Question & {
  srsState: {
    repetitions: number;
    easeFactor: number;
    interval: number;
    nextReviewAt: Date | null;
    attemptId: string | null;
    lapses: number;
    isLeech: boolean;
  };
};

export async function getDueQuestions(
  limit: number = 10
): Promise<Array<Question & { lapses: number; isLeech: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const now = new Date();

  const attempts = await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.userId, user.id));

  const attemptMap = new Map<string, QuizAttempt>();
  for (const attempt of attempts) {
    attemptMap.set(attempt.questionId, attempt);
  }

  const unseenQuestions: Array<Question & { lapses: number; isLeech: boolean }> = [];
  const dueQuestions: Array<{
    question: Question & { lapses: number; isLeech: boolean };
    nextReviewAt: Date;
  }> = [];

  for (const question of questions) {
    const attempt = attemptMap.get(question.id);
    const lapses = attempt?.lapses ?? 0;
    const enriched = { ...question, lapses, isLeech: isLeech(lapses) };

    if (!attempt) {
      unseenQuestions.push(enriched);
    } else {
      const nextReview = attempt.nextReviewAt ? new Date(attempt.nextReviewAt) : now;
      if (nextReview <= now) {
        dueQuestions.push({ question: enriched, nextReviewAt: nextReview });
      }
    }
  }

  dueQuestions.sort((a, b) => a.nextReviewAt.getTime() - b.nextReviewAt.getTime());

  const combined = [
    ...dueQuestions.map((d) => d.question),
    ...unseenQuestions,
  ];

  return combined.slice(0, limit);
}

export async function getQuestionsByCategory(
  category: Question["category"]
): Promise<Question[]> {
  return questions.filter((q) => q.category === category);
}

export async function submitAnswer(
  questionId: string,
  category: string,
  correct: boolean,
  responseTimeMs: number
): Promise<{ success: boolean; error?: string }> {
  const userId = await ensureUser();
  if (!userId) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const [existing] = await db
    .select()
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.userId, user.id),
        eq(quizAttempts.questionId, questionId)
      )
    )
    .limit(1);

  const currentState = existing
    ? {
        repetitions: existing.repetitions ?? 0,
        easeFactor: existing.easeFactor ?? 250,
        interval: existing.interval ?? 0,
        lapses: existing.lapses ?? 0,
      }
    : defaultSM2State();

  const updated = sm2(
    correct,
    currentState.repetitions,
    currentState.easeFactor,
    currentState.interval,
    currentState.lapses
  );

  try {
    if (existing) {
      await db
        .update(quizAttempts)
        .set({
          correct,
          responseTimeMs,
          repetitions: updated.repetitions,
          easeFactor: updated.easeFactor,
          interval: updated.interval,
          lapses: updated.lapses,
          nextReviewAt: updated.nextReviewAt,
        })
        .where(
          and(
            eq(quizAttempts.userId, user.id),
            eq(quizAttempts.questionId, questionId)
          )
        );
    } else {
      await db.insert(quizAttempts).values({
        userId: user.id,
        questionId,
        category,
        correct,
        responseTimeMs,
        repetitions: updated.repetitions,
        easeFactor: updated.easeFactor,
        interval: updated.interval,
        lapses: updated.lapses,
        nextReviewAt: updated.nextReviewAt,
      });
    }

    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: `Failed to save answer: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}
