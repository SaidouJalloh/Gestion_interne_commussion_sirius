# Variables d'environnement

Ce document liste toutes les variables d'environnement nécessaires pour l'application.

## Configuration requise

### Supabase (Obligatoire)

```env
REACT_APP_SUPABASE_URL=https://votre-projet.supabase.co
REACT_APP_SUPABASE_ANON_KEY=votre-cle-anon-publique
```

### API Backend (Optionnel)

```env
REACT_APP_API_URL=http://localhost:4000
```

Si cette variable n'est pas définie, l'application utilisera par défaut `http://localhost:4000`.

## Fichiers d'environnement

Créez les fichiers suivants à la racine du projet :

### `.env.local` (développement local)

```env
# Supabase
REACT_APP_SUPABASE_URL=https://votre-projet-dev.supabase.co
REACT_APP_SUPABASE_ANON_KEY=votre-cle-dev

# API Backend
REACT_APP_API_URL=http://localhost:4000
```

### `.env.production` (production)

```env
# Supabase
REACT_APP_SUPABASE_URL=https://votre-projet-prod.supabase.co
REACT_APP_SUPABASE_ANON_KEY=votre-cle-prod

# API Backend
REACT_APP_API_URL=https://api.votre-domaine.com
```

## Notes importantes

- ⚠️ **Ne jamais commiter les fichiers `.env` dans Git** (ils sont dans `.gitignore`)
- Les variables doivent commencer par `REACT_APP_` pour être accessibles dans React
- Redémarrer le serveur de développement après modification des variables d'environnement
- Les variables d'environnement sont injectées au moment du build

## Vérification

Pour vérifier que les variables sont correctement configurées :

```javascript
console.log("SUPABASE_URL:", process.env.REACT_APP_SUPABASE_URL);
console.log("API_URL:", process.env.REACT_APP_API_URL);
```
