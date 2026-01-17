# 📚 Guide Complet - Tests Postman Multi-Tenant

## 🎯 Vue d'ensemble

Ce guide vous accompagne étape par étape pour configurer et tester la collection Postman.

---

## 📦 Étape 1 : Importation

1. **Ouvrir Postman**
2. **Importer la collection** :
   - File → Import
   - Sélectionner `Sirius_MultiTenant_API.postman_collection.json`
3. **Importer l'environnement** :
   - File → Import
   - Sélectionner `Sirius_MultiTenant_Environment.postman_environment.json`

---

## ⚙️ Étape 2 : Configuration de l'environnement

### 2.1 Sélectionner l'environnement

**En haut à droite de Postman** :

1. Cliquez sur le dropdown **"No environment"**
2. Sélectionnez **"Sirius Multi-Tenant - Local"**
3. ✅ Le dropdown doit maintenant afficher "Sirius Multi-Tenant - Local"

### 2.2 Configurer les variables

**Cliquez sur l'icône 👁️** à côté du dropdown, puis remplissez :

| Variable            | Valeur                                     | Où trouver                                            |
| ------------------- | ------------------------------------------ | ----------------------------------------------------- |
| `base_url`          | `https://vyuhqagimyvfrkuhkfyy.supabase.co` | Déjà configuré ✅                                     |
| `supabase_anon_key` | `eyJhbGc...`                               | Supabase Dashboard → Settings → API → anon public key |
| `api_url`           | `http://localhost:4000/api`                | URL de votre backend                                  |

**Où trouver `supabase_anon_key`** :

1. https://supabase.com/dashboard
2. Votre projet → **Settings** (⚙️) → **API**
3. Copiez la clé **"anon public"** (pas service_role !)
4. Collez dans la variable `supabase_anon_key`

---

## 🔐 Étape 3 : Vérifier/Créer les utilisateurs

### Utilisateurs existants dans Supabase

D'après votre dashboard, vous avez :

- ✅ `superadmin@gmail.com`
- ✅ `admin@gmail.com`
- ✅ `gestionnaire@gmail.com`

### Vérifier le statut

Pour chaque utilisateur dans Supabase Dashboard :

1. Authentication → Users → Cliquez sur l'utilisateur
2. Vérifiez :
   - ✅ Email confirmé
   - ✅ Statut actif
   - ✅ Mot de passe défini

### Réinitialiser le mot de passe (si nécessaire)

1. Dans Supabase Dashboard → Authentication → Users
2. Cliquez sur `superadmin@gmail.com`
3. Cherchez **"Update password"** ou **"Reset password"**
4. Définissez : `MotDePasse123!`
5. Sauvegardez

---

## 🧪 Étape 4 : Tester la connexion

### 4.1 Préparer la requête "Login - Super Admin"

1. **Ouvrez la requête** "Login - Super Admin"
2. **Onglet "Params"** :
   - Vérifiez que `grant_type` = `password`
   - Case ☑ cochée
3. **Onglet "Headers"** :
   - `apikey` doit montrer votre vraie clé (pas `{{supabase_anon_key}}`)
   - `Content-Type` = `application/json`
4. **Onglet "Body"** :
   ```json
   {
     "email": "superadmin@gmail.com",
     "password": "Imamsaid@95"
   }
   ```
   - Le mot de passe est déjà configuré ✅

### 4.2 Vérifications finales

- [ ] Environnement sélectionné : "Sirius Multi-Tenant - Local"
- [ ] URL résolue : `https://vyuhqagimyvfrkuhkfyy.supabase.co/auth/v1/token`
- [ ] Header `apikey` avec vraie clé
- [ ] `grant_type` = `password`
- [ ] Email et mot de passe corrects dans le body

### 4.3 Envoyer la requête

1. **Cliquez sur "Send"**
2. **Résultat attendu** :
   - Status : `200 OK` ✅
   - Response avec `access_token`
   - Token sauvegardé automatiquement dans `access_token`

---

## 🚀 Étape 5 : Tester les autres requêtes

Une fois connecté avec succès :

### ⚠️ IMPORTANT : Ordre d'exécution

**Vous DEVEZ exécuter les requêtes dans cet ordre** :

1. ✅ **"Login - Super Admin"** → Obtient et sauvegarde le token
2. ✅ **"Créer une organisation"** → Utilise le token sauvegardé
3. ✅ **Autres requêtes** → Utilisent le token sauvegardé

### 5.1 Créer une organisation

**⚠️ Assurez-vous d'avoir exécuté "Login - Super Admin" d'abord !**

1. Ouvrez **"2. Organisations"** → **"Créer une organisation"**
2. **Vérifiez le header Authorization** :
   - Doit afficher : `Bearer eyJ...` (vrai token)
   - Ne doit PAS afficher : `Bearer {{access_token}}`
3. Si vous voyez `{{access_token}}`, exécutez d'abord "Login - Super Admin"
4. Cliquez sur "Send"
5. L'ID de l'organisation sera sauvegardé automatiquement

### 5.2 Tester l'isolation

1. Créez des données dans Org A
2. Essayez d'accéder avec Org B → Doit échouer ou retourner vide
3. Vérifiez que les données sont bien isolées

---

## 📋 Checklist complète

### Configuration initiale

- [ ] Collection importée
- [ ] Environnement importé
- [ ] Environnement sélectionné
- [ ] Variables configurées (`base_url`, `supabase_anon_key`, `api_url`)

### Authentification

- [ ] Utilisateurs vérifiés dans Supabase
- [ ] Mots de passe connus ou réinitialisés
- [ ] Requête "Login - Super Admin" fonctionne
- [ ] Token sauvegardé automatiquement

### Tests fonctionnels

- [ ] Création d'organisation fonctionne
- [ ] Isolation des données fonctionne
- [ ] Gestion des membres fonctionne
- [ ] Contraintes d'unicité fonctionnent

---

## 🐛 Dépannage

### Erreur "No API key found"

→ Environnement non sélectionné ou `supabase_anon_key` vide

### Erreur "Invalid API key"

→ Clé Supabase incorrecte ou mal copiée

### Erreur "unsupported_grant_type"

→ `grant_type` ≠ `password` dans l'onglet Params

### Erreur "Invalid login credentials"

→ Email ou mot de passe incorrect → Vérifier dans Supabase Dashboard

### Variables `{{...}}` non résolues

→ Environnement non sélectionné dans le dropdown

---

## 📚 Guides de référence

- `CONFIGURATION_RAPIDE.md` - Configuration en 2 minutes
- `CORRECTION_GRANT_TYPE.md` - Corriger grant_type
- `CORRECTION_IDENTIFIANTS.md` - Corriger les identifiants
- `VERIFICATION_UTILISATEURS_SUPABASE.md` - Vérifier les utilisateurs
- `CHECKLIST_FINALE.md` - Checklist avant de tester
- `IDENTIFIANTS_TEST.md` - Liste des identifiants

---

## ✅ Succès !

Une fois que "Login - Super Admin" fonctionne, vous pouvez :

1. Tester toutes les autres requêtes de la collection
2. Les tokens et IDs sont sauvegardés automatiquement
3. Les tests automatisés vérifient les résultats
4. Vous pouvez exécuter toute la collection d'un coup

Bon test ! 🚀
