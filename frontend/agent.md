# Agent — Architecture Frontend (Sirius)

Ce document décrit l’architecture **réelle** du frontend aujourd’hui (CRA/React) et met en avant les zones de **migration** (mix API backend vs Supabase direct, JS→TS, normalisation des endpoints).

## Règles (à appliquer strictement)

- **Tout nouveau fichier doit être en TypeScript**: `.ts` ou `.tsx` (pas de nouveau `.js` / `.jsx`).
- **Toute URL backend** doit passer par `src/config/api.ts` (pas d’URL hardcodée).
- **Tout accès Supabase** doit passer par `src/lib/supabaseClient` (pas d’anciens clients/keys en dur).

## Stack & exécution

- **Framework**: React (Create React App / `react-scripts`)
- **Routing**: `react-router-dom` (v7)
- **UI**: TailwindCSS + composants maison
- **Auth / Realtime / DB (côté client)**: `@supabase/supabase-js`
- **Data fetching**: fetch “maison” + hooks; dépendance `@tanstack/react-query` présente mais **pas encore intégrée** au runtime (pas de `QueryClientProvider`).

### Commandes

- `npm install`
- `npm start`
- `npm run build`

### Variables d’environnement

- **`REACT_APP_API_URL`**: URL du backend (`http://localhost:4000` par défaut)
- **`REACT_APP_SUPABASE_URL`**, **`REACT_APP_SUPABASE_ANON_KEY`**: Supabase client (obligatoires, sinon erreur au runtime)

## Organisation des dossiers (repères)

- **`src/App.tsx`**: point central du routing (lazy loading pages) + providers globaux
  - `ThemeProvider` → `AuthProvider` → `ProfileProvider`
  - Guards: `ProtectedRoute` (auth) + `RoleProtectedRoute` (roles)
- **`src/pages/*`**: pages (Dashboard, Clients, Compagnies, Contrats, etc.)
- **`src/components/*`**: UI + modals + tables + layout
- **`src/context/*`**: état global (auth, profil, thème)
- **`src/hooks/*`**: data hooks (compagnies, contrats, profile, dashboard…)
- **`src/config/api.ts`**: endpoints backend centralisés
- **`src/lib/supabaseClient.ts`**: client Supabase typé + helper `getUserProfile`
- **`src/lib/supabaseClient.js`**: wrapper de compat JS ré-exportant `supabaseClient.ts`
- **`src/types/supabase.ts`**: types DB (Tables/Views) pour le typage TS

## Flux principaux

### Auth & rôles

- **Auth**: `AuthProvider` maintient `user` via `supabase.auth.getSession()` + `onAuthStateChange`.
- **Profil**: `ProfileProvider` s’appuie sur `useProfile()` qui lit la table `public.profiles`.
- **RBAC**: `RoleProtectedRoute` autorise/filtre via `profile.role` (`admin`, `superadmin`, `gestionnaire`, …).

### Data layer (état actuel)

Il y a **deux sources** de données actuellement:

1. **Backend API (Express)** via `fetch()` + `src/config/api.ts`
   - Exemple: `useCompagniesData.ts` lit `/api/compagnies` et gère le wrapper `{ success, data }`.
   - Mutations: `useCompagniesMutations.ts` (POST/PUT/DELETE) via endpoints backend.
2. **Accès direct Supabase** via `supabase.from(...)`
   - Exemple: `useContratsData.ts` lit `contrats`, `clients`, `compagnies` + `vehicules` directement, et s’abonne au realtime.

### Realtime

Plusieurs hooks ouvrent des channels `postgres_changes` (compagnies, contrats, vehicules, clients).
Points d’attention:

- Bien **clean** les channels (`supabase.removeChannel(...)`) au unmount (déjà fait dans certains hooks).
- Éviter les rafraîchissements trop agressifs (re-fetch en cascade) si le volume augmente.

## Migration / dette technique identifiée

### 1) Incohérence des endpoints “contrats”

- Backend expose actuellement: **`/api/contrats`**
- Frontend référence dans `src/config/api.ts`: **`/api/contracts`**

Décision à prendre:

- Soit **tout FR** (`/contrats`)
- Soit **tout EN** (`/contracts`)

…et aligner backend + frontend + noms de modules/fichiers au même standard.

### 2) Mix “Backend API” vs “Supabase direct”

Aujourd’hui:

- **Compagnies**: via backend API (CRUD + validation côté backend).
- **Contrats/Clients**: beaucoup de logique côté frontend via Supabase direct.

Trajectoire possible (à choisir):

- **Option A (API-first)**: migrer progressivement les lectures/écritures Supabase (contrats, clients, etc.) vers le backend pour centraliser la logique métier, la validation, la pagination et l’audit.
- **Option B (Supabase-first)**: assumer l’accès direct, renforcer la sécurité via RLS + policies + RPC, et garder le backend surtout pour les cas “server-only”.

Dans les deux cas, éviter le “miroir” où la même entité est manipulée via deux chemins divergents.

### 3) React Query présent mais non utilisé

Le package `@tanstack/react-query` est installé, mais il n’y a pas encore:

- `QueryClient` / `QueryClientProvider`
- conventions de cache / invalidation

Si adopté, migrer hook par hook (commencer par list pages + mutations) pour stabiliser le cache et réduire les re-fetch.

### 4) Migration JS → TS (progressive)

Le code est mixte (`.jsx`, `.js`, `.tsx`, `.ts`).
Conserver une règle simple (et non négociable pour le futur):

- **Nouveau code = TypeScript** (`.ts` / `.tsx`).
- Toucher un fichier existant → opportunité de le **typer** et/ou d’extraire des types communs (sans “big bang”).

## Conventions recommandées (pour rester cohérent)

- **Config API**: toute URL backend doit passer par `src/config/api.ts` (pas d’URL hardcodée).
- **Supabase client**: importer depuis `src/lib/supabaseClient` (éviter les anciens fichiers/keys).
- **Auth**: les composants/pages protégés doivent passer par `ProtectedRoute` (+ `RoleProtectedRoute` si nécessaire).
- **Types DB**: utiliser `Tables<'table'>` depuis `src/types/supabase.ts` pour les listes simples.
