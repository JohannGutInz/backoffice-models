/*
  Warnings:

  - A unique constraint covering the columns `[label]` on the table `countries` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[label]` on the table `municipalities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[label]` on the table `states` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `label` to the `municipalities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "municipalities" ADD COLUMN     "label" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "countries_label_key" ON "countries"("label");

-- CreateIndex
CREATE UNIQUE INDEX "municipalities_label_key" ON "municipalities"("label");

-- CreateIndex
CREATE UNIQUE INDEX "states_label_key" ON "states"("label");
