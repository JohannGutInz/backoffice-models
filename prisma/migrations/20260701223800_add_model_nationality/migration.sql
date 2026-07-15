/*
  Warnings:

  - Added the required column `nationality_id` to the `models` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "models" ADD COLUMN     "nationality_id" TEXT;

-- Backfill: default existing rows' nationality to their residence country.
UPDATE "models" SET "nationality_id" = "country_id" WHERE "nationality_id" IS NULL;

ALTER TABLE "models" ALTER COLUMN "nationality_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "models" ADD CONSTRAINT "models_nationality_id_fkey" FOREIGN KEY ("nationality_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
