# État d'avancement de la migration vers SaaS Multi-Tenant

## ✅ Complété

### Backend

1. **Schéma Prisma** ✅
   - Modèles `organizations` et `organization_members` ajoutés
   - Colonne `organization_id` ajoutée à tous les modèles métier (nullable pour l'instant)
   - Contraintes d'unicité mises à jour pour inclure `organization_id`
   - Preview feature `multiSchema` activée

2. **Migration SQL** ✅
   - Migration créée: `backend/prisma/migrations/20250101000000_add_multitenancy/migration.sql`
   - Tables `organizations` et `organization_members` créées
   - Colonnes `organization_id` ajoutées (nullable)
   - Index et contraintes FK créés

3. **Middleware Tenant** ✅
   - `backend/src/middlewares/tenant.middleware.ts` créé
   - Extraction de `organization_id` depuis header, JWT ou organisation par défaut
   - Validation de l'appartenance utilisateur à l'organisation
   - Middleware optionnel pour routes sans organisation requise

4. **Service Organisation** ✅
   - `backend/src/modules/organization/organization.service.ts` créé
   - CRUD complet pour organisations
   - Gestion des membres (inviter, modifier rôle, retirer)
   - Acceptation d'invitations

5. **Routes Organisation** ✅
   - `backend/src/modules/organization/organization.route.ts` créé
   - Routes API `/api/organizations` ajoutées
   - Intégré dans `backend/src/routes/index.ts`

6. **Services modifiés** ✅ (partiel)
   - `client.service.ts` - Filtré par `organization_id`
   - `client.controller.ts` - Utilise `req.tenant.organizationId`
   - `client.route.ts` - Middleware tenant ajouté
   - `company.service.ts` - Filtré par `organization_id`
   - `company.controller.ts` - Utilise `req.tenant.organizationId`
   - `company.route.ts` - Middleware tenant ajouté

7. **Script de migration** ✅
   - `backend/src/scripts/migrate-to-multitenant.ts` créé
   - Crée organisation par défaut "Legacy Organization"
   - Assigne utilisateurs existants
   - Met à jour tous les enregistrements avec `organization_id`

### Frontend

1. **Contexte Organisation** ✅
   - `frontend/src/context/OrganizationContext.tsx` créé
   - Gestion de l'organisation active
   - Stockage dans localStorage
   - Hook `useOrganization()` disponible

2. **API Client** ✅
   - `frontend/src/config/api.ts` mis à jour
   - Fonction `getApiHeaders()` pour ajouter `X-Organization-Id`
   - Import Supabase ajouté

3. **App.tsx** ✅
   - `OrganizationProvider` ajouté dans la hiérarchie des providers

## ⏳ En cours / À compléter

### Backend - Services restants

Les services suivants doivent être modifiés pour filtrer par `organization_id`:

- [ ] `contract.service.ts` et `contract.controller.ts`
- [ ] `dashboard.service.ts` et `dashboard.controller.ts`
- [ ] `payment.service.ts` et `payment.controller.ts`
- [ ] `folder.service.ts` et `folder.controller.ts`
- [ ] `media.service.ts` et `media.controller.ts`
- [ ] `vehicule.service.ts` et `vehicule.controller.ts`
- [ ] `incorporation.service.ts` et `incorporation.controller.ts`
- [ ] `notification.service.ts` et `notification.controller.ts`
- [ ] `search.service.ts` et `search.controller.ts`

**Pattern à suivre:**
1. Ajouter `organizationId: string` comme premier paramètre aux méthodes du service
2. Filtrer les requêtes Prisma avec `where: { organization_id: organizationId }`
3. Inclure `organization_id` dans les créations
4. Vérifier `organization_id` dans les updates/deletes
5. Utiliser `req.tenant?.organizationId` dans les controllers
6. Ajouter `router.use(tenantMiddleware)` dans les routes

### Frontend - Composants restants

- [ ] **OrganizationSelector** - Composant dropdown pour changer d'organisation
  - À créer dans `frontend/src/components/OrganizationSelector.tsx`
  - Afficher dans la barre de navigation (Layout)
  - Recharger les données lors du changement

- [ ] **Page Organizations** - Gestion des organisations
  - À créer dans `frontend/src/pages/Organizations.tsx`
  - Liste des organisations de l'utilisateur
  - Créer une nouvelle organisation
  - Gérer les membres (inviter, modifier rôles, retirer)
  - Paramètres de l'organisation

- [ ] **Mise à jour des hooks de données**
  - Tous les hooks qui font des requêtes doivent inclure `organization_id`
  - Exemples: `useCompagniesData.ts`, `useContratsData.ts`, etc.
  - Utiliser `getApiHeaders()` pour les requêtes API
  - Ajouter `organization_id` dans les requêtes Supabase directes

### Migrations et contraintes

- [ ] **Migration finale** - Rendre `organization_id` NOT NULL
  - Créer une nouvelle migration après avoir exécuté le script de migration
  - Mettre à jour les contraintes d'unicité pour inclure `organization_id`
  - Exemple: `@@unique([nom, organization_id])` pour compagnies

- [ ] **RLS Policies** - Row Level Security sur Supabase
  - Créer des politiques RLS pour toutes les tables métier
  - Filtrer par `organization_id` basé sur `organization_members`
  - Exemple fourni dans le plan

## 📋 Prochaines étapes

1. **Exécuter la migration SQL**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

2. **Exécuter le script de migration des données**
   ```bash
   cd backend
   npx ts-node src/scripts/migrate-to-multitenant.ts
   ```

3. **Modifier les services restants** (suivre le pattern client/company)

4. **Créer les composants frontend** (OrganizationSelector, page Organizations)

5. **Mettre à jour les hooks frontend** pour inclure `organization_id`

6. **Créer la migration finale** pour rendre `organization_id` NOT NULL

7. **Implémenter les politiques RLS** sur Supabase

8. **Tests** - Vérifier l'isolation des données entre organisations

## 🔍 Notes importantes

- Les colonnes `organization_id` sont actuellement **nullable** pour permettre la migration
- Après la migration des données, créer une migration pour les rendre NOT NULL
- Le middleware `tenantMiddleware` doit être ajouté à toutes les routes métier
- Les routes d'organisation utilisent `optionalTenantMiddleware` car elles n'exigent pas d'organisation active
- Le frontend doit toujours envoyer le header `X-Organization-Id` dans les requêtes API

## 🐛 Problèmes connus

- Les relations cross-schema (auth.users ↔ public.organizations) ne sont pas supportées par Prisma
  - Solution: Utiliser des UUIDs sans FK pour `created_by` et `user_id` dans `organization_members`
  - Valider manuellement dans le code si nécessaire

- L'invitation par email nécessite Supabase Admin API
  - Pour l'instant, `inviteMemberByUserId` est disponible
  - À améliorer avec intégration Supabase Admin API
