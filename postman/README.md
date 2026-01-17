# Collection Postman - Tests Multi-Tenant

Cette collection Postman contient tous les tests nécessaires pour valider la migration multi-tenant.

## 📦 Installation

1. **Importer la collection** :

   - Ouvrir Postman
   - Cliquer sur "Import"
   - Sélectionner `Sirius_MultiTenant_API.postman_collection.json`

2. **Importer l'environnement** :

   - Cliquer sur "Import"
   - Sélectionner `Sirius_MultiTenant_Environment.postman_environment.json`
   - Sélectionner cet environnement dans le menu déroulant en haut à droite

3. **Configurer les variables** :
   - Ouvrir l'environnement "Sirius Multi-Tenant - Local"
   - Modifier `base_url` avec votre URL Supabase (ex: `https://xxxxx.supabase.co`)
   - Modifier `supabase_anon_key` avec votre clé anonyme Supabase (trouvable dans Settings → API)
   - Modifier `api_url` si votre backend n'est pas sur `localhost:4000`
   - **IMPORTANT** : Sélectionner l'environnement dans le dropdown en haut à droite de Postman (actuellement "No environment")

## 🚀 Utilisation

### ⚠️ Configuration initiale IMPORTANTE

**Avant de commencer, assurez-vous de :**

1. **Sélectionner l'environnement** :

   - Dans Postman, en haut à droite, cliquer sur le dropdown "No environment"
   - Sélectionner "Sirius Multi-Tenant - Local"
   - ⚠️ Sans cela, les variables `{{base_url}}` et `{{supabase_anon_key}}` ne seront pas résolues

2. **Configurer les variables d'environnement** :

   - Cliquer sur l'icône "👁️" à côté de l'environnement pour voir les variables
   - Ou aller dans "Environments" → "Sirius Multi-Tenant - Local"
   - Remplir :
     - `base_url` : Votre URL Supabase (ex: `https://xxxxx.supabase.co`)
     - `supabase_anon_key` : Votre clé anonyme Supabase (Settings → API dans Supabase Dashboard)
     - `api_url` : `http://localhost:4000/api` (ou votre URL backend)

3. **Modifier les mots de passe** :
   - Ouvrir "Login - Super Admin"
   - Modifier le mot de passe dans le body de la requête

### Ordre d'exécution recommandé

1. **Authentification** :

   - Exécuter "Login - Super Admin" pour obtenir le token
   - Le token sera automatiquement sauvegardé dans les variables

2. **Organisations** :

   - "Créer une organisation" → Crée Org A
   - "Créer une deuxième organisation" → Crée Org B
   - "Lister mes organisations" → Vérifie que les deux apparaissent

3. **Membres** :

   - "Inviter un membre" → Ajoute un membre à Org A
   - "Lister les membres" → Vérifie la liste
   - "Modifier le rôle d'un membre" → Change le rôle
   - "Retirer un membre" → Retire le membre

4. **Isolation des données** :

   - "Créer un client dans Org A" → Crée un client
   - "Lister les clients de Org A" → Vérifie l'isolation
   - "Tenter d'accéder aux clients de Org B" → Doit échouer ou retourner vide

5. **Tests de contraintes** :
   - "Créer une compagnie avec nom unique"
   - "Créer la même compagnie dans Org B" → Doit réussir
   - "Tenter de créer la même compagnie dans Org A" → Doit échouer

## 🔍 Tests automatisés

Chaque requête contient des tests automatisés qui vérifient :

- ✅ Code de statut HTTP
- ✅ Structure de la réponse
- ✅ Valeurs attendues
- ✅ Isolation des données
- ✅ Permissions

Les résultats des tests s'affichent dans l'onglet "Test Results" de Postman.

## 📊 Exécution en lot

Pour exécuter tous les tests d'un coup :

1. Cliquer sur "..." à côté de la collection
2. Sélectionner "Run collection"
3. Vérifier que l'environnement correct est sélectionné
4. Cliquer sur "Run Sirius Multi-Tenant API"

## 🔧 Variables automatiques

Les variables suivantes sont automatiquement définies lors de l'exécution :

- `access_token` : Token d'authentification du super admin
- `user_id` : ID de l'utilisateur connecté
- `org_a_id` : ID de la première organisation créée
- `org_b_id` : ID de la deuxième organisation créée
- `client_a_id` : ID du premier client créé
- `member_id` : ID du membre invité
- `membership_id` : ID de l'entrée dans organization_members

## ⚠️ Notes importantes

1. **Ordre d'exécution** : Certaines requêtes dépendent des précédentes. Respecter l'ordre recommandé.

2. **Nettoyage** : Après les tests, vous pouvez supprimer les données de test manuellement ou créer une requête de nettoyage.

3. **Environnement de test** : Toujours utiliser un environnement de test, jamais la production.

4. **Tokens** : Les tokens expirent après un certain temps. Ré-exécuter "Login" si vous obtenez des erreurs 401.

## 📝 Personnalisation

Pour ajouter vos propres tests :

1. Ouvrir une requête
2. Aller dans l'onglet "Tests"
3. Ajouter vos assertions JavaScript

Exemple :

```javascript
pm.test("Mon test personnalisé", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData.data).to.have.property("mon_champ");
});
```

## 🐛 Dépannage

### Erreur 401 Unauthorized

- Vérifier que le token est valide
- Ré-exécuter "Login - Super Admin"

### Erreur 403 Forbidden

- Vérifier que l'utilisateur a les bonnes permissions
- Vérifier que `X-Organization-Id` est correct

### Variables non définies

- Vérifier que les requêtes précédentes ont été exécutées
- Vérifier que les tests ont bien sauvegardé les variables

### Organisation non trouvée

- Vérifier que les organisations ont été créées
- Vérifier que les IDs sont corrects dans les variables
