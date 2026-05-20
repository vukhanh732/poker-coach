"use server";

// RLS-enforced via SSR client
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, studyStreaks } from "@/lib/db/schema";
import type { User, StudyStreak } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getProfile(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  return row ?? null;
}

export async function upsertProfile(data: {
  fullName?: string;
  stakeLevel: string;
  location?: string;
  studyGoals?: string;
}): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  await db
    .insert(users)
    .values({
      id: user.id,
      email: user.email ?? "",
      fullName: data.fullName ?? null,
      stakeLevel: data.stakeLevel,
      location: data.location ?? null,
      studyGoals: data.studyGoals ?? null,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        fullName: data.fullName ?? null,
        stakeLevel: data.stakeLevel,
        location: data.location ?? null,
        studyGoals: data.studyGoals ?? null,
        updatedAt: new Date(),
      },
    });

  return { success: true };
}

export async function getStudyStreak(): Promise<StudyStreak | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [row] = await db
    .select()
    .from(studyStreaks)
    .where(eq(studyStreaks.userId, user.id))
    .limit(1);

  return row ?? null;
}
