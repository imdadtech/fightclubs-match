import type { Fighter } from "../../generated/prisma/client.js";

export type Compatibility = "very" | "ok";

/**
 * Catégorie de poids commune et niveau de compatibilité entre ton combattant et un adversaire.
 * Très compatible : une catégorie en commun et une expérience proche (écart de 4 combats au plus).
 */
export function compare(own: Pick<Fighter, "weightClassesKg" | "fights">, opponent: Pick<Fighter, "weightClassesKg" | "fights">, searched?: number[]) {
  const shared = opponent.weightClassesKg.filter((w) => own.weightClassesKg.includes(w));
  const inSearch = opponent.weightClassesKg.filter((w) => !searched || searched.includes(w));
  const commonWeightKg = Math.min(...(shared.length ? shared : inSearch.length ? inSearch : opponent.weightClassesKg));
  const compatibility: Compatibility =
    shared.length > 0 && Math.abs(own.fights - opponent.fights) <= 4 ? "very" : "ok";
  return { commonWeightKg, compatibility };
}
