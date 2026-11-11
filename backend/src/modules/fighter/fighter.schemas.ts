import { z } from "zod";
import { Discipline, Sex } from "../../generated/prisma/enums.js";

const name = z.string().trim().min(1, "Champ obligatoire.").max(60);

const birthDate = z.iso
  .date("Date de naissance invalide.")
  .refine((value) => {
    const born = new Date(`${value}T00:00:00.000Z`);
    const now = new Date();
    const age = (now.getTime() - born.getTime()) / (365.25 * 24 * 3600 * 1000);
    return age >= 10 && age <= 80;
  }, "Date de naissance invalide.");

const record = z
  .object({
    discipline: z.enum(Discipline),
    fights: z.number().int().min(0).max(500),
    wins: z.number().int().min(0).max(500),
  })
  .refine((r) => r.wins <= r.fights, { path: ["wins"], message: "Les victoires ne peuvent pas dépasser le nombre de combats." });

/** Saisie d'une fiche combattant (club ou lien). Aucune donnée de contact du combattant n'est demandée. */
export const fighterInputSchema = z.object({
  firstName: name,
  lastName: name,
  birthDate,
  sex: z.enum(Sex),
  weightClassesKg: z.array(z.number().positive().max(200)).min(1, "Choisis au moins une catégorie de poids.").max(12),
  heightCm: z.number().int().min(100).max(250).nullish(),
  records: z
    .array(record)
    .min(1, "Choisis au moins une discipline.")
    .refine((rs) => new Set(rs.map((r) => r.discipline)).size === rs.length, "Une discipline ne peut apparaître qu'une fois."),
});

export type FighterInput = z.infer<typeof fighterInputSchema>;
