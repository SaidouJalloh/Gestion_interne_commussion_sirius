# Plan de Test - Migration Multi-Tenant

## 📋 Vue d'ensemble

Ce document décrit les tests à effectuer pour valider la migration vers l'architecture SaaS multi-tenant. Les tests sont organisés par catégorie et niveau de priorité.

---

## 🎯 Objectifs des tests

1. **Isolation des données** : Vérifier qu'un utilisateur ne peut accéder qu'aux données de ses organisations
2. **Migration des données** : Valider que toutes les données existantes sont correctement migrées
3. **Gestion des organisations** : Tester la création, modification et suppression d'organisations
4. **Gestion des membres** : Vérifier les invitations, rôles et permissions
5. **Sécurité** : Valider les politiques RLS et la validation backend
6. **Frontend** : Tester l'interface utilisateur et le changement d'organisation

---

## 🔴 Tests critiques (Priorité 1)

### 1. Tests de migration des données

#### 1.1 Migration script - Exécution complète
**Objectif** : Vérifier que le script de migration s'exécute sans erreur

**Prérequis** :
- Base de données avec données existantes
- Au moins 3 utilisateurs dans `profiles`
- Données dans au moins 5 tables métier différentes

**Étapes** :
1. Exécuter `npx ts-node backend/src/scripts/migrate-to-multitenant.ts`
2. Vérifier qu'aucune erreur n'est levée
3. Vérifier les logs de sortie

**Résultats attendus** :
- ✅ Organisation "Legacy Organization" créée
- ✅ Tous les utilisateurs de `profiles` ajoutés à `organization_members`
- ✅ Toutes les tables métier ont `organization_id` rempli
- ✅ Aucune donnée n'est perdue

**Commandes** :
```bash
cd backend
npx ts-node src/scripts/migrate-to-multitenant.ts
```

#### 1.2 Vérification post-migration
**Objectif** : Valider l'intégrité des données après migration

**Tests SQL à exécuter** :
```sql
-- Vérifier qu'il n'y a pas de organization_id NULL
SELECT COUNT(*) FROM clients WHERE organization_id IS NULL;
SELECT COUNT(*) FROM compagnies WHERE organization_id IS NULL;
SELECT COUNT(*) FROM contrats WHERE organization_id IS NULL;
-- Répéter pour toutes les tables métier

-- Vérifier que tous les utilisateurs sont membres
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM organization_members WHERE organization_id = (
  SELECT id FROM organizations WHERE slug = 'legacy-organization'
);

-- Vérifier l'unicité des contraintes
SELECT COUNT(*) FROM clients GROUP BY email, organization_id HAVING COUNT(*) > 1;
SELECT COUNT(*) FROM compagnies GROUP BY nom, organization_id HAVING COUNT(*) > 1;
```

**Résultats attendus** :
- ✅ Tous les compteurs `NULL` doivent être 0
- ✅ Nombre de membres = nombre de profiles
- ✅ Aucune violation de contrainte d'unicité

---

### 2. Tests d'isolation des données

#### 2.1 Isolation entre organisations
**Objectif** : Vérifier qu'un utilisateur ne voit que les données de ses organisations

**Scénario** :
1. Créer 2 organisations : `Org A` et `Org B`
2. Créer 2 utilisateurs : `User A` (membre de Org A) et `User B` (membre de Org B)
3. Créer des données dans chaque organisation

**Tests à effectuer** :

**Backend API** :
```bash
# User A ne doit voir que les données de Org A
curl -H "Authorization: Bearer <token_user_a>" \
     -H "X-Organization-Id: <org_a_id>" \
     http://localhost:4000/api/clients

# User A ne doit PAS voir les données de Org B
curl -H "Authorization: Bearer <token_user_a>" \
     -H "X-Organization-Id: <org_b_id>" \
     http://localhost:4000/api/clients
# Attendu : 403 Forbidden ou liste vide
```

**Frontend** :
1. Se connecter avec `User A`
2. Sélectionner `Org A` → Vérifier que les données s'affichent
3. Essayer de sélectionner `Org B` → Ne doit pas apparaître dans la liste
4. Vérifier que les données ne changent pas lors du changement d'organisation

**Résultats attendus** :
- ✅ User A ne voit que les données de Org A
- ✅ User A ne peut pas accéder à Org B (403 ou liste vide)
- ✅ Les données sont correctement filtrées par `organization_id`

#### 2.2 Tentative d'accès cross-tenant
**Objectif** : Vérifier que même en modifiant manuellement `organization_id`, l'accès est bloqué

**Tests** :
```bash
# Essayer de créer un client avec un organization_id différent
curl -X POST \
     -H "Authorization: Bearer <token_user_a>" \
     -H "X-Organization-Id: <org_a_id>" \
     -H "Content-Type: application/json" \
     -d '{"nom": "Test", "prenom": "User", "organization_id": "<org_b_id>"}' \
     http://localhost:4000/api/clients

# Attendu : Le backend doit ignorer organization_id dans le body
# et utiliser celui du header/tenant
```

**Résultats attendus** :
- ✅ Le backend ignore `organization_id` dans le body
- ✅ Le backend utilise toujours `req.tenant.organizationId`
- ✅ Impossible de créer/modifier des données dans une autre organisation

---

### 3. Tests de gestion des organisations

#### 3.1 Création d'organisation
**Objectif** : Vérifier la création d'une nouvelle organisation

**Étapes** :
1. Se connecter avec un utilisateur
2. Créer une nouvelle organisation via l'API ou le frontend
3. Vérifier que l'utilisateur devient automatiquement `owner`

**Tests API** :
```bash
curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"name": "Test Org", "slug": "test-org"}' \
     http://localhost:4000/api/organizations
```

**Vérifications** :
- ✅ Organisation créée avec succès
- ✅ Utilisateur créateur ajouté à `organization_members` avec rôle `owner`
- ✅ Slug unique (tester avec un slug existant → doit échouer)

#### 3.2 Liste des organisations
**Objectif** : Vérifier qu'un utilisateur voit uniquement ses organisations

**Tests** :
```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:4000/api/organizations
```

**Résultats attendus** :
- ✅ Liste uniquement des organisations où l'utilisateur est membre
- ✅ Statut `active` uniquement
- ✅ Rôle de l'utilisateur inclus dans la réponse

#### 3.3 Modification d'organisation
**Objectif** : Vérifier les permissions de modification

**Scénarios** :
- Owner peut modifier ✅
- Admin peut modifier ✅
- Member ne peut pas modifier ❌
- Viewer ne peut pas modifier ❌

**Tests** :
```bash
# Owner modifie
curl -X PUT \
     -H "Authorization: Bearer <token_owner>" \
     -H "X-Organization-Id: <org_id>" \
     -H "Content-Type: application/json" \
     -d '{"name": "New Name"}' \
     http://localhost:4000/api/organizations/<org_id>

# Member essaie de modifier → doit échouer
curl -X PUT \
     -H "Authorization: Bearer <token_member>" \
     -H "X-Organization-Id: <org_id>" \
     -H "Content-Type: application/json" \
     -d '{"name": "Hacked Name"}' \
     http://localhost:4000/api/organizations/<org_id>
# Attendu : 403 Forbidden
```

---

### 4. Tests de gestion des membres

#### 4.1 Invitation de membre
**Objectif** : Vérifier le processus d'invitation

**Étapes** :
1. Owner invite un utilisateur par `user_id`
2. Vérifier que l'entrée est créée avec `status: pending`
3. Utilisateur accepte l'invitation
4. Vérifier que `status` devient `active` et `joined_at` est rempli

**Tests API** :
```bash
# Inviter
curl -X POST \
     -H "Authorization: Bearer <token_owner>" \
     -H "X-Organization-Id: <org_id>" \
     -H "Content-Type: application/json" \
     -d '{"user_id": "<target_user_id>", "role": "member"}' \
     http://localhost:4000/api/organizations/<org_id>/members

# Accepter
curl -X POST \
     -H "Authorization: Bearer <token_target_user>" \
     http://localhost:4000/api/organizations/<org_id>/accept-invitation
```

**Résultats attendus** :
- ✅ Invitation créée avec `status: pending`
- ✅ Seul owner/admin peut inviter
- ✅ Acceptation change le statut à `active`
- ✅ Impossible d'inviter deux fois le même utilisateur (409 Conflict)

#### 4.2 Modification de rôle
**Objectif** : Vérifier les permissions de modification de rôle

**Scénarios** :
- Owner peut modifier tous les rôles ✅
- Admin peut modifier member/viewer mais pas owner ❌
- Member ne peut rien modifier ❌

**Tests** :
```bash
# Owner modifie le rôle d'un member
curl -X PUT \
     -H "Authorization: Bearer <token_owner>" \
     -H "X-Organization-Id: <org_id>" \
     -H "Content-Type: application/json" \
     -d '{"role": "admin"}' \
     http://localhost:4000/api/organizations/<org_id>/members/<member_id>/role

# Admin essaie de modifier un owner → doit échouer
curl -X PUT \
     -H "Authorization: Bearer <token_admin>" \
     -H "X-Organization-Id: <org_id>" \
     -H "Content-Type: application/json" \
     -d '{"role": "member"}' \
     http://localhost:4000/api/organizations/<org_id>/members/<owner_id>/role
# Attendu : 403 Forbidden
```

#### 4.3 Retrait de membre
**Objectif** : Vérifier le retrait de membres

**Scénarios** :
- Owner peut retirer n'importe qui sauf lui-même ✅
- Admin peut retirer member/viewer ✅
- Impossible de retirer le dernier owner ❌

**Tests** :
```bash
# Retirer un membre
curl -X DELETE \
     -H "Authorization: Bearer <token_owner>" \
     -H "X-Organization-Id: <org_id>" \
     http://localhost:4000/api/organizations/<org_id>/members/<member_id>
```

**Résultats attendus** :
- ✅ Membre marqué comme `inactive` (pas supprimé)
- ✅ Owner ne peut pas être retiré par quelqu'un d'autre
- ✅ Dernier owner ne peut pas être retiré

---

## 🟡 Tests importants (Priorité 2)

### 5. Tests de sécurité RLS

#### 5.1 Activation des politiques RLS
**Objectif** : Vérifier que RLS est activé sur toutes les tables

**Tests SQL** :
```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'clients', 'compagnies', 'contrats', 'dossiers', 
  'medias', 'paiements', 'sinistres', 'vehicules',
  'notifications', 'incorporations', 'partages',
  'organizations', 'organization_members'
);

-- Vérifier les politiques existantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Résultats attendus** :
- ✅ `rowsecurity = true` pour toutes les tables métier
- ✅ Politiques SELECT, INSERT, UPDATE, DELETE présentes
- ✅ Politiques utilisent `organization_members` pour vérifier l'accès

#### 5.2 Test d'accès direct SQL
**Objectif** : Vérifier que RLS bloque l'accès cross-tenant même en SQL direct

**Tests** :
```sql
-- Se connecter en tant que User A
SET ROLE authenticated;
SET request.jwt.claim.sub = '<user_a_id>';

-- Essayer d'accéder aux données de Org B
SELECT * FROM clients WHERE organization_id = '<org_b_id>';
-- Attendu : Liste vide (RLS bloque)

-- Essayer d'insérer dans Org B
INSERT INTO clients (nom, prenom, organization_id) 
VALUES ('Hacked', 'User', '<org_b_id>');
-- Attendu : Erreur ou insertion bloquée par RLS
```

---

### 6. Tests frontend

#### 6.1 Contexte d'organisation
**Objectif** : Vérifier le fonctionnement du contexte

**Tests** :
1. Se connecter → Vérifier que les organisations se chargent
2. Vérifier que l'organisation par défaut est sélectionnée
3. Vérifier que `localStorage` contient `currentOrganizationId`
4. Recharger la page → Vérifier que l'organisation est restaurée

**Points à vérifier** :
- ✅ `useOrganization()` retourne les bonnes données
- ✅ `currentOrganization` est défini après connexion
- ✅ `organizations` liste toutes les organisations de l'utilisateur
- ✅ `refreshOrganizations()` recharge correctement

#### 6.2 Sélecteur d'organisation
**Objectif** : Tester le changement d'organisation

**Étapes** :
1. Ouvrir le sélecteur dans la barre de navigation
2. Vérifier que toutes les organisations s'affichent
3. Sélectionner une autre organisation
4. Vérifier que les données se rechargent
5. Vérifier que `localStorage` est mis à jour

**Points à vérifier** :
- ✅ Dropdown s'ouvre/ferme correctement
- ✅ Liste des organisations complète
- ✅ Sélection change l'organisation active
- ✅ Les données se rechargent automatiquement
- ✅ Logo/avatar s'affiche si présent

#### 6.3 Page de gestion des organisations
**Objectif** : Tester la page `/organizations`

**Fonctionnalités à tester** :
- ✅ Liste des organisations
- ✅ Création d'organisation (modal)
- ✅ Affichage des membres
- ✅ Invitation de membre
- ✅ Modification de rôle
- ✅ Retrait de membre
- ✅ Gestion des erreurs (slug existant, permissions insuffisantes)

#### 6.4 Headers API
**Objectif** : Vérifier que toutes les requêtes incluent `X-Organization-Id`

**Tests** :
1. Ouvrir les DevTools → Network
2. Effectuer diverses actions (charger clients, créer contrat, etc.)
3. Vérifier que chaque requête contient :
   - `Authorization: Bearer <token>`
   - `X-Organization-Id: <org_id>`

**Points à vérifier** :
- ✅ `apiRequest()` ajoute automatiquement les headers
- ✅ `getApiHeaders()` récupère `currentOrganizationId` depuis localStorage
- ✅ Toutes les requêtes API incluent les headers

---

### 7. Tests d'intégration

#### 7.1 Workflow complet - Création d'organisation
**Scénario** :
1. Nouvel utilisateur se connecte
2. Crée une organisation
3. Invite des membres
4. Crée des données (clients, contrats)
5. Change d'organisation
6. Vérifie l'isolation

**Résultats attendus** :
- ✅ Tous les steps fonctionnent sans erreur
- ✅ Les données sont correctement isolées
- ✅ Les membres peuvent accéder aux données

#### 7.2 Workflow complet - Migration existante
**Scénario** :
1. Exécuter le script de migration
2. Utilisateur existant se connecte
3. Vérifie que ses données sont présentes
4. Vérifie qu'il est membre de "Legacy Organization"
5. Crée une nouvelle organisation
6. Migre certaines données vers la nouvelle organisation

**Résultats attendus** :
- ✅ Données existantes préservées
- ✅ Utilisateur peut créer de nouvelles organisations
- ✅ Isolation maintenue entre organisations

---

## 🟢 Tests complémentaires (Priorité 3)

### 8. Tests de performance

#### 8.1 Charge avec plusieurs organisations
**Objectif** : Vérifier que les performances ne se dégradent pas

**Tests** :
- Créer 10 organisations avec 100 utilisateurs chacune
- Chaque organisation a 1000 clients, 500 contrats
- Mesurer le temps de réponse des requêtes

**Métriques** :
- Temps de réponse < 200ms pour GET
- Temps de réponse < 500ms pour POST/PUT
- Pas de dégradation avec plusieurs organisations

#### 8.2 Index sur organization_id
**Objectif** : Vérifier que les index sont présents

**Tests SQL** :
```sql
-- Vérifier les index sur organization_id
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexdef LIKE '%organization_id%';
```

**Résultats attendus** :
- ✅ Index présent sur toutes les tables avec `organization_id`
- ✅ Index utilisés dans les requêtes (EXPLAIN ANALYZE)

---

### 9. Tests de cas limites

#### 9.1 Organisation sans membres
**Scénario** : Créer une organisation et retirer tous les membres

**Résultats attendus** :
- ✅ Dernier owner ne peut pas être retiré
- ✅ Organisation sans membres actifs ne peut pas être supprimée

#### 9.2 Utilisateur sans organisation
**Scénario** : Utilisateur qui n'est membre d'aucune organisation

**Résultats attendus** :
- ✅ Message d'erreur clair
- ✅ Possibilité de créer une organisation
- ✅ Pas de crash de l'application

#### 9.3 Données orphelines
**Scénario** : Supprimer une organisation avec des données

**Résultats attendus** :
- ✅ Cascade supprime les données associées
- ✅ Ou données marquées comme orphelines (selon la stratégie)

---

## 📝 Checklist de validation finale

### Backend
- [ ] Script de migration s'exécute sans erreur
- [ ] Toutes les données migrées correctement
- [ ] Isolation des données fonctionne
- [ ] Middleware tenant valide correctement
- [ ] Tous les services filtrent par `organization_id`
- [ ] Gestion des organisations fonctionne
- [ ] Gestion des membres fonctionne
- [ ] Permissions respectées (owner/admin/member/viewer)

### Frontend
- [ ] Contexte d'organisation fonctionne
- [ ] Sélecteur d'organisation fonctionne
- [ ] Page de gestion des organisations fonctionne
- [ ] Headers API ajoutés automatiquement
- [ ] Changement d'organisation recharge les données
- [ ] Gestion des erreurs (pas d'organisation, accès refusé)

### Sécurité
- [ ] RLS activé sur toutes les tables
- [ ] Politiques RLS fonctionnent correctement
- [ ] Backend valide l'appartenance à l'organisation
- [ ] Impossible d'accéder aux données d'une autre organisation
- [ ] Impossible de modifier `organization_id` manuellement

### Base de données
- [ ] Toutes les colonnes `organization_id` sont NOT NULL
- [ ] Contraintes d'unicité incluent `organization_id`
- [ ] Index sur `organization_id` présents
- [ ] Foreign keys correctes
- [ ] Cascade delete fonctionne

---

## 🚀 Procédure d'exécution des tests

### Environnement de test recommandé

1. **Base de données de test** :
   ```bash
   # Créer une base de données de test
   createdb sirius_test
   ```

2. **Variables d'environnement** :
   ```env
   DATABASE_URL=postgresql://user:pass@localhost:5432/sirius_test
   DIRECT_URL=postgresql://user:pass@localhost:5432/sirius_test
   ```

3. **Exécuter les migrations** :
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

4. **Exécuter le script de migration** :
   ```bash
   npx ts-node src/scripts/migrate-to-multitenant.ts
   ```

5. **Exécuter les tests** :
   - Tests manuels selon le plan ci-dessus
   - Tests automatisés (si disponibles)

---

## 📊 Rapport de test

Template de rapport à remplir :

```
Date : ___________
Testeur : ___________
Environnement : ___________

Résultats :
- Tests critiques : X/Y réussis
- Tests importants : X/Y réussis
- Tests complémentaires : X/Y réussis

Problèmes identifiés :
1. ___________
2. ___________

Actions correctives :
1. ___________
2. ___________
```

---

## 🔧 Outils de test recommandés

- **Postman/Insomnia** : Pour tester les APIs
- **pgAdmin/DBeaver** : Pour vérifier la base de données
- **Chrome DevTools** : Pour tester le frontend
- **SQL** : Pour vérifier RLS et données
- **Jest/Mocha** : Pour tests automatisés (optionnel)

---

## ⚠️ Points d'attention

1. **Ne jamais tester sur la production** : Utiliser toujours un environnement de test
2. **Sauvegarder avant migration** : Toujours faire un backup avant d'exécuter le script
3. **Vérifier RLS** : Les politiques RLS doivent être activées après migration
4. **Tester avec plusieurs utilisateurs** : Simuler des scénarios réels
5. **Vérifier les logs** : Surveiller les erreurs dans les logs backend/frontend

---

## 📚 Ressources

- Documentation Prisma : https://www.prisma.io/docs
- Documentation Supabase RLS : https://supabase.com/docs/guides/auth/row-level-security
- Plan de migration : `migration_vers_saas_multi-tenant_95aafa4e.plan.md`
