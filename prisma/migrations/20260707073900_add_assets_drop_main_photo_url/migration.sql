-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('MAIN_PHOTO', 'PHOTO', 'VIDEO');

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "model_id" TEXT NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_model_id_type_position_key" ON "assets"("model_id", "type", "position");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill existing main photos into the new assets table.
INSERT INTO "assets" ("id", "type", "url", "position", "model_id")
SELECT gen_random_uuid()::text, 'MAIN_PHOTO', "main_photo_url", 0, "id"
FROM "models"
WHERE "main_photo_url" IS NOT NULL;

-- AlterTable
ALTER TABLE "models" DROP COLUMN "main_photo_url";
