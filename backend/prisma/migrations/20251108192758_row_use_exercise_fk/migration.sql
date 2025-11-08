/*
  Warnings:

  - You are about to drop the column `exercise` on the `Row` table. All the data in the column will be lost.
  - Added the required column `exerciseId` to the `Row` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('UPPER', 'LOWER');

-- AlterTable
ALTER TABLE "Row" DROP COLUMN "exercise",
ADD COLUMN     "exerciseId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ExerciseCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");

-- CreateIndex
CREATE INDEX "Exercise_name_idx" ON "Exercise"("name");

-- CreateIndex
CREATE INDEX "Row_exerciseId_idx" ON "Row"("exerciseId");

-- AddForeignKey
ALTER TABLE "Row" ADD CONSTRAINT "Row_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
