"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * Guarantees a row exists in public.users for the current auth user.
 * Call this before any insert that has a user_id FK.
 * Returns the user id, or null if not authenticated.
 */
export async function ensureUser(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  await db
    .insert(users)
    .values({
      id: user.id,
      email: user.email!,
      fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
      stakeLevel: "1_2",
    })
    .onConflictDoNothing();

  return user.id;
}
