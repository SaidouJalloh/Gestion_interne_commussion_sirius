# Agent — Architecture Backend (Sirius)

Ce document sert de **guide rapide** pour intervenir sur le backend en respectant la **structure actuelle** et en tenant compte des **chantiers de migration** déjà visibles dans le code.

## Stack & rôle du backend

- **Runtime**: Node.js + TypeScript
- **HTTP**: Express
- **DB**: PostgreSQL (hébergée/structurée façon **Supabase**, avec schemas `auth` + `public`)
- **ORM**: Prisma (`@prisma/client`)
- **Auth**: Supabase Auth via `@supabase/supabase-js` (service existant côté backend, mais endpoints/middlewares encore à compléter)

## Démarrage & variables d’environnement

### Commandes

- `npm install`
- `npm run dev` (ts-node-dev)
- `npm run build`
- `npm start` (sur `dist/`)

### Variables attendues

- **`DATABASE_URL`** (obligatoire) — l’API refuse de démarrer si absente.
- **`FRONTEND_URLS`** ou `FRONTEND_URL` — liste d’origines CORS (CSV), fallback `http://localhost:3000`.
- **`SUPABASE_URL`**, **`SUPABASE_ANON_KEY`** (utilisées par `AuthService`)
- **`SUPABASE_SERVICE_ROLE_KEY`** (présente dans `env`, pas encore utilisée dans le code actuel)

## Organisation des dossiers

### Points d’entrée

- **`src/server.ts`**: démarre le serveur (listen + logs).
- **`src/app.ts`**: configure Express (CORS, JSON, `/health`, montage `/api`, notFound, errorHandler).

### Routage

- **`src/routes/index.ts`**: routeur racine monté sur `/api`.
- **`src/modules/*`**: modules métier (pattern “controller/service/route/validation”).

### Cross-cutting concerns

- **`src/config/env.ts`**: lecture/validation des env vars.
- **`src/core/prisma.ts`**: instance Prisma mutualisée.
- **`src/core/logger.ts`**: logger minimal.
- **`src/middlewares/*`**:
  - `validate.ts`: validation via `schema.parse()` (style Zod-like).
  - `notFound.ts`: 404 JSON standardisé.
  - `errorHandler.ts`: gestion d’erreurs centralisée avec status/message.
- **`src/utils/apiResponse.ts`**: wrapper standard `{ success, data }` / `{ success: false, message }`.

## Flux de requête (request lifecycle)

1. **CORS** (origines autorisées via `FRONTEND_URLS`)
2. **Parsing JSON**
3. **Routage**: `/api/*` → `src/routes/index.ts`
4. **Module route** → (optionnel) `validate(...)`
5. **Controller**: orchestration HTTP (status codes + wrapper `apiResponse`)
6. **Service**: logique métier + accès DB via Prisma
7. **Erreurs**: `errorHandler` (retour JSON standardisé)

## Modèles DB & Prisma (attention migration)

Le `prisma/schema.prisma` pointe vers **deux schemas**:

- `auth` (Supabase Auth, tables RLS/contraintes/indices particuliers)
- `public` (données métier: `compagnies`, `clients`, `contrats`, etc.)

### Points d’attention

- Le fichier Prisma contient des avertissements (RLS, check constraints, expression indexes, commentaires DB).
- Sur une base Supabase, les migrations doivent être **gérées avec prudence**:
  - Éviter de “casser” les objets gérés par Supabase (notamment dans `auth`).
  - Préférer une stratégie claire (ex: migrations SQL/Supabase pour la DB, Prisma surtout pour le client/type-safety).

## Modules existants (état actuel)

- **`modules/company`**: CRUD complet + validation + Prisma “classique”.
- **`modules/contract`**: lecture “liste” uniquement, via **`$queryRawUnsafe`** pour reproduire un SQL historique (jointures clients/compagnies).
- **`modules/auth`**: `AuthService` (signup/login/getUserFromToken) via Supabase, **mais pas encore exposé en routes** dans `src/routes/index.ts`.

## Compatibilité / dette technique (migration)

On voit des “restes” d’une structure précédente:

- **`src/routes/contrats.ts`**: ancienne route Express (retourne un JSON brut, pas `apiResponse`).
- **`src/prismaClient.ts`**: ré-export temporaire de Prisma pour compat.

Ces fichiers sont à considérer comme **legacy** tant qu’ils ne sont pas montés par `src/app.ts` via `src/routes/index.ts`.

## Conventions à respecter

- **Réponses API**: utiliser `apiResponse.success(...)` / `apiResponse.error(...)`.
- **Validation**: brancher `validate(schema, segment)` au niveau des routes.
- **Services**: centraliser l’accès DB dans `*.service.ts`, garder les controllers “minces”.
- **Erreurs**: lever des erreurs avec un champ `status` quand on veut contrôler le HTTP status (pattern déjà utilisé dans `AuthService`).

## Trajectoire de migration recommandée (pragmatique)

- **Normaliser les endpoints**:
  - Le frontend référence `/api/contracts` (EN) alors que le backend expose `/api/contrats` (FR). Choisir un standard et aligner.
- **Éliminer `$queryRawUnsafe` progressivement**:
  - Remplacer par Prisma (`findMany` + `include`) ou au minimum `queryRaw` paramétré.
- **Ajouter une couche d’auth** sur l’API** (si attendu)**:
  - Middleware `requireAuth` (validation du JWT Supabase) + politiques d’accès (roles) pour les routes sensibles.
- **Documenter la stratégie migrations DB**:
  - “Qui gère quoi” entre Supabase migrations et Prisma migrations, surtout avec RLS.


