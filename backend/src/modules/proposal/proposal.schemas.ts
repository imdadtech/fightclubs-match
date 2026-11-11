import { z } from "zod";

export const createProposalSchema = z.object({
  fromFighterId: z.uuid(),
  toFighterId: z.uuid(),
  weightClassKg: z.number().positive(),
  desiredMonth: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

export const listProposalsQuerySchema = z.object({ box: z.enum(["received", "sent"]).default("received") });
