---
name: Migration API Contracts/Clients
overview: Créer les APIs backend manquantes pour `clients` et `contracts` en reproduisant strictement les endpoints attendus par le frontend, puis migrer le frontend vers un accès 100% backend (suppression des accès/realtime Supabase pour ces modules), en prenant `Company` comme référence.
todos:
  - id: backend-clients-crud
    content: Créer le module backend `client` (CRUD complet) et l’exposer sur `/api/clients`.
    status: completed
  - id: backend-contracts-crud
    content: Aligner `contract` sur `/api/contracts` (sans alias) et implémenter CRUD + relations (`clients`, `compagnies`, `vehicules`).
    status: completed
    dependencies:
      - backend-clients-crud
  - id: backend-dashboard-endpoint
    content: Ajouter `GET /api/dashboard` qui renvoie stats/charts/activités récentes en un seul payload.
    status: completed
    dependencies:
      - backend-contracts-crud
      - backend-clients-crud
  - id: backend-payments-crud
    content: Créer le module backend `payments` (CRUD) sur `/api/payments` (+ filtres query si nécessaire).
    status: completed
    dependencies:
      - backend-contracts-crud
  - id: backend-media-folders-crud
    content: Créer les modules backend `media` et `folders` (CRUD) + endpoints `trash/restore` pour medias (upload reste côté frontend).
    status: completed
    dependencies:
      - backend-clients-crud
      - backend-contracts-crud
  - id: frontend-api-endpoints
    content: Étendre `frontend/src/config/api.ts` avec les endpoints (anglais) pour `dashboard`, `payments`, `media`, `folders` (+ option souscription).
    status: completed
    dependencies:
      - backend-dashboard-endpoint
      - backend-payments-crud
      - backend-media-folders-crud
  - id: frontend-migrate-dashboard
    content: Remplacer `useDashboardData.js` par `useDashboardData.ts` (API `GET /api/dashboard`) et supprimer realtime Supabase.
    status: completed
    dependencies:
      - frontend-api-endpoints
  - id: frontend-migrate-payments
    content: Migrer `Paiements.jsx` vers API backend via hooks anglais `usePaymentsData.ts`/`usePaymentsMutations.ts`.
    status: completed
    dependencies:
      - frontend-api-endpoints
  - id: frontend-migrate-media
    content: "Migrer `Medias.jsx` : upload reste Storage côté client, mais listes/rename/move/trash/restore passent par API via hooks anglais `useMedia*`/`useFolders*`."
    status: completed
    dependencies:
      - frontend-api-endpoints
  - id: frontend-migrate-souscription
    content: Migrer `Souscription.jsx` pour charger les compagnies via backend API (filtrées pour lien de souscription).
    status: completed
    dependencies:
      - frontend-api-endpoints
---

# Migration API (module par module)

## Constat (source de vérité = frontend)

- Les endpoints “actuels” consommés par le frontend sont centralisés dans [`frontend/src/config/api.ts`](frontend/src/config/api.ts) (déjà : `compagnies`, `clients`, `contracts`).
- Plusieurs écrans utilisent encore Supabase direct et nécessitent de **nouveaux endpoints** côté backend :
- Dashboard (hook `useDashboardData`)
- Medias (tables `medias`, `dossiers` + Supabase Storage)
- Paiements (table `paiements`)
- Souscription (lecture compagnies actives avec `lien_souscription`)
- Exception actée : **Gestion des utilisateurs** (`GestionUtilisateurs.jsx`) **reste en Supabase direct** pour l’instant.

## Décisions confirmées

- **Endpoints backend identiques à ceux attendus côté frontend** (cf. `API_ENDPOINTS`).
- **Pas d’alias** `/api/contrats` : migration stricte vers `/api/contracts`.
- **Suppression des subscriptions realtime Supabase** côté frontend pour les modules migrés.
- **Upload fichiers** : on garde l’upload direct via Supabase Storage côté frontend ; le backend gère uniquement la DB (CRUD medias/folders).
- **Convention front** : tout nouveau code de migration côté frontend porte un **nom en anglais** (nouveaux hooks/fichiers).

## Endpoints cibles (anglais)

### Déjà prévus par le frontend

- `GET/POST/PUT/DELETE /api/clients`
- `GET/POST/PUT/DELETE /api/contracts`
- `GET/POST/PUT/DELETE /api/compagnies`

### À ajouter (validé)

- **Dashboard** : `GET /api/dashboard`
- **Payments** : `GET/POST/PUT/DELETE /api/payments` + `GET /api/payments/:id`
- **Folders** : `GET/POST/PUT/DELETE /api/folders` + `GET /api/folders/:id`
- **Media** : `GET/POST/PUT/DELETE /api/media` + `GET /api/media/:id`
- Trash/restore : `PATCH /api/media/:id/trash` + `PATCH /api/media/:id/restore`
- **Souscription** : réutiliser `compagnies` via filtres côté backend (recommandé) :
- `GET /api/compagnies?active=true&hasSubscriptionLink=true`
- (ou endpoint dédié) `GET /api/companies/subscription`

## Étapes Backend (pattern `Company`)

1) **Aligner/compléter `clients` + `contracts`**

- Modifier [`backend/src/routes/index.ts`](backend/src/routes/index.ts) : monter `contractRouter` sur `/contracts` et ajouter le router `clients`.
- Implémenter `backend/src/modules/client/*` (CRUD complet).
- Compléter `backend/src/modules/contract/*` : CRUD complet + `include` relations Prisma (`clients`, `compagnies`, `vehicules`) pour conserver la structure attendue par l’UI.

2) **Créer les modules dashboard/payments/media/folders**

- `dashboard` : agrégation serveur (évite plusieurs requêtes côté frontend).
- `payments` : CRUD Prisma sur `paiements` (option : filtres `from/to/type/contractId`).
- `folders` : CRUD Prisma sur `dossiers`.
- `media` : CRUD Prisma sur `medias` + trash/restore (soft-delete).

## Étapes Frontend (API-first)

1) **Étendre `API_ENDPOINTS`**

- Mettre à jour [`frontend/src/config/api.ts`](frontend/src/config/api.ts) en ajoutant : `dashboard`, `payments`, `media`, `folders` (+ éventuellement `companies.subscriptionList`).

2) **Migrer les hooks/pages (noms en anglais)**

- `useClientsData.ts` / `useContractsData.ts` (remplacer `useContratsData.ts`) : lecture via API + suppression realtime.
- Mutations : `useClientsMutations.ts`, `useContractsMutations.ts`.
- Dashboard : remplacer `useDashboardData.js` par `useDashboardData.ts` (API `GET /api/dashboard`) + retirer realtime.
- Payments : ajouter `usePaymentsData.ts` + `usePaymentsMutations.ts` et migrer `Paiements.jsx`.
- Media/Folders : ajouter `useMediaData.ts` / `useMediaMutations.ts` + `useFoldersData.ts` / `useFoldersMutations.ts` et migrer `Medias.jsx`.
- Upload reste Supabase Storage ; l’enregistrement/renommage/move/trash/restore passe par API.
- Souscription : migrer `Souscription.jsx` pour charger les compagnies via backend API.
- Users : **ne pas migrer** `GestionUtilisateurs.jsx`.

## Validation

- Vérifier que chaque endpoint correspond bien aux URLs dans `API_ENDPOINTS`.
- Vérifier que les réponses suivent `{ success: true, data }` (`apiResponse`).

## Todos

- `backend-clients-crud`: Créer le module backend `client` (CRUD) et l’exposer sur `/api/clients`.
- `backend-contracts-crud`: Aligner `contract` sur `/api/contracts` (sans alias), CRUD complet + relations (`clients`, `compagnies`, `vehicules`).
- `backend-dashboard-endpoint`: Ajouter `GET /api/dashboard` (payload agrégé pour l’UI).
- `backend-payments-crud`: Créer le module backend `payments` (CRUD) sur `/api/payments`.
- `backend-media-folders-crud`: Créer les modules backend `media` + `folders` (CRUD) + `trash/restore`.
- `frontend-api-endpoints`: Étendre `frontend/src/config/api.ts` avec `dashboard/payments/media/folders` (noms en anglais).
- `frontend-migrate-dashboard`: Remplacer `useDashboardData.js` par `useDashboardData.ts` (API) et supprimer realtime.
- `frontend-migrate-payments`: Migrer `Paiements.jsx` + hooks `usePaymentsData.ts`/`usePaymentsMutations.ts`.
- `frontend-migrate-media`: Migrer `Medias.jsx` + hooks `useMedia*`/`useFolders*` (upload reste Storage côté client).
- `frontend-migrate-souscription`: Migrer `Souscription.jsx` vers API.