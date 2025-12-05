# Configuration API

Ce dossier contient les fichiers de configuration centralisés pour l'application.

## api.ts

Fichier de configuration centralisé pour tous les endpoints API de l'application.

### Utilisation

#### Importer l'URL de base

```typescript
import { API_BASE_URL } from '../config/api';

// Utiliser directement l'URL
const response = await fetch(`${API_BASE_URL}/api/custom-endpoint`);
```

#### Utiliser les endpoints prédéfinis

```typescript
import { API_ENDPOINTS } from '../config/api';

// Lister les compagnies
const response = await fetch(API_ENDPOINTS.compagnies.list);

// Obtenir une compagnie par ID
const response = await fetch(API_ENDPOINTS.compagnies.byId('123'));

// Créer une compagnie
const response = await fetch(API_ENDPOINTS.compagnies.create, {
  method: 'POST',
  body: JSON.stringify(data),
});

// Mettre à jour une compagnie
const response = await fetch(API_ENDPOINTS.compagnies.update('123'), {
  method: 'PUT',
  body: JSON.stringify(data),
});

// Supprimer une compagnie
const response = await fetch(API_ENDPOINTS.compagnies.delete('123'), {
  method: 'DELETE',
});
```

#### Utiliser les en-têtes par défaut

```typescript
import { DEFAULT_HEADERS } from '../config/api';

const response = await fetch(url, {
  headers: DEFAULT_HEADERS,
});
```

### Configuration de l'environnement

L'URL de base de l'API est configurée via la variable d'environnement `REACT_APP_API_URL`.

**Fichier `.env.development` (local) :**
```env
REACT_APP_API_URL=http://localhost:4000
```

**Fichier `.env.production` (production) :**
```env
REACT_APP_API_URL=https://api.votre-domaine.com
```

Si la variable n'est pas définie, l'application utilisera par défaut `http://localhost:4000`.

### Ajouter de nouveaux endpoints

Pour ajouter un nouveau groupe d'endpoints, modifiez le fichier `api.ts` :

```typescript
export const API_ENDPOINTS = {
  // ... endpoints existants
  
  // Nouveau groupe
  nouveauModule: {
    list: `${API_BASE_URL}/api/nouveau-module`,
    byId: (id: string) => `${API_BASE_URL}/api/nouveau-module/${id}`,
    create: `${API_BASE_URL}/api/nouveau-module`,
    update: (id: string) => `${API_BASE_URL}/api/nouveau-module/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/nouveau-module/${id}`,
  },
} as const;
```

### Bonnes pratiques

1. **Toujours utiliser la configuration centralisée** : Ne jamais coder en dur les URLs d'API dans le code.

2. **Typage TypeScript** : Les endpoints sont typés avec `as const` pour bénéficier de l'autocomplétion.

3. **Environnements multiples** : Utilisez différents fichiers `.env` pour les différents environnements.

4. **Cohérence** : Gardez la même structure pour tous les groupes d'endpoints (list, byId, create, update, delete).

### Exemple complet dans un hook

```typescript
import { useState, useEffect } from 'react';
import { API_ENDPOINTS, DEFAULT_HEADERS } from '../config/api';

export const useMonHook = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.compagnies.list, {
        headers: DEFAULT_HEADERS,
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Erreur:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, refetch: fetchData };
};
```

