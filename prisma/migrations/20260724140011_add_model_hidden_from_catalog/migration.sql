-- Hide a model's profile from the public catalog / landing without deleting it
ALTER TABLE "models" ADD COLUMN IF NOT EXISTS "hidden_from_catalog" BOOLEAN NOT NULL DEFAULT false;
