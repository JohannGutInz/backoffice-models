-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REQUIRES_CHANGES');

-- CreateTable
CREATE TABLE "kycs" (
    "id" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "internal_note" TEXT,
    "rejected_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kycs_pkey" PRIMARY KEY ("id")
);

-- Backfill: create a PENDING Kyc for every existing model
INSERT INTO "kycs" ("id", "status", "updated_at")
SELECT gen_random_uuid(), 'PENDING', NOW()
FROM "models";

-- AddColumn (nullable first so backfill can populate it)
ALTER TABLE "models" ADD COLUMN "kyc_id" TEXT;

-- Populate kyc_id by pairing each model with a newly created kyc row (join on ctid order)
UPDATE "models" m
SET "kyc_id" = k."id"
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn FROM "kycs"
) k
JOIN (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn FROM "models"
) m2 ON m2.rn = k.rn
WHERE m.id = m2.id;

-- Now enforce NOT NULL and UNIQUE
ALTER TABLE "models" ALTER COLUMN "kyc_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "models_kyc_id_key" ON "models"("kyc_id");

-- AddForeignKey
ALTER TABLE "models" ADD CONSTRAINT "models_kyc_id_fkey" FOREIGN KEY ("kyc_id") REFERENCES "kycs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
