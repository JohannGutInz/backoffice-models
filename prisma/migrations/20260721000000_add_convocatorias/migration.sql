-- Create enum (idempotent)
DO $$ BEGIN
  CREATE TYPE "ConvocatoriaStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Main table: create if not exists, then add any missing columns from old minimal version
CREATE TABLE IF NOT EXISTS "convocatorias" (
  "id"               TEXT                 NOT NULL,
  "titulo"           TEXT                 NOT NULL DEFAULT '',
  "ciudad"           TEXT                 NOT NULL DEFAULT '',
  "tipo"             TEXT                 NOT NULL DEFAULT '',
  "fecha_evento"     DATE                 NOT NULL DEFAULT CURRENT_DATE,
  "horario"          TEXT                 NOT NULL DEFAULT '',
  "lugar"            TEXT                 NOT NULL DEFAULT '',
  "funciones"        TEXT                 NOT NULL DEFAULT '',
  "pago"             TEXT                 NOT NULL DEFAULT '',
  "perfil"           TEXT                 NOT NULL DEFAULT '',
  "cuerpo"           TEXT                 NOT NULL DEFAULT '',
  "whatsapp_number"  TEXT                 NOT NULL DEFAULT '',
  "status"           "ConvocatoriaStatus" NOT NULL DEFAULT 'DRAFT',
  "published_at"     TIMESTAMP(3),
  "created_at"       TIMESTAMP(3)         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3)         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "convocatorias_pkey" PRIMARY KEY ("id")
);

-- Add any columns that might be missing (handles old minimal table: title, body, status only)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'convocatorias' AND column_name = 'titulo') THEN
    ALTER TABLE "convocatorias" ADD COLUMN "titulo" TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'convocatorias' AND column_name = 'ciudad') THEN
    ALTER TABLE "convocatorias" ADD COLUMN "ciudad" TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'convocatorias' AND column_name = 'tipo') THEN
    ALTER TABLE "convocatorias" ADD COLUMN "tipo" TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'convocatorias' AND column_name = 'fecha_evento') THEN
    ALTER TABLE "convocatorias" ADD COLUMN "fecha_evento" DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'convocatorias' AND column_name = 'horario') THEN
    ALTER TABLE "convocatorias" ADD COLUMN "horario" TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'convocatorias' AND column_name = 'lugar') THEN
    ALTER TABLE "convocatorias" ADD COLUMN "lugar" TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'convocatorias' AND column_name = 'funciones') THEN
    ALTER TABLE "convocatorias" ADD COLUMN "funciones" TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'convocatorias' AND column_name = 'pago') THEN
    ALTER TABLE "convocatorias" ADD COLUMN "pago" TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'convocatorias' AND column_name = 'perfil') THEN
    ALTER TABLE "convocatorias" ADD COLUMN "perfil" TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'convocatorias' AND column_name = 'cuerpo') THEN
    ALTER TABLE "convocatorias" ADD COLUMN "cuerpo" TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'convocatorias' AND column_name = 'whatsapp_number') THEN
    ALTER TABLE "convocatorias" ADD COLUMN "whatsapp_number" TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'convocatorias' AND column_name = 'published_at') THEN
    ALTER TABLE "convocatorias" ADD COLUMN "published_at" TIMESTAMP(3);
  END IF;
  -- Drop old columns from minimal version if they exist (title → titulo, body → cuerpo)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'convocatorias' AND column_name = 'title') THEN
    ALTER TABLE "convocatorias" DROP COLUMN "title";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'convocatorias' AND column_name = 'body') THEN
    ALTER TABLE "convocatorias" DROP COLUMN "body";
  END IF;
END $$;

-- Views table (tracks which models have seen each convocatoria)
CREATE TABLE IF NOT EXISTS "convocatoria_vistas" (
  "id"               TEXT         NOT NULL,
  "modelo_id"        TEXT         NOT NULL,
  "convocatoria_id"  TEXT         NOT NULL,
  "visto_at"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "convocatoria_vistas_pkey"       PRIMARY KEY ("id"),
  CONSTRAINT "convocatoria_vistas_unique"     UNIQUE ("modelo_id", "convocatoria_id"),
  CONSTRAINT "convocatoria_vistas_modelo_fk"  FOREIGN KEY ("modelo_id")       REFERENCES "models"("id")        ON DELETE CASCADE,
  CONSTRAINT "convocatoria_vistas_conv_fk"    FOREIGN KEY ("convocatoria_id") REFERENCES "convocatorias"("id") ON DELETE CASCADE
);
