-- Migration pour rendre organization_id NOT NULL sur toutes les tables métier
-- Cette migration doit être exécutée APRÈS avoir exécuté le script de migration des données
-- (backend/src/scripts/migrate-to-multitenant.ts)

-- Rendre organization_id NOT NULL sur toutes les tables métier
ALTER TABLE "public"."clients" ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "public"."compagnies" ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "public"."contrats" ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "public"."dossiers" ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "public"."incorporations" ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "public"."medias" ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "public"."notifications" ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "public"."paiements" ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "public"."partages" ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "public"."sinistres" ALTER COLUMN "organization_id" SET NOT NULL;
ALTER TABLE "public"."vehicules" ALTER COLUMN "organization_id" SET NOT NULL;
