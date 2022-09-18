/*
  Warnings:

  - The `position` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "position",
ADD COLUMN     "position" DOUBLE PRECISION[] DEFAULT ARRAY[0, 0, 0]::DOUBLE PRECISION[];
