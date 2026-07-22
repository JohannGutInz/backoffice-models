-- ============================================================
-- Idempotent migration: reconciles column names that diverged
-- between the main branch (paternal_last_name, height_cm, etc.)
-- and the dev branch (last_name_p, height, available_to_travel, etc.).
-- Also drops the old column names so they don't cause NOT NULL
-- constraint violations on INSERT (Prisma doesn't know about them).
-- Safe to run regardless of which path the DB went through.
-- ============================================================

-- ---- paternal_last_name (was last_name_p in dev branch) ----
DO $$ BEGIN
  -- Step 1: ensure paternal_last_name exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'paternal_last_name'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'last_name_p'
    ) THEN
      ALTER TABLE "models" RENAME COLUMN "last_name_p" TO "paternal_last_name";
    ELSE
      ALTER TABLE "models" ADD COLUMN "paternal_last_name" TEXT NOT NULL DEFAULT '';
    END IF;
  END IF;

  -- Step 2: drop last_name_p if it still coexists (NOT NULL → causes INSERT violations)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'last_name_p'
  ) THEN
    UPDATE "models"
    SET "paternal_last_name" = "last_name_p"
    WHERE ("paternal_last_name" IS NULL OR "paternal_last_name" = '')
      AND "last_name_p" IS NOT NULL AND "last_name_p" != '';
    ALTER TABLE "models" DROP COLUMN "last_name_p";
  END IF;
END $$;

-- ---- maternal_last_name (was last_name_m in dev branch) ----
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'maternal_last_name'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'last_name_m'
    ) THEN
      ALTER TABLE "models" RENAME COLUMN "last_name_m" TO "maternal_last_name";
    ELSE
      ALTER TABLE "models" ADD COLUMN "maternal_last_name" TEXT;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'last_name_m'
  ) THEN
    ALTER TABLE "models" DROP COLUMN "last_name_m";
  END IF;
END $$;

-- ---- height_cm (was height in dev branch) ----
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'height_cm'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'height'
    ) THEN
      ALTER TABLE "models" RENAME COLUMN "height" TO "height_cm";
    ELSE
      ALTER TABLE "models" ADD COLUMN "height_cm" INTEGER;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'height'
  ) THEN
    ALTER TABLE "models" DROP COLUMN "height";
  END IF;
END $$;

-- ---- current_weight_kg (was weight DECIMAL in dev branch) ----
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'current_weight_kg'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'weight'
    ) THEN
      ALTER TABLE "models" ADD COLUMN "current_weight_kg" INTEGER;
      UPDATE "models" SET "current_weight_kg" = ROUND("weight")::INTEGER WHERE "weight" IS NOT NULL;
      ALTER TABLE "models" DROP COLUMN "weight";
    ELSE
      ALTER TABLE "models" ADD COLUMN "current_weight_kg" INTEGER;
    END IF;
  ELSE
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'weight'
    ) THEN
      ALTER TABLE "models" DROP COLUMN "weight";
    END IF;
  END IF;
END $$;

-- ---- travel_availability (was available_to_travel in dev branch) ----
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'travel_availability'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'available_to_travel'
    ) THEN
      ALTER TABLE "models" RENAME COLUMN "available_to_travel" TO "travel_availability";
    ELSE
      ALTER TABLE "models" ADD COLUMN "travel_availability" BOOLEAN NOT NULL DEFAULT false;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'available_to_travel'
  ) THEN
    ALTER TABLE "models" DROP COLUMN "available_to_travel";
  END IF;
END $$;

-- ---- has_visa (was has_visa_us in dev branch) ----
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'has_visa'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'has_visa_us'
    ) THEN
      ALTER TABLE "models" RENAME COLUMN "has_visa_us" TO "has_visa";
    ELSE
      ALTER TABLE "models" ADD COLUMN "has_visa" BOOLEAN NOT NULL DEFAULT false;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'has_visa_us'
  ) THEN
    ALTER TABLE "models" DROP COLUMN "has_visa_us";
  END IF;
END $$;

-- ---- Drop other legacy columns from dev branch (not in current schema) ----
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'artistic_name'
  ) THEN
    ALTER TABLE "models" DROP COLUMN "artistic_name";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'nationality'
  ) THEN
    ALTER TABLE "models" DROP COLUMN "nationality";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'is_visible'
  ) THEN
    ALTER TABLE "models" DROP COLUMN "is_visible";
  END IF;
END $$;

-- ---- Enums (safe no-op if already exist) ----
DO $$ BEGIN
  CREATE TYPE "ShirtSize" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "PantsSizeScale" AS ENUM ('MEN', 'WOMEN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---- has_visible_tattoos ----
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'has_visible_tattoos'
  ) THEN
    ALTER TABLE "models" ADD COLUMN "has_visible_tattoos" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- ---- shirt_size (add as enum if missing; if TEXT from dev branch, cast it) ----
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'shirt_size'
  ) THEN
    ALTER TABLE "models" ADD COLUMN "shirt_size" "ShirtSize";
  ELSE
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'models'
        AND column_name = 'shirt_size'
        AND data_type = 'text'
    ) THEN
      UPDATE "models" SET "shirt_size" = NULL
        WHERE "shirt_size" NOT IN ('XS','S','M','L','XL','XXL');
      ALTER TABLE "models"
        ALTER COLUMN "shirt_size" TYPE "ShirtSize"
        USING "shirt_size"::"ShirtSize";
    END IF;
  END IF;
END $$;

-- ---- pants_size_scale ----
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'pants_size_scale'
  ) THEN
    ALTER TABLE "models" ADD COLUMN "pants_size_scale" "PantsSizeScale";
  END IF;
END $$;

-- ---- pants_size ----
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'pants_size'
  ) THEN
    ALTER TABLE "models" ADD COLUMN "pants_size" TEXT;
  END IF;
END $$;

-- ---- has_passport ----
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'models' AND column_name = 'has_passport'
  ) THEN
    ALTER TABLE "models" ADD COLUMN "has_passport" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;
