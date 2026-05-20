"use server";

// RLS-enforced via SSR client
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { handLogs } from "@/lib/db/schema";
import { handLogSchema, type HandLogFormValues } from "@/lib/validators/hand-log";
import { dollarsToCents } from "@/lib/utils";
import { eq, desc, and, sql } from "drizzle-orm";
import type { GameType } from "@/lib/db/schema";
import { ensureUser } from "@/lib/ensure-user";

export async function createHandLog(
  data: HandLogFormValues
): Promise<{ success: true; id: string } | { error: string }> {
  try {
    const userId = await ensureUser();
    if (!userId) return { error: "Not authenticated" };

    const parsed = handLogSchema.safeParse(data);
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? "Invalid data" };
    }

    const {
      hand,
      position,
      gameType,
      streets,
      tags,
      result,
      pnlDollars,
      villainNotes,
      notes,
      effectiveStackDollars,
      potSizeDollars,
    } = parsed.data;

    const [row] = await db
      .insert(handLogs)
      .values({
        userId,
        hand,
        position,
        gameType,
        streets,
        tags: tags ?? [],
        result: result ?? null,
        pnl: pnlDollars != null ? dollarsToCents(pnlDollars) : null,
        villainNotes: villainNotes ?? null,
        notes: notes ?? null,
        effectiveStack:
          effectiveStackDollars != null
            ? dollarsToCents(effectiveStackDollars)
            : null,
        potSize:
          potSizeDollars != null ? dollarsToCents(potSizeDollars) : null,
      })
      .returning({ id: handLogs.id });

    if (!row) return { error: "Insert returned no row" };
    return { success: true, id: row.id };
  } catch (err) {
    console.error("createHandLog error:", err);
    return { error: "Failed to save hand log" };
  }
}

export async function getHandLogs({
  limit = 20,
  offset = 0,
  tag,
  gameType,
}: {
  limit?: number;
  offset?: number;
  tag?: string;
  gameType?: GameType;
} = {}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const conditions = [eq(handLogs.userId, user.id)];

    if (tag) {
      conditions.push(sql`${handLogs.tags} @> ARRAY[${tag}]::text[]`);
    }

    if (gameType) {
      conditions.push(eq(handLogs.gameType, gameType));
    }

    const rows = await db
      .select()
      .from(handLogs)
      .where(and(...conditions))
      .orderBy(desc(handLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return rows;
  } catch (err) {
    console.error("getHandLogs error:", err);
    return [];
  }
}

export async function deleteHandLog(
  id: string
): Promise<{ success: true } | { error: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Not authenticated" };
    }

    await db
      .delete(handLogs)
      .where(and(eq(handLogs.id, id), eq(handLogs.userId, user.id)));

    return { success: true };
  } catch (err) {
    console.error("deleteHandLog error:", err);
    return { error: "Failed to delete hand log" };
  }
}
