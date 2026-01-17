-- CreateEnum
CREATE TYPE "public"."OrganizationMemberRole" AS ENUM ('owner', 'admin', 'member', 'viewer');

-- CreateEnum
CREATE TYPE "public"."OrganizationMemberStatus" AS ENUM ('pending', 'active', 'inactive');

-- CreateTable
CREATE TABLE "public"."organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organization_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "public"."OrganizationMemberRole" NOT NULL DEFAULT 'member',
    "invited_by" UUID,
    "invited_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "joined_at" TIMESTAMPTZ(6),
    "status" "public"."OrganizationMemberStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- Add organization_id columns to existing tables (nullable for now)
ALTER TABLE "public"."clients" ADD COLUMN "organization_id" UUID;
ALTER TABLE "public"."compagnies" ADD COLUMN "organization_id" UUID;
ALTER TABLE "public"."contrats" ADD COLUMN "organization_id" UUID;
ALTER TABLE "public"."dossiers" ADD COLUMN "organization_id" UUID;
ALTER TABLE "public"."incorporations" ADD COLUMN "organization_id" UUID;
ALTER TABLE "public"."medias" ADD COLUMN "organization_id" UUID;
ALTER TABLE "public"."notifications" ADD COLUMN "organization_id" UUID;
ALTER TABLE "public"."paiements" ADD COLUMN "organization_id" UUID;
ALTER TABLE "public"."partages" ADD COLUMN "organization_id" UUID;
ALTER TABLE "public"."sinistres" ADD COLUMN "organization_id" UUID;
ALTER TABLE "public"."vehicules" ADD COLUMN "organization_id" UUID;

-- CreateIndex
CREATE INDEX "idx_organizations_slug" ON "public"."organizations"("slug");
CREATE INDEX "idx_organizations_created_by" ON "public"."organizations"("created_by");
CREATE INDEX "idx_org_members_organization_id" ON "public"."organization_members"("organization_id");
CREATE INDEX "idx_org_members_user_id" ON "public"."organization_members"("user_id");
CREATE INDEX "idx_org_members_status" ON "public"."organization_members"("status");
CREATE INDEX "idx_clients_organization_id" ON "public"."clients"("organization_id");
CREATE INDEX "idx_compagnies_organization_id" ON "public"."compagnies"("organization_id");
CREATE INDEX "idx_contrats_organization_id" ON "public"."contrats"("organization_id");
CREATE INDEX "idx_dossiers_organization_id" ON "public"."dossiers"("organization_id");
CREATE INDEX "idx_incorporations_organization_id" ON "public"."incorporations"("organization_id");
CREATE INDEX "idx_medias_organization_id" ON "public"."medias"("organization_id");
CREATE INDEX "idx_notifications_organization_id" ON "public"."notifications"("organization_id");
CREATE INDEX "idx_paiements_organization_id" ON "public"."paiements"("organization_id");
CREATE INDEX "idx_partages_organization_id" ON "public"."partages"("organization_id");
CREATE INDEX "idx_sinistres_organization_id" ON "public"."sinistres"("organization_id");
CREATE INDEX "idx_vehicules_organization_id" ON "public"."vehicules"("organization_id");

-- CreateUniqueConstraint
CREATE UNIQUE INDEX "idx_org_members_org_user_unique" ON "public"."organization_members"("organization_id", "user_id");
CREATE UNIQUE INDEX "organizations_slug_key" ON "public"."organizations"("slug");

-- AddForeignKey
ALTER TABLE "public"."organization_members" ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (temporarily nullable, will be made NOT NULL after data migration)
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."compagnies" ADD CONSTRAINT "compagnies_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."contrats" ADD CONSTRAINT "contrats_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."dossiers" ADD CONSTRAINT "dossiers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."incorporations" ADD CONSTRAINT "incorporations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."medias" ADD CONSTRAINT "medias_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."paiements" ADD CONSTRAINT "paiements_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."partages" ADD CONSTRAINT "partages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."sinistres" ADD CONSTRAINT "sinistres_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."vehicules" ADD CONSTRAINT "vehicules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
