-- Migration pour corriger les contraintes d'unicité des compagnies
-- Supprimer les anciennes contraintes uniques sur nom et sigle seuls
-- Créer les nouvelles contraintes uniques multi-tenant (nom + organization_id, sigle + organization_id)
-- Supprimer les anciennes contraintes uniques si elles existent
ALTER TABLE
    "public"."compagnies" DROP CONSTRAINT IF EXISTS "compagnies_nom_key";

ALTER TABLE
    "public"."compagnies" DROP CONSTRAINT IF EXISTS "compagnies_sigle_key";

-- Créer les nouvelles contraintes uniques multi-tenant si elles n'existent pas déjà
CREATE UNIQUE INDEX IF NOT EXISTS "idx_compagnies_nom_org_unique" ON "public"."compagnies"("nom", "organization_id");

CREATE UNIQUE INDEX IF NOT EXISTS "idx_compagnies_sigle_org_unique" ON "public"."compagnies"("sigle", "organization_id");