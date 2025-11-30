/*
  Warnings:

  - You are about to drop the column `weekId` on the `Row` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[weekId,dayNumber]` on the table `Day` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `weekId` to the `Day` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Row" DROP CONSTRAINT "Row_weekId_fkey";

-- DropIndex
DROP INDEX "Row_weekId_dayId_idx";

-- AlterTable
ALTER TABLE "Day" ADD COLUMN     "weekId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Row" DROP COLUMN "weekId";

-- CreateIndex
CREATE UNIQUE INDEX "Day_weekId_dayNumber_key" ON "Day"("weekId", "dayNumber");

-- CreateIndex
CREATE INDEX "Row_dayId_idx" ON "Row"("dayId");

-- AddForeignKey
ALTER TABLE "Day" ADD CONSTRAINT "Day_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "Week"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
