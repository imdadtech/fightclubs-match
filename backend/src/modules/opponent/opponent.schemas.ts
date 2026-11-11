import { z } from "zod";
import { Discipline } from "../../generated/prisma/enums.js";

/** Champ numérique facultatif : absent ou vide = pas de limite. */
const optionalInt = z.preprocess(
  (v) => (v === "" || v === undefined ? undefined : v),
  z.coerce.number().int().min(0).optional(),
);

export const searchQuerySchema = z
  .object({
    fighterId: z.uuid(),
    discipline: z.enum(Discipline),
    /** Catégories de poids séparées par des virgules : « 71,75 ». */
    weights: z
      .string()
      .transform((v) => v.split(",").map(Number))
      .pipe(z.array(z.number().positive()).min(1)),
    /** Mois souhaité, « 2026-12 ». */
    month: z.preprocess((v) => (v === "" ? undefined : v), z.string().regex(/^\d{4}-\d{2}$/).optional()),
    minFights: optionalInt,
    maxFights: optionalInt,
    minWins: optionalInt,
    maxLosses: optionalInt,
  })
  .refine((q) => q.minFights === undefined || q.maxFights === undefined || q.minFights <= q.maxFights, {
    path: ["maxFights"],
    message: "Le minimum doit être inférieur ou égal au maximum.",
  });

export const detailQuerySchema = z.object({ fighterId: z.uuid() });
