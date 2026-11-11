import type { Club, Fighter, FighterRecord } from "../../generated/prisma/client.js";
import type { Discipline } from "../../generated/prisma/enums.js";
import type { FighterInput } from "./fighter.schemas.js";

export type FighterWithRelations = Fighter & {
  club: Pick<Club, "id" | "name" | "city" | "postalCode">;
  records: FighterRecord[];
};

const ageOf = (birthDate: Date) => {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const birthdayPassed =
    now.getMonth() > birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());
  if (!birthdayPassed) age -= 1;
  return age;
};

/** Palmarès retenu pour la comparaison : celui de la discipline demandée, sinon celui où le combattant a le plus combattu. */
export function primaryRecord<R extends Pick<FighterRecord, "discipline" | "fights">>(records: R[], discipline?: Discipline): R {
  return (
    records.find((r) => r.discipline === discipline) ??
    [...records].sort((a, b) => b.fights - a.fights)[0]
  );
}

/**
 * Représentation publique d'un combattant : seule l'initiale du nom est partagée avec les autres clubs.
 * `discipline`, `fights`, `wins` et `losses` décrivent le palmarès de la discipline recherchée (ou la principale) ;
 * `records` donne toutes les disciplines.
 */
export function toFighterDto(f: FighterWithRelations, discipline?: Discipline) {
  const records = [...f.records].sort((a, b) => b.fights - a.fights);
  const main = primaryRecord(records, discipline);
  return {
    id: f.id,
    firstName: f.firstName,
    lastInitial: f.lastName.charAt(0).toUpperCase(),
    club: { id: f.club.id, name: f.club.name, city: f.club.city, postalCode: f.club.postalCode },
    sex: f.sex,
    weightClassesKg: [...f.weightClassesKg].sort((a, b) => a - b),
    age: ageOf(f.birthDate),
    heightCm: f.heightCm,
    discipline: main.discipline,
    fights: main.fights,
    wins: main.wins,
    losses: main.losses,
    records: records.map(({ discipline, fights, wins, losses }) => ({ discipline, fights, wins, losses })),
    totalFights: records.reduce((sum, r) => sum + r.fights, 0),
    availableMonths: f.availableMonths,
  };
}

/** Données Prisma pour créer une fiche combattant à partir d'une saisie validée. */
export function toFighterCreateData(input: FighterInput, extra: { consentAt?: Date } = {}) {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    sex: input.sex,
    birthDate: new Date(`${input.birthDate}T00:00:00.000Z`),
    weightClassesKg: [...new Set(input.weightClassesKg)].sort((a, b) => a - b),
    heightCm: input.heightCm ?? null,
    availableMonths: [],
    consentAt: extra.consentAt,
    records: {
      create: input.records.map((r) => ({ discipline: r.discipline, fights: r.fights, wins: r.wins, losses: r.fights - r.wins })),
    },
  };
}

export const withRelations = {
  club: { select: { id: true, name: true, city: true, postalCode: true } },
  records: true,
} as const;
