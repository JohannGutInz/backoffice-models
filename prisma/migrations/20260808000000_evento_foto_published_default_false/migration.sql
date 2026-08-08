-- The app always creates EventoFoto rows unpublished (crearEventoFotoAction
-- in src/lib/actions.ts) — the DB default was still `true`, contradicting
-- that rule for any row inserted outside the app layer (manual SQL, future
-- scripts, etc). ALTER COLUMN ... SET DEFAULT is inherently idempotent.
ALTER TABLE "evento_fotos" ALTER COLUMN "published" SET DEFAULT false;
