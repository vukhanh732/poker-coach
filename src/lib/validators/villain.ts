import { z } from "zod";

export const villainSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  playerType: z.enum([
    "calling_station",
    "nit",
    "maniac",
    "tag",
    "lag",
    "fish",
    "custom",
  ]),
  notes: z.string().max(1000, "Notes too long").optional(),
  tells: z.array(z.string()).default([]),
  seat: z.string().max(20, "Seat too long").optional(),
  casino: z.string().max(50, "Casino name too long").optional(),
});

export type VillainFormValues = z.infer<typeof villainSchema>;
