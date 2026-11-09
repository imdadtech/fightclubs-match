-- CreateEnum
CREATE TYPE "Discipline" AS ENUM ('BOXE_ANGLAISE', 'MUAY_THAI', 'KICK_BOXING', 'K1', 'MMA');

-- CreateEnum
CREATE TYPE "Federation" AS ENUM ('FFB', 'FFKMDA', 'AUTRE', 'NON_AFFILIE');

-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" CHAR(5) NOT NULL,
    "disciplines" "Discipline"[],
    "federations" "Federation"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "phoneHasWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "shareWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "shareEmail" BOOLEAN NOT NULL DEFAULT false,
    "sharePhone" BOOLEAN NOT NULL DEFAULT false,
    "sharingConsentAt" TIMESTAMP(3) NOT NULL,
    "termsAcceptedAt" TIMESTAMP(3) NOT NULL,
    "clubId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clubId_idx" ON "User"("clubId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;
