"use server";

// RLS-enforced via SSR client
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/ensure-user";
import { analyzerLimiter, checkRateLimit } from "@/lib/ratelimit";
import { analyzedHands } from "@/lib/db/schema";
import { analyzeHand, type AnalysisJson } from "@/lib/claude";
import { desc, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

type AnalyzedHand = InferSelectModel<typeof analyzedHands>;

export async function analyzeHandAction(
  rawHand: string
): Promise<{ success: true; id: string; analysis: AnalysisJson } | { error: string }> {
  const userId = await ensureUser();
  if (!userId) return { error: "You must be logged in to analyze hands." };

  const { limited, resetAt } = await checkRateLimit(analyzerLimiter, userId);
  if (limited) {
    const resetMsg = resetAt ? ` Try again after ${resetAt.toLocaleTimeString()}.` : "";
    return { error: `Analysis limit reached (10/hour).${resetMsg}` };
  }

  if (!rawHand || rawHand.trim().length === 0) {
    return { error: "Hand history cannot be empty." };
  }

  if (rawHand.length > 5000) {
    return { error: "Hand history is too long. Please limit to 5000 characters." };
  }

  let analysis: AnalysisJson;
  try {
    analysis = await analyzeHand(rawHand);
  } catch (e) {
    return { error: `Analysis failed: ${e instanceof Error ? e.message : String(e)}` };
  }

  try {
    const [inserted] = await db
      .insert(analyzedHands)
      .values({
        userId,
        rawHand: rawHand.trim(),
        analysisJson: analysis,
        tags: [],
      })
      .returning({ id: analyzedHands.id });

    if (!inserted) return { error: "Insert returned no row" };
    return { success: true, id: inserted.id, analysis };
  } catch (e) {
    return { error: `Failed to save analysis: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function getAnalyzedHands(): Promise<AnalyzedHand[]> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  const hands = await db
    .select()
    .from(analyzedHands)
    .where(eq(analyzedHands.userId, user.id))
    .orderBy(desc(analyzedHands.createdAt))
    .limit(20);

  return hands;
}
