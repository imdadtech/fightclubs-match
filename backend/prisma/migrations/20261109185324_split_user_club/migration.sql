/*
  Warnings:

  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneHasWhatsapp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `shareEmail` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sharePhone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `shareWhatsapp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sharingConsentAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `contactFirstName` to the `Club` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactLastName` to the `Club` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sharingConsentAt` to the `Club` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "contactFirstName" TEXT NOT NULL,
ADD COLUMN     "contactLastName" TEXT NOT NULL,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "phoneHasWhatsapp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shareEmail" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sharePhone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shareWhatsapp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sharingConsentAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "phone",
DROP COLUMN "phoneHasWhatsapp",
DROP COLUMN "shareEmail",
DROP COLUMN "sharePhone",
DROP COLUMN "shareWhatsapp",
DROP COLUMN "sharingConsentAt";
