import { z } from "zod";

export const POSITIONS = ["UTG", "UTG+1", "MP", "HJ", "CO", "BTN", "SB", "BB"] as const;

export const TAGS = [
  "mistake",
  "tough_spot",
  "bluff_caught",
  "hero_call",
  "value_bet",
] as const;

export const handLogSchema = z.object({
  hand: z.string().min(1, "Hand is required").max(10, "Hand too long"),
  position: z.enum(POSITIONS, { required_error: "Position is required" }),
  gameType: z.enum(["cash", "tournament"]).default("cash"),
  streets: z.object({
    preflop: z.string().min(1, "Preflop action is required"),
    flop: z.string().optional(),
    turn: z.string().optional(),
    river: z.string().optional(),
    board: z.string().optional(),
  }),
  tags: z.array(z.enum(TAGS)).default([]),
  result: z.enum(["won", "lost", "split"]).optional(),
  pnlDollars: z.number().optional(),
  villainNotes: z.string().max(500, "Max 500 characters").optional(),
  notes: z.string().max(1000, "Max 1000 characters").optional(),
  effectiveStackDollars: z.number().positive("Must be positive").optional(),
  potSizeDollars: z.number().positive("Must be positive").optional(),
});

export type HandLogFormValues = z.infer<typeof handLogSchema>;
