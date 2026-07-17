-- AlterTable
ALTER TABLE "RideRequest" ADD COLUMN     "hasLuggage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT;
