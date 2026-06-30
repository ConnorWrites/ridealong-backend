/*
  Warnings:

  - You are about to drop the column `departureAt` on the `Ride` table. All the data in the column will be lost.
  - You are about to drop the column `seats` on the `Ride` table. All the data in the column will be lost.
  - Added the required column `departureTime` to the `Ride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('DRIVER', 'PASSENGER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "RideRequest" DROP CONSTRAINT "RideRequest_rideId_fkey";

-- DropForeignKey
ALTER TABLE "RideRequest" DROP CONSTRAINT "RideRequest_userId_fkey";

-- AlterTable
ALTER TABLE "Ride" DROP COLUMN "departureAt",
DROP COLUMN "seats",
ADD COLUMN     "departureTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'PASSENGER',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Ride_driverId_idx" ON "Ride"("driverId");

-- CreateIndex
CREATE INDEX "RideRequest_rideId_idx" ON "RideRequest"("rideId");

-- CreateIndex
CREATE INDEX "RideRequest_userId_idx" ON "RideRequest"("userId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "RideRequest" ADD CONSTRAINT "RideRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideRequest" ADD CONSTRAINT "RideRequest_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;
