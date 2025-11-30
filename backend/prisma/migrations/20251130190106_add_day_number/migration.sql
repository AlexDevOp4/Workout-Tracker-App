/*
  Warnings:

  - You are about to drop the column `dayNumber` on the `Row` table. All the data in the column will be lost.
  - Added the required column `dayNumber` to the `Day` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Row_weekId_dayNumber_dayId_idx";

-- AlterTable
ALTER TABLE "Day" ADD COLUMN     "dayNumber" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Row" DROP COLUMN "dayNumber";

-- CreateIndex
CREATE INDEX "Row_weekId_dayId_idx" ON "Row"("weekId", "dayId");
