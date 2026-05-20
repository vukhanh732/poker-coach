import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  // Disable prefetch for Supabase transaction pooler (required for serverless)
  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
}

// Lazy singleton — only initialised on first DB call, not at import time
let _db: ReturnType<typeof createDb> | null = null;

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop) {
    if (!_db) _db = createDb();
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export type DB = ReturnType<typeof createDb>;
