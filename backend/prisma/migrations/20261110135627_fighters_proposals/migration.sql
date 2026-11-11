-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "Fighter" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "discipline" "Discipline" NOT NULL,
    "weightClassesKg" DOUBLE PRECISION[],
    "birthDate" DATE NOT NULL,
    "heightCm" INTEGER,
    "fights" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "availableMonths" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fighter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "fromFighterId" TEXT NOT NULL,
    "toFighterId" TEXT NOT NULL,
    "weightClassKg" DOUBLE PRECISION NOT NULL,
    "desiredMonth" TEXT,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "fromConfirmedAt" TIMESTAMP(3),
    "toConfirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Fighter_clubId_idx" ON "Fighter"("clubId");

-- CreateIndex
CREATE INDEX "Fighter_discipline_idx" ON "Fighter"("discipline");

-- CreateIndex
CREATE INDEX "Proposal_fromFighterId_idx" ON "Proposal"("fromFighterId");

-- CreateIndex
CREATE INDEX "Proposal_toFighterId_idx" ON "Proposal"("toFighterId");

-- AddForeignKey
ALTER TABLE "Fighter" ADD CONSTRAINT "Fighter_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_fromFighterId_fkey" FOREIGN KEY ("fromFighterId") REFERENCES "Fighter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_toFighterId_fkey" FOREIGN KEY ("toFighterId") REFERENCES "Fighter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
