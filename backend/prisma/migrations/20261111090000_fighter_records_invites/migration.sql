-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "Fighter" ADD COLUMN "consentAt" TIMESTAMP(3),
ADD COLUMN "sex" "Sex" NOT NULL DEFAULT 'MALE';

-- CreateTable
CREATE TABLE "FighterRecord" (
    "id" TEXT NOT NULL,
    "fighterId" TEXT NOT NULL,
    "discipline" "Discipline" NOT NULL,
    "fights" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,

    CONSTRAINT "FighterRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FighterInvite" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "fighterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FighterInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FighterRecord_discipline_idx" ON "FighterRecord"("discipline");

-- CreateIndex
CREATE UNIQUE INDEX "FighterRecord_fighterId_discipline_key" ON "FighterRecord"("fighterId", "discipline");

-- CreateIndex
CREATE UNIQUE INDEX "FighterInvite_tokenHash_key" ON "FighterInvite"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "FighterInvite_fighterId_key" ON "FighterInvite"("fighterId");

-- CreateIndex
CREATE INDEX "FighterInvite_clubId_idx" ON "FighterInvite"("clubId");

-- AddForeignKey
ALTER TABLE "FighterRecord" ADD CONSTRAINT "FighterRecord_fighterId_fkey" FOREIGN KEY ("fighterId") REFERENCES "Fighter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FighterInvite" ADD CONSTRAINT "FighterInvite_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FighterInvite" ADD CONSTRAINT "FighterInvite_fighterId_fkey" FOREIGN KEY ("fighterId") REFERENCES "Fighter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Reprise des données : le palmarès unique de chaque combattant devient une ligne FighterRecord
INSERT INTO "FighterRecord" ("id", "fighterId", "discipline", "fights", "wins", "losses")
SELECT gen_random_uuid()::text, "id", "discipline", "fights", "wins", "losses" FROM "Fighter";

-- Les anciennes colonnes ne servent plus ; le sexe n'a plus de valeur par défaut
DROP INDEX "Fighter_discipline_idx";
ALTER TABLE "Fighter" DROP COLUMN "discipline",
DROP COLUMN "fights",
DROP COLUMN "losses",
DROP COLUMN "wins",
ALTER COLUMN "sex" DROP DEFAULT;
