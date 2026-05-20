import postgres from "postgres";

const DB_URL = "postgresql://postgres.etyrmcsruzsxfaverand:Vukhanh123!@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres";

const sql = postgres(DB_URL, { ssl: "require" });

const statements = [
  `CREATE TABLE IF NOT EXISTS "users" ("id" uuid PRIMARY KEY NOT NULL, "email" text NOT NULL, "full_name" text, "stake_level" text DEFAULT '1_2' NOT NULL, "location" text, "study_goals" text, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "hand_logs" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "user_id" uuid NOT NULL, "hand" text NOT NULL, "position" text NOT NULL, "streets" jsonb NOT NULL, "tags" text[] DEFAULT '{}' NOT NULL, "result" text, "pnl" integer, "villain_notes" text, "notes" text, "effective_stack" integer, "pot_size" integer, "created_at" timestamptz DEFAULT now() NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "quiz_attempts" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "user_id" uuid NOT NULL, "question_id" text NOT NULL, "category" text NOT NULL, "correct" boolean NOT NULL, "response_time_ms" integer, "ease_factor" integer DEFAULT 250 NOT NULL, "interval" integer DEFAULT 1 NOT NULL, "repetitions" integer DEFAULT 0 NOT NULL, "next_review_at" timestamptz DEFAULT now() NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "analyzed_hands" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "user_id" uuid NOT NULL, "raw_hand" text NOT NULL, "analysis_json" jsonb NOT NULL, "tags" text[] DEFAULT '{}' NOT NULL, "created_at" timestamptz DEFAULT now() NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "villain_profiles" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "user_id" uuid NOT NULL, "name" text NOT NULL, "player_type" text NOT NULL, "notes" text, "tells" text[] DEFAULT '{}' NOT NULL, "seat" text, "casino" text, "created_at" timestamptz DEFAULT now() NOT NULL, "updated_at" timestamptz DEFAULT now() NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "study_streaks" ("user_id" uuid PRIMARY KEY NOT NULL, "current_streak" integer DEFAULT 0 NOT NULL, "longest_streak" integer DEFAULT 0 NOT NULL, "last_active_date" date, "total_study_minutes" integer DEFAULT 0 NOT NULL)`,
  `ALTER TABLE "hand_logs" ADD CONSTRAINT IF NOT EXISTS "hand_logs_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade`,
  `ALTER TABLE "quiz_attempts" ADD CONSTRAINT IF NOT EXISTS "quiz_attempts_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade`,
  `ALTER TABLE "analyzed_hands" ADD CONSTRAINT IF NOT EXISTS "analyzed_hands_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade`,
  `ALTER TABLE "study_streaks" ADD CONSTRAINT IF NOT EXISTS "study_streaks_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade`,
  `ALTER TABLE "villain_profiles" ADD CONSTRAINT IF NOT EXISTS "villain_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade`,
];

async function migrate() {
  for (const stmt of statements) {
    try {
      await sql.unsafe(stmt);
      console.log("✓", stmt.slice(0, 60).trim());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("already exists")) {
        console.log("~", stmt.slice(0, 60).trim(), "(already exists)");
      } else {
        console.error("✗", stmt.slice(0, 60).trim(), "→", msg);
      }
    }
  }

  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
  console.log("\nTables in database:", tables.map((r) => r.table_name).join(", "));
  await sql.end();
}

migrate();
