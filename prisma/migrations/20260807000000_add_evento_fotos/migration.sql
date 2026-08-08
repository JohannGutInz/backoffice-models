-- Agency marketing photo gallery, feeding the public landing carousel
-- (EventosCarrusel via listEventosDestacados in src/lib/public-data.ts).
-- Distinct from model_media's PHOTO_EVENT type, which is a model's own event
-- photos inside their personal book.
CREATE TABLE IF NOT EXISTS "evento_fotos" (
    "id"         TEXT         NOT NULL,
    "url"        TEXT         NOT NULL,
    "alt"        TEXT         NOT NULL,
    "position"   INTEGER      NOT NULL DEFAULT 0,
    "published"  BOOLEAN      NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evento_fotos_pkey" PRIMARY KEY ("id")
);
