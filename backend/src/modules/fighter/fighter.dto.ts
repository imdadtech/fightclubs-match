import type { Club, Fighter } from "../../generated/prisma/client.js";

export type FighterWithClub = Fighter & { club: Pick<Club, "id" | "name" | "city" | "postalCode"> };

const ageOf = (birthDate: Date) => {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const birthdayPassed =
    now.getMonth() > birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());
  if (!birthdayPassed) age -= 1;
  return age;
};

/** Représentation publique d'un combattant : seule l'initiale du nom est partagée avec les autres clubs. */
export function toFighterDto(f: FighterWithClub) {
  return {
    id: f.id,
    firstName: f.firstName,
    lastInitial: f.lastName.charAt(0).toUpperCase(),
    club: { id: f.club.id, name: f.club.name, city: f.club.city, postalCode: f.club.postalCode },
    discipline: f.discipline,
    weightClassesKg: [...f.weightClassesKg].sort((a, b) => a - b),
    age: ageOf(f.birthDate),
    heightCm: f.heightCm,
    fights: f.fights,
    wins: f.wins,
    losses: f.losses,
    availableMonths: f.availableMonths,
  };
}

export const withClub = { club: { select: { id: true, name: true, city: true, postalCode: true } } } as const;
