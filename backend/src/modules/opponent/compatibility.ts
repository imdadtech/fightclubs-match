import type { Fighter, FighterRecord } from "../../generated/prisma/client.js";
import type { Discipline } from "../../generated/prisma/enums.js";
import { primaryRecord } from "../fighter/fighter.dto.js";

export type Compatibility = "very" | "ok";

type Comparable = Pick<Fighter, "weightClassesKg"> & { records: Pick<FighterRecord, "discipline" | "fights">[] };

/** Discipline commune aux deux combattants (celle où ton combattant a le plus combattu), s'il y en a une. */
export function sharedDiscipline(own: Comparable, opponent: Comparable): Discipline | undefined {
  return [...own.records]
    .sort((a, b) => b.fights - a.fights)
    .find((r) => opponent.records.some((o) => o.discipline === r.discipline))?.discipline;
}

/**
 * Catégorie de poids commune et niveau de compatibilité entre ton combattant et un adversaire.
 * Très compatible : une catégorie en commun et une expérience proche (écart de 4 combats au plus)
 * dans la discipline comparée.
 */
export function compare(own: Comparable, opponent: Comparable, discipline: Discipline | undefined, searched?: number[]) {
  const shared = opponent.weightClassesKg.filter((w) => own.weightClassesKg.includes(w));
  const inSearch = opponent.weightClassesKg.filter((w) => !searched || searched.includes(w));
  const commonWeightKg = Math.min(...(shared.length ? shared : inSearch.length ? inSearch : opponent.weightClassesKg));
  const gap = Math.abs(primaryRecord(own.records, discipline).fights - primaryRecord(opponent.records, discipline).fights);
  const compatibility: Compatibility = shared.length > 0 && gap <= 4 ? "very" : "ok";
  return { commonWeightKg, compatibility, gap };
}
