-- Backfills the model_media table (present in some environments as drift from an
-- earlier iteration, absent in others) and adds the position column needed to keep
-- categorized galleries (fotos caseras / book / eventos / links de campaña) ordered.
DO $$ BEGIN
  CREATE TYPE "MediaType" AS ENUM ('PHOTO_CASUAL', 'PHOTO_BOOK', 'PHOTO_EVENT', 'VIDEO_LINK');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "model_media" (
    "id"         TEXT         NOT NULL,
    "url"        TEXT         NOT NULL,
    "type"       "MediaType"  NOT NULL,
    "position"   INTEGER      NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "model_id"   TEXT         NOT NULL,

    CONSTRAINT "model_media_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "model_media" ADD COLUMN IF NOT EXISTS "position" INTEGER NOT NULL DEFAULT 0;

DO $$ BEGIN
  ALTER TABLE "model_media"
    ADD CONSTRAINT "model_media_model_id_fkey"
    FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX "model_media_model_id_type_position_key" ON "model_media"("model_id", "type", "position");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;
