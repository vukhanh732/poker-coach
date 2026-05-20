"use server";

// RLS-enforced via SSR client
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { villainProfiles } from "@/lib/db/schema";
import type { VillainFormValues } from "@/lib/validators/villain";
import { eq, and, desc } from "drizzle-orm";
import { ensureUser } from "@/lib/ensure-user";

export async function createVillain(
  data: VillainFormValues
): Promise<{ success: true; id: string } | { error: string }> {
  const userId = await ensureUser();
  if (!userId) return { error: "Unauthenticated" };

  const [row] = await db
    .insert(villainProfiles)
    .values({
      userId,
      name: data.name,
      playerType: data.playerType,
      notes: data.notes ?? null,
      tells: data.tells,
      seat: data.seat ?? null,
      casino: data.casino ?? null,
    })
    .returning({ id: villainProfiles.id });

  if (!row) return { error: "Failed to create villain profile" };
  return { success: true, id: row.id };
}

export async function getVillains() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const rows = await db
    .select()
    .from(villainProfiles)
    .where(eq(villainProfiles.userId, user.id))
    .orderBy(desc(villainProfiles.updatedAt));

  return rows;
}

export async function deleteVillain(
  id: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthenticated" };

  await db
    .delete(villainProfiles)
    .where(and(eq(villainProfiles.id, id), eq(villainProfiles.userId, user.id)));

  return { success: true };
}
