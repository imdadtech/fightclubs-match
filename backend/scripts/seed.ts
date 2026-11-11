// Données de développement : quelques clubs et combattants pour tester la recherche d'adversaire.
// Lancé par `npm run db:seed` et par `prisma migrate dev` / `prisma migrate reset`. Idempotent. Jamais en production.
import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/db/prisma.js";
import type { Discipline } from "../src/generated/prisma/enums.js";

if (process.env.NODE_ENV === "production") throw new Error("Le seed est réservé au développement.");

export const DEV_PASSWORD = "motdepasse-dev";

const monthKey = (offset: number) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const [m1, m2] = [monthKey(1), monthKey(2)];
const born = (age: number) => new Date(new Date().getFullYear() - age, 3, 15);

interface SeedFighter {
  firstName: string;
  lastName: string;
  discipline?: Discipline;
  weightClassesKg: number[];
  age: number;
  heightCm: number;
  fights: number;
  wins: number;
  losses: number;
  availableMonths: string[];
}

interface SeedClub {
  email: string;
  name: string;
  city: string;
  postalCode: string;
  contactFirstName: string;
  contactLastName: string;
  contactPhone: string;
  fighters: SeedFighter[];
}

const clubs: SeedClub[] = [
  {
    email: "belleville@dev.fightclubs.test", name: "Boxing Club Belleville", city: "Paris", postalCode: "75020",
    contactFirstName: "Nadia", contactLastName: "Benali", contactPhone: "0612345601",
    fighters: [
      { firstName: "Yanis", lastName: "Mansouri", weightClassesKg: [71, 75], age: 24, heightCm: 178, fights: 10, wins: 7, losses: 3, availableMonths: [m1] },
      { firstName: "Samir", lastName: "Taleb", weightClassesKg: [63.5], age: 22, heightCm: 170, fights: 4, wins: 3, losses: 1, availableMonths: [m1, m2] },
      { firstName: "Rayan", lastName: "Kaci", weightClassesKg: [81], age: 27, heightCm: 185, fights: 7, wins: 5, losses: 2, availableMonths: [m2] },
    ],
  },
  {
    email: "lyon@dev.fightclubs.test", name: "Lyon Fight Academy", city: "Lyon", postalCode: "69003",
    contactFirstName: "Julien", contactLastName: "Roux", contactPhone: "0612345602",
    fighters: [
      { firstName: "Karim", lastName: "Bouzid", weightClassesKg: [71], age: 25, heightCm: 180, fights: 12, wins: 8, losses: 4, availableMonths: [m1] },
      { firstName: "Sofiane", lastName: "Amrani", weightClassesKg: [71, 75], age: 24, heightCm: 179, fights: 8, wins: 5, losses: 3, availableMonths: [m1] },
      { firstName: "Tarik", lastName: "Haddad", discipline: "MUAY_THAI", weightClassesKg: [71], age: 25, heightCm: 180, fights: 10, wins: 7, losses: 3, availableMonths: [m1] },
    ],
  },
  {
    email: "marseille@dev.fightclubs.test", name: "Marseille Boxing Club", city: "Marseille", postalCode: "13006",
    contactFirstName: "Karine", contactLastName: "Silvestre", contactPhone: "0612345603",
    fighters: [
      { firstName: "Mehdi", lastName: "Rahmani", weightClassesKg: [71], age: 23, heightCm: 177, fights: 9, wins: 6, losses: 3, availableMonths: [m1, m2] },
      { firstName: "Anis", lastName: "Chabane", weightClassesKg: [71], age: 26, heightCm: 178, fights: 11, wins: 7, losses: 4, availableMonths: [m1, m2] },
    ],
  },
  {
    email: "nantes@dev.fightclubs.test", name: "Boxing Club Nantais", city: "Nantes", postalCode: "44000",
    contactFirstName: "Paul", contactLastName: "Lemoine", contactPhone: "0612345604",
    fighters: [
      { firstName: "Hugo", lastName: "Lefèvre", weightClassesKg: [75], age: 27, heightCm: 182, fights: 14, wins: 9, losses: 5, availableMonths: [m2] },
      { firstName: "Bilal", lastName: "Driss", weightClassesKg: [67], age: 22, heightCm: 174, fights: 6, wins: 4, losses: 2, availableMonths: [m2] },
    ],
  },
];

const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);
const now = new Date();
let created = 0;

for (const c of clubs) {
  if (await prisma.user.findUnique({ where: { email: c.email } })) continue;
  await prisma.club.create({
    data: {
      name: c.name, city: c.city, postalCode: c.postalCode,
      disciplines: ["BOXE_ANGLAISE", "MUAY_THAI"], federations: ["FFB"],
      contactFirstName: c.contactFirstName, contactLastName: c.contactLastName,
      contactPhone: c.contactPhone, phoneHasWhatsapp: true,
      shareEmail: true, sharePhone: true, sharingConsentAt: now,
      users: { create: { email: c.email, passwordHash, termsAcceptedAt: now } },
      fighters: {
        create: c.fighters.map(({ age, discipline, fights, wins, losses, ...f }) => ({
          ...f, sex: "MALE" as const, birthDate: born(age),
          records: { create: [{ discipline: discipline ?? "BOXE_ANGLAISE", fights, wins, losses }] },
        })),
      },
    },
  });
  created += 1;
}

console.log(
  created
    ? `Seed : ${created} club(s) créé(s). Connexion : belleville@dev.fightclubs.test / ${DEV_PASSWORD}`
    : "Seed : rien à faire (clubs déjà présents).",
);
await prisma.$disconnect();
