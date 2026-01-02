-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "auth"."aal_level" AS ENUM ('aal1', 'aal2', 'aal3');

-- CreateEnum
CREATE TYPE "auth"."code_challenge_method" AS ENUM ('s256', 'plain');

-- CreateEnum
CREATE TYPE "auth"."factor_status" AS ENUM ('unverified', 'verified');

-- CreateEnum
CREATE TYPE "auth"."factor_type" AS ENUM ('totp', 'webauthn', 'phone');

-- CreateEnum
CREATE TYPE "auth"."oauth_authorization_status" AS ENUM ('pending', 'approved', 'denied', 'expired');

-- CreateEnum
CREATE TYPE "auth"."oauth_client_type" AS ENUM ('public', 'confidential');

-- CreateEnum
CREATE TYPE "auth"."oauth_registration_type" AS ENUM ('dynamic', 'manual');

-- CreateEnum
CREATE TYPE "auth"."oauth_response_type" AS ENUM ('code');

-- CreateEnum
CREATE TYPE "auth"."one_time_token_type" AS ENUM ('confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token');

-- CreateTable
CREATE TABLE "auth"."users" (
    "instance_id" UUID,
    "id" UUID NOT NULL,
    "aud" VARCHAR(255),
    "role" VARCHAR(255),
    "email" VARCHAR(255),
    "encrypted_password" VARCHAR(255),
    "email_confirmed_at" TIMESTAMPTZ(6),
    "invited_at" TIMESTAMPTZ(6),
    "confirmation_token" VARCHAR(255),
    "confirmation_sent_at" TIMESTAMPTZ(6),
    "recovery_token" VARCHAR(255),
    "recovery_sent_at" TIMESTAMPTZ(6),
    "email_change_token_new" VARCHAR(255),
    "email_change" VARCHAR(255),
    "email_change_sent_at" TIMESTAMPTZ(6),
    "last_sign_in_at" TIMESTAMPTZ(6),
    "raw_app_meta_data" JSONB,
    "raw_user_meta_data" JSONB,
    "is_super_admin" BOOLEAN,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "phone" TEXT,
    "phone_confirmed_at" TIMESTAMPTZ(6),
    "phone_change" TEXT DEFAULT '',
    "phone_change_token" VARCHAR(255) DEFAULT '',
    "phone_change_sent_at" TIMESTAMPTZ(6),
    "confirmed_at" TIMESTAMPTZ(6),
    "email_change_token_current" VARCHAR(255) DEFAULT '',
    "email_change_confirm_status" SMALLINT DEFAULT 0,
    "banned_until" TIMESTAMPTZ(6),
    "reauthentication_token" VARCHAR(255) DEFAULT '',
    "reauthentication_sent_at" TIMESTAMPTZ(6),
    "is_sso_user" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(6),
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "type_client" TEXT NOT NULL,
    "adresse" TEXT,
    "ville" TEXT,
    "code_postal" TEXT,
    "notes" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."compagnies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nom" TEXT NOT NULL,
    "sigle" TEXT NOT NULL,
    "logo_url" TEXT,
    "description" TEXT,
    "taux_commissions" JSONB NOT NULL DEFAULT '{}',
    "actif" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "lien_souscription" TEXT,

    CONSTRAINT "compagnies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contrats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "client_id" UUID NOT NULL,
    "compagnie_id" UUID NOT NULL,
    "type_contrat" VARCHAR(100) NOT NULL,
    "prime_nette" DECIMAL(12,2) NOT NULL,
    "montant_accessoire" DECIMAL(12,2) DEFAULT 0,
    "taux_commission" DECIMAL(5,4) NOT NULL,
    "commission" DECIMAL(12,2) NOT NULL,
    "date_effet" DATE NOT NULL,
    "date_expiration" DATE NOT NULL,
    "statut" VARCHAR(20) DEFAULT 'actif',
    "fractionnement" VARCHAR(20) DEFAULT 'annuel',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "evacuation_sanitaire" DECIMAL,
    "prime_regulation" DECIMAL,
    "immatriculation" TEXT,
    "prime_ttc" DECIMAL DEFAULT 0,
    "fga" DECIMAL DEFAULT 0,
    "taxes" DECIMAL DEFAULT 0,
    "is_flotte" BOOLEAN DEFAULT false,
    "prime_ttc_initial" DECIMAL(12,2),
    "montant_incorporations" DECIMAL(12,2) DEFAULT 0,
    "nombre_incorporations" INTEGER DEFAULT 0,

    CONSTRAINT "contrats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dossiers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nom" VARCHAR(255) NOT NULL,
    "parent_id" UUID,
    "contrat_id" UUID,
    "client_id" UUID,
    "couleur" VARCHAR(20) DEFAULT 'gray',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dossiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."incorporations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contrat_id" UUID,
    "date_effet" DATE NOT NULL,
    "nombre_elements" INTEGER NOT NULL,
    "prime_ttc" DECIMAL(12,2) NOT NULL,
    "fga" DECIMAL(12,2) NOT NULL,
    "taxes" DECIMAL(12,2) NOT NULL,
    "prime_nette" DECIMAL(12,2) NOT NULL,
    "commission" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "montant_accessoire" DECIMAL(12,2) DEFAULT 0,
    "date_expiration" DATE,

    CONSTRAINT "incorporations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medias" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nom" VARCHAR(255) NOT NULL,
    "type_fichier" VARCHAR(100),
    "taille" BIGINT,
    "url" TEXT NOT NULL,
    "dossier_id" UUID,
    "contrat_id" UUID,
    "client_id" UUID,
    "supprime" BOOLEAN DEFAULT false,
    "date_suppression" TIMESTAMPTZ(6),
    "notes" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "contrat_id" UUID,
    "statut" TEXT DEFAULT 'non_lu',
    "priorite" TEXT DEFAULT 'normale',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."paiements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contrat_id" UUID NOT NULL,
    "type_paiement" VARCHAR(50) NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "date_paiement" DATE NOT NULL,
    "mode_paiement" VARCHAR(50) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."partages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "media_id" UUID,
    "email_partage" VARCHAR(255) NOT NULL,
    "permission" VARCHAR(50) NOT NULL DEFAULT 'view',
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "partages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "nom" TEXT,
    "prenom" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "avatar_url" TEXT,
    "telephone" TEXT,
    "actif" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles_backup_final" (
    "id" UUID,
    "email" TEXT,
    "nom" TEXT,
    "prenom" TEXT,
    "role" TEXT,
    "avatar_url" TEXT,
    "telephone" TEXT,
    "actif" BOOLEAN,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6)
);

-- CreateTable
CREATE TABLE "public"."sinistres" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "numero_sinistre" TEXT NOT NULL,
    "client_id" UUID NOT NULL,
    "contrat_id" UUID NOT NULL,
    "type_sinistre" TEXT NOT NULL,
    "date_sinistre" DATE NOT NULL,
    "heure_sinistre" TIME(6),
    "lieu_sinistre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "circonstances" TEXT,
    "dommages_corporels" BOOLEAN DEFAULT false,
    "nombre_blesses" INTEGER DEFAULT 0,
    "dommages_materiels" BOOLEAN DEFAULT false,
    "montant_estime" DECIMAL,
    "vehicule_id" UUID,
    "vehicule_roulant" BOOLEAN,
    "tiers_impliques" JSONB DEFAULT '[]',
    "statut" TEXT DEFAULT 'recu',
    "priorite" TEXT DEFAULT 'normale',
    "gestionnaire_id" UUID,
    "compagnie_id" UUID,
    "montant_indemnise" DECIMAL,
    "date_paiement_indemnite" DATE,
    "date_reception" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "date_envoi_compagnie" TIMESTAMPTZ(6),
    "date_expertise" TIMESTAMPTZ(6),
    "date_traitement" TIMESTAMPTZ(6),
    "date_cloture" TIMESTAMPTZ(6),
    "notes_internes" TEXT,
    "motif_rejet" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sinistres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sinistres_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sinistre_id" UUID NOT NULL,
    "nom_fichier" TEXT NOT NULL,
    "type_document" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "taille" BIGINT,
    "mime_type" TEXT,
    "soumis_par" TEXT NOT NULL,
    "soumis_par_id" UUID,
    "valide" BOOLEAN DEFAULT false,
    "valide_par" UUID,
    "date_validation" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sinistres_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sinistres_historique" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sinistre_id" UUID NOT NULL,
    "ancien_statut" TEXT,
    "nouveau_statut" TEXT NOT NULL,
    "commentaire" TEXT,
    "modifie_par" UUID,
    "modifie_par_nom" TEXT,
    "visible_client" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sinistres_historique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sinistres_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sinistre_id" UUID NOT NULL,
    "expediteur" TEXT NOT NULL,
    "expediteur_id" UUID,
    "expediteur_nom" TEXT,
    "message" TEXT NOT NULL,
    "lu" BOOLEAN DEFAULT false,
    "date_lecture" TIMESTAMPTZ(6),
    "fichiers" JSONB DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sinistres_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vehicules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contrat_id" UUID NOT NULL,
    "immatriculation" TEXT NOT NULL,
    "marque" TEXT,
    "modele" TEXT,
    "annee" INTEGER,
    "valeur_venale" DECIMAL,
    "puissance_fiscale" INTEGER,
    "numero_chassis" TEXT,
    "date_mise_circulation" DATE,
    "usage" TEXT,
    "notes" TEXT,
    "actif" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "auth"."users"("phone");

-- CreateIndex
CREATE INDEX "users_instance_id_idx" ON "auth"."users"("instance_id");

-- CreateIndex
CREATE INDEX "users_is_anonymous_idx" ON "auth"."users"("is_anonymous");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "public"."clients"("email");

-- CreateIndex
CREATE INDEX "idx_clients_created_at" ON "public"."clients"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_clients_email" ON "public"."clients"("email");

-- CreateIndex
CREATE INDEX "idx_clients_nom" ON "public"."clients"("nom");

-- CreateIndex
CREATE INDEX "idx_clients_prenom" ON "public"."clients"("prenom");

-- CreateIndex
CREATE INDEX "idx_clients_telephone" ON "public"."clients"("telephone");

-- CreateIndex
CREATE INDEX "idx_clients_type" ON "public"."clients"("type_client");

-- CreateIndex
CREATE UNIQUE INDEX "compagnies_nom_key" ON "public"."compagnies"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "compagnies_sigle_key" ON "public"."compagnies"("sigle");

-- CreateIndex
CREATE INDEX "idx_compagnies_actif" ON "public"."compagnies"("actif");

-- CreateIndex
CREATE INDEX "idx_compagnies_nom" ON "public"."compagnies"("nom");

-- CreateIndex
CREATE INDEX "idx_compagnies_sigle" ON "public"."compagnies"("sigle");

-- CreateIndex
CREATE INDEX "idx_contrats_client_created" ON "public"."contrats"("client_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_contrats_client_id" ON "public"."contrats"("client_id");

-- CreateIndex
CREATE INDEX "idx_contrats_client_statut" ON "public"."contrats"("client_id", "statut");

-- CreateIndex
CREATE INDEX "idx_contrats_compagnie_id" ON "public"."contrats"("compagnie_id");

-- CreateIndex
CREATE INDEX "idx_contrats_compagnie_type" ON "public"."contrats"("compagnie_id", "type_contrat");

-- CreateIndex
CREATE INDEX "idx_contrats_created_at" ON "public"."contrats"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_contrats_date_effet" ON "public"."contrats"("date_effet" DESC);

-- CreateIndex
CREATE INDEX "idx_contrats_date_expiration" ON "public"."contrats"("date_expiration");

-- CreateIndex
CREATE INDEX "idx_contrats_fractionnement" ON "public"."contrats"("fractionnement");

-- CreateIndex
CREATE INDEX "idx_contrats_statut" ON "public"."contrats"("statut");

-- CreateIndex
CREATE INDEX "idx_contrats_statut_date" ON "public"."contrats"("statut", "date_expiration");

-- CreateIndex
CREATE INDEX "idx_contrats_statut_date_effet" ON "public"."contrats"("statut", "date_effet" DESC);

-- CreateIndex
CREATE INDEX "idx_contrats_type_contrat" ON "public"."contrats"("type_contrat");

-- CreateIndex
CREATE INDEX "idx_contrats_type_statut" ON "public"."contrats"("type_contrat", "statut");

-- CreateIndex
CREATE INDEX "idx_contrats_updated_at" ON "public"."contrats"("updated_at" DESC);

-- CreateIndex
CREATE INDEX "idx_dossiers_client" ON "public"."dossiers"("client_id");

-- CreateIndex
CREATE INDEX "idx_dossiers_contrat" ON "public"."dossiers"("contrat_id");

-- CreateIndex
CREATE INDEX "idx_dossiers_parent" ON "public"."dossiers"("parent_id");

-- CreateIndex
CREATE INDEX "idx_incorporations_contrat" ON "public"."incorporations"("contrat_id");

-- CreateIndex
CREATE INDEX "idx_incorporations_date" ON "public"."incorporations"("date_effet");

-- CreateIndex
CREATE INDEX "idx_medias_client" ON "public"."medias"("client_id");

-- CreateIndex
CREATE INDEX "idx_medias_contrat" ON "public"."medias"("contrat_id");

-- CreateIndex
CREATE INDEX "idx_medias_dossier" ON "public"."medias"("dossier_id");

-- CreateIndex
CREATE INDEX "idx_medias_supprime" ON "public"."medias"("supprime");

-- CreateIndex
CREATE INDEX "idx_notifications_created" ON "public"."notifications"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_notifications_created_at" ON "public"."notifications"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_notifications_statut" ON "public"."notifications"("statut");

-- CreateIndex
CREATE INDEX "idx_notifications_type" ON "public"."notifications"("type");

-- CreateIndex
CREATE INDEX "idx_paiements_contrat" ON "public"."paiements"("contrat_id");

-- CreateIndex
CREATE INDEX "idx_paiements_contrat_id" ON "public"."paiements"("contrat_id");

-- CreateIndex
CREATE INDEX "idx_paiements_date" ON "public"."paiements"("date_paiement" DESC);

-- CreateIndex
CREATE INDEX "idx_paiements_type" ON "public"."paiements"("type_paiement");

-- CreateIndex
CREATE INDEX "idx_partages_email" ON "public"."partages"("email_partage");

-- CreateIndex
CREATE INDEX "idx_partages_media_id" ON "public"."partages"("media_id");

-- CreateIndex
CREATE UNIQUE INDEX "sinistres_numero_sinistre_key" ON "public"."sinistres"("numero_sinistre");

-- CreateIndex
CREATE INDEX "idx_sinistres_client_id" ON "public"."sinistres"("client_id");

-- CreateIndex
CREATE INDEX "idx_sinistres_compagnie_id" ON "public"."sinistres"("compagnie_id");

-- CreateIndex
CREATE INDEX "idx_sinistres_contrat_id" ON "public"."sinistres"("contrat_id");

-- CreateIndex
CREATE INDEX "idx_sinistres_date_sinistre" ON "public"."sinistres"("date_sinistre" DESC);

-- CreateIndex
CREATE INDEX "idx_sinistres_numero" ON "public"."sinistres"("numero_sinistre");

-- CreateIndex
CREATE INDEX "idx_sinistres_statut" ON "public"."sinistres"("statut");

-- CreateIndex
CREATE INDEX "idx_sinistres_documents_sinistre_id" ON "public"."sinistres_documents"("sinistre_id");

-- CreateIndex
CREATE INDEX "idx_sinistres_historique_sinistre_id" ON "public"."sinistres_historique"("sinistre_id");

-- CreateIndex
CREATE INDEX "idx_sinistres_messages_sinistre_id" ON "public"."sinistres_messages"("sinistre_id");

-- CreateIndex
CREATE INDEX "idx_vehicules_contrat_id" ON "public"."vehicules"("contrat_id");

-- CreateIndex
CREATE INDEX "idx_vehicules_immatriculation" ON "public"."vehicules"("immatriculation");

-- CreateIndex
CREATE INDEX "idx_vehicules_marque_modele" ON "public"."vehicules"("marque", "modele");

-- AddForeignKey
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."compagnies" ADD CONSTRAINT "compagnies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."contrats" ADD CONSTRAINT "contrats_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."contrats" ADD CONSTRAINT "contrats_compagnie_id_fkey" FOREIGN KEY ("compagnie_id") REFERENCES "public"."compagnies"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."dossiers" ADD CONSTRAINT "dossiers_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."dossiers" ADD CONSTRAINT "dossiers_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "public"."contrats"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."dossiers" ADD CONSTRAINT "dossiers_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."dossiers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."incorporations" ADD CONSTRAINT "incorporations_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "public"."contrats"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."incorporations" ADD CONSTRAINT "incorporations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."medias" ADD CONSTRAINT "medias_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."medias" ADD CONSTRAINT "medias_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "public"."contrats"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."medias" ADD CONSTRAINT "medias_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "public"."dossiers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "public"."contrats"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."paiements" ADD CONSTRAINT "paiements_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "public"."contrats"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."partages" ADD CONSTRAINT "partages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."partages" ADD CONSTRAINT "partages_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."medias"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sinistres" ADD CONSTRAINT "sinistres_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sinistres" ADD CONSTRAINT "sinistres_compagnie_id_fkey" FOREIGN KEY ("compagnie_id") REFERENCES "public"."compagnies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sinistres" ADD CONSTRAINT "sinistres_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "public"."contrats"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sinistres" ADD CONSTRAINT "sinistres_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sinistres" ADD CONSTRAINT "sinistres_gestionnaire_id_fkey" FOREIGN KEY ("gestionnaire_id") REFERENCES "public"."profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sinistres" ADD CONSTRAINT "sinistres_vehicule_id_fkey" FOREIGN KEY ("vehicule_id") REFERENCES "public"."vehicules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sinistres_documents" ADD CONSTRAINT "sinistres_documents_sinistre_id_fkey" FOREIGN KEY ("sinistre_id") REFERENCES "public"."sinistres"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sinistres_documents" ADD CONSTRAINT "sinistres_documents_valide_par_fkey" FOREIGN KEY ("valide_par") REFERENCES "public"."profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sinistres_historique" ADD CONSTRAINT "sinistres_historique_modifie_par_fkey" FOREIGN KEY ("modifie_par") REFERENCES "public"."profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sinistres_historique" ADD CONSTRAINT "sinistres_historique_sinistre_id_fkey" FOREIGN KEY ("sinistre_id") REFERENCES "public"."sinistres"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sinistres_messages" ADD CONSTRAINT "sinistres_messages_sinistre_id_fkey" FOREIGN KEY ("sinistre_id") REFERENCES "public"."sinistres"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."vehicules" ADD CONSTRAINT "vehicules_contrat_id_fkey" FOREIGN KEY ("contrat_id") REFERENCES "public"."contrats"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
