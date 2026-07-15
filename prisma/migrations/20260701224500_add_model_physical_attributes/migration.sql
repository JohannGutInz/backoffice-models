-- CreateEnum
CREATE TYPE "ShirtSize" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL');

-- CreateEnum
CREATE TYPE "PantsSizeScale" AS ENUM ('MEN', 'WOMEN');

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ActivityToModel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActivityToModel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ActivityToModel_B_index" ON "_ActivityToModel"("B");

-- AddForeignKey
ALTER TABLE "_ActivityToModel" ADD CONSTRAINT "_ActivityToModel_A_fkey" FOREIGN KEY ("A") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityToModel" ADD CONSTRAINT "_ActivityToModel_B_fkey" FOREIGN KEY ("B") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Rename full_name -> first_name, add paternal/maternal last name columns.
ALTER TABLE "models" RENAME COLUMN "full_name" TO "first_name";
ALTER TABLE "models" ADD COLUMN "paternal_last_name" TEXT;
ALTER TABLE "models" ADD COLUMN "maternal_last_name" TEXT;

-- Backfill: best-effort split of the former full_name value (now sitting in first_name).
UPDATE "models"
SET "paternal_last_name" = COALESCE(NULLIF(split_part("first_name", ' ', 2), ''), 'N/A'),
    "first_name" = split_part("first_name", ' ', 1);

ALTER TABLE "models" ALTER COLUMN "paternal_last_name" SET NOT NULL;

-- New physical/logistics attributes. Scalar/enum fields stay optional until the model
-- completes their profile; booleans default to false (never nullable).
ALTER TABLE "models" ADD COLUMN "height_cm" INTEGER;
ALTER TABLE "models" ADD COLUMN "current_weight_kg" INTEGER;
ALTER TABLE "models" ADD COLUMN "has_visible_tattoos" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "models" ADD COLUMN "shirt_size" "ShirtSize";
ALTER TABLE "models" ADD COLUMN "pants_size_scale" "PantsSizeScale";
ALTER TABLE "models" ADD COLUMN "pants_size" TEXT;
ALTER TABLE "models" ADD COLUMN "travel_availability" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "models" ADD COLUMN "has_passport" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "models" ADD COLUMN "has_visa" BOOLEAN NOT NULL DEFAULT false;
