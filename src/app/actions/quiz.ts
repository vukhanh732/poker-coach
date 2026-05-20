"use server";

// RLS-enforced via SSR client (through ensureUser)
import { db } from "@/lib/db";
import { quizAttempts } from "@/lib/db/schema";
import { ensureUser } from "@/lib/ensure-user";

export async function saveQuizAttempt({
  questionId,
  category,
  correct,
  responseTimeMs,
}: {
  questionId: string;
  category: string;
  correct: boolean;
  responseTimeMs?: number;
}) {
  const userId = await ensureUser();
  if (!userId) return { error: "Unauthenticated" };

  await db.insert(quizAttempts).values({
    userId,
    questionId,
    category,
    correct,
    responseTimeMs: responseTimeMs ?? null,
  });

  return { success: true };
}
