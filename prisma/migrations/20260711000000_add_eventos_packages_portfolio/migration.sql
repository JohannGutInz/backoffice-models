-- ============================================================
-- Idempotent migration: adds all tables/columns missing from the
-- initial migration history.  Uses IF NOT EXISTS / DO blocks so
-- it is safe to run even if the DB was already migrated via a
-- previous deployment that is no longer in this repo.
-- ============================================================

-- ----- Enums -----

DO $$ BEGIN
  CREATE TYPE "PackageStatus" AS ENUM ('DRAFT', 'SENT', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "MediaType" AS ENUM ('PHOTO_CASUAL', 'PHOTO_BOOK', 'PHOTO_EVENT', 'VIDEO_LINK');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ----- models: split full_name → first_name / last_name_p / last_name_m -----

ALTER TABLE "models"
  ADD COLUMN IF NOT EXISTS "first_name"    TEXT,
  ADD COLUMN IF NOT EXISTS "last_name_p"   TEXT,
  ADD COLUMN IF NOT EXISTS "last_name_m"   TEXT,
  ADD COLUMN IF NOT EXISTS "artistic_name" TEXT,
  ADD COLUMN IF NOT EXISTS "nationality"   TEXT,
  ADD COLUMN IF NOT EXISTS "height"                 INTEGER,
  ADD COLUMN IF NOT EXISTS "weight"                 DECIMAL(65,30),
  ADD COLUMN IF NOT EXISTS "has_visible_tattoos"    BOOLEAN,
  ADD COLUMN IF NOT EXISTS "shirt_size"             TEXT,
  ADD COLUMN IF NOT EXISTS "pants_size"             TEXT,
  ADD COLUMN IF NOT EXISTS "available_to_travel"    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "has_passport"           BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "has_visa_us"            BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "is_visible"             BOOLEAN NOT NULL DEFAULT false;

-- Backfill split name from full_name if full_name column still exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'full_name'
  ) THEN
    UPDATE "models"
    SET
      "first_name"  = COALESCE("full_name", ''),
      "last_name_p" = ''
    WHERE "first_name" IS NULL;

    ALTER TABLE "models" DROP COLUMN "full_name";
  END IF;
END $$;

-- Enforce NOT NULL on required name columns (safe no-op if already NOT NULL)
DO $$ BEGIN
  UPDATE "models" SET "first_name"  = '' WHERE "first_name"  IS NULL;
  UPDATE "models" SET "last_name_p" = '' WHERE "last_name_p" IS NULL;
END $$;

ALTER TABLE "models" ALTER COLUMN "first_name"  SET NOT NULL;
ALTER TABLE "models" ALTER COLUMN "last_name_p" SET NOT NULL;

-- ----- eventos -----

CREATE TABLE IF NOT EXISTS "eventos" (
    "id"               TEXT         NOT NULL,
    "nombre"           TEXT         NOT NULL,
    "start_at"         TIMESTAMP(3) NOT NULL,
    "end_at"           TIMESTAMP(3) NOT NULL,
    "cubierto"         BOOLEAN      NOT NULL DEFAULT false,
    "notas"            TEXT,
    "recurring_days"   INTEGER[]    NOT NULL DEFAULT '{}',
    "daily_start_time" TEXT,
    "daily_end_time"   TEXT,
    "modelo_id"        TEXT,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "eventos"
    ADD CONSTRAINT "eventos_modelo_id_fkey"
    FOREIGN KEY ("modelo_id") REFERENCES "models"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ----- packages -----

CREATE TABLE IF NOT EXISTS "packages" (
    "id"           TEXT           NOT NULL,
    "name"         TEXT           NOT NULL,
    "description"  TEXT,
    "public_token" TEXT           NOT NULL DEFAULT gen_random_uuid()::text,
    "status"       "PackageStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at"   TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  CREATE UNIQUE INDEX "packages_public_token_key" ON "packages"("public_token");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- _ModelToPackage junction

CREATE TABLE IF NOT EXISTS "_ModelToPackage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ModelToPackage_AB_pkey" PRIMARY KEY ("A","B")
);

DO $$ BEGIN
  CREATE INDEX "_ModelToPackage_B_index" ON "_ModelToPackage"("B");
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "_ModelToPackage"
    ADD CONSTRAINT "_ModelToPackage_A_fkey"
    FOREIGN KEY ("A") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "_ModelToPackage"
    ADD CONSTRAINT "_ModelToPackage_B_fkey"
    FOREIGN KEY ("B") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ----- model_media -----

CREATE TABLE IF NOT EXISTS "model_media" (
    "id"         TEXT         NOT NULL,
    "url"        TEXT         NOT NULL,
    "type"       "MediaType"  NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "model_id"   TEXT         NOT NULL,

    CONSTRAINT "model_media_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "model_media"
    ADD CONSTRAINT "model_media_model_id_fkey"
    FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ----- portfolio_entries -----

CREATE TABLE IF NOT EXISTS "portfolio_entries" (
    "id"         TEXT         NOT NULL,
    "marca"      TEXT         NOT NULL,
    "fecha"      TEXT         NOT NULL,
    "lugar"      TEXT         NOT NULL,
    "is_visible" BOOLEAN      NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_entries_pkey" PRIMARY KEY ("id")
);

-- ----- portfolio_fotos -----

CREATE TABLE IF NOT EXISTS "portfolio_fotos" (
    "id"        TEXT    NOT NULL,
    "url"       TEXT    NOT NULL,
    "is_portada" BOOLEAN NOT NULL DEFAULT false,
    "orden"     INTEGER NOT NULL DEFAULT 0,
    "entry_id"  TEXT    NOT NULL,

    CONSTRAINT "portfolio_fotos_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "portfolio_fotos"
    ADD CONSTRAINT "portfolio_fotos_entry_id_fkey"
    FOREIGN KEY ("entry_id") REFERENCES "portfolio_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
