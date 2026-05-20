import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  date,
  pgSchema,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Users ──────────────────────────────────────────────────────────────────
// mirrors Supabase auth.users — we store app-level profile data separately
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // must equal auth.users.id
  email: text("email").notNull(),
  fullName: text("full_name"),
  stakeLevel: text("stake_level").notNull().default("1_2"), // "1_2" | "2_3" | "5_10"
  location: text("location"),
  studyGoals: text("study_goals"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Hand Logs ───────────────────────────────────────────────────────────────
export const handLogs = pgTable("hand_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  hand: text("hand").notNull(), // e.g. "AsKh" or "AKs"
  position: text("position").notNull(), // UTG | UTG+1 | MP | HJ | CO | BTN | SB | BB
  streets: jsonb("streets")
    .notNull()
    .$type<{
      preflop: string;
      flop?: string;
      turn?: string;
      river?: string;
      board?: string;
    }>(),
  tags: text("tags").array().notNull().default([]),
  result: text("result"), // "won" | "lost" | "split" | null
  pnl: integer("pnl"), // in cents, positive = profit
  villainNotes: text("villain_notes"),
  notes: text("notes"),
  effectiveStack: integer("effective_stack"), // in cents
  potSize: integer("pot_size"), // final pot in cents
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Quiz Attempts ────────────────────────────────────────────────────────────
export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull(),
  category: text("category").notNull(), // preflop | pot_odds | board_texture | bet_sizing | exploits | river
  correct: boolean("correct").notNull(),
  responseTimeMs: integer("response_time_ms"),
  // SM-2 SRS fields per question (stored denormalized for query speed)
  easeFactor: integer("ease_factor").notNull().default(250), // × 0.01 = 2.5 default
  interval: integer("interval").notNull().default(1), // days until next review
  repetitions: integer("repetitions").notNull().default(0),
  nextReviewAt: timestamp("next_review_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Analyzed Hands ───────────────────────────────────────────────────────────
export const analyzedHands = pgTable("analyzed_hands", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rawHand: text("raw_hand").notNull(),
  analysisJson: jsonb("analysis_json")
    .notNull()
    .$type<{
      summary: string;
      streets: Array<{
        street: string;
        action: string;
        analysis: string;
        alternativeLines: string[];
      }>;
      keyDecisionPoints: string[];
      exploitativeAdjustments: string[];
      solverPerspective: string;
      verdict: "good" | "questionable" | "mistake";
    }>(),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Villain Profiles ─────────────────────────────────────────────────────────
export const villainProfiles = pgTable("villain_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  playerType: text("player_type").notNull(), // calling_station | nit | maniac | tag | lag | fish | custom
  notes: text("notes"),
  tells: text("tells").array().notNull().default([]),
  seat: text("seat"), // optional casino/seat info
  casino: text("casino"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Study Streaks ────────────────────────────────────────────────────────────
export const studyStreaks = pgTable("study_streaks", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: date("last_active_date"),
  totalStudyMinutes: integer("total_study_minutes").notNull().default(0),
});

// ─── Relations ────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many, one }) => ({
  handLogs: many(handLogs),
  quizAttempts: many(quizAttempts),
  analyzedHands: many(analyzedHands),
  villainProfiles: many(villainProfiles),
  studyStreak: one(studyStreaks, {
    fields: [users.id],
    references: [studyStreaks.userId],
  }),
}));

export const handLogsRelations = relations(handLogs, ({ one }) => ({
  user: one(users, { fields: [handLogs.userId], references: [users.id] }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, { fields: [quizAttempts.userId], references: [users.id] }),
}));

export const analyzedHandsRelations = relations(analyzedHands, ({ one }) => ({
  user: one(users, { fields: [analyzedHands.userId], references: [users.id] }),
}));

export const villainProfilesRelations = relations(
  villainProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [villainProfiles.userId],
      references: [users.id],
    }),
  })
);

// ─── Type exports ─────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type HandLog = typeof handLogs.$inferSelect;
export type NewHandLog = typeof handLogs.$inferInsert;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;
export type AnalyzedHand = typeof analyzedHands.$inferSelect;
export type NewAnalyzedHand = typeof analyzedHands.$inferInsert;
export type VillainProfile = typeof villainProfiles.$inferSelect;
export type NewVillainProfile = typeof villainProfiles.$inferInsert;
export type StudyStreak = typeof studyStreaks.$inferSelect;
