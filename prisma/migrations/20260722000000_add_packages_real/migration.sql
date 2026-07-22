-- PackageStatus enum (safe if already exists)
DO $$ BEGIN
  CREATE TYPE "PackageStatus" AS ENUM ('DRAFT', 'SENT', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Packages table
CREATE TABLE IF NOT EXISTS "packages" (
  "id"          TEXT            NOT NULL,
  "name"        TEXT            NOT NULL,
  "description" TEXT,
  "token"       TEXT            NOT NULL,
  "status"      "PackageStatus" NOT NULL DEFAULT 'DRAFT',
  "created_at"  TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"  TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "packages_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "packages_token_key" UNIQUE ("token")
);

-- Junction table: Model ↔ Package (Prisma implicit M2M naming: alphabetical)
CREATE TABLE IF NOT EXISTS "_ModelToPackage" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL,
  CONSTRAINT "_ModelToPackage_AB_unique" UNIQUE ("A", "B")
);

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

CREATE INDEX IF NOT EXISTS "_ModelToPackage_B_index" ON "_ModelToPackage"("B");
