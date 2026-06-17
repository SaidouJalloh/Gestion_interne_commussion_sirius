# Sprints — Feuille de route Sirius

> Document opérationnel détaillé. Chaque sprint = 2 semaines (sauf Sprint 0 = 1 semaine).
> Dérive de [ANALYSE_COMPARATIVE_ASSURAF.md](ANALYSE_COMPARATIVE_ASSURAF.md).
> Date de démarrage cible : à confirmer.

---

## Vue d'ensemble

| # | Sprint | Durée | Thème | Dépendances |
|---|---|---|---|---|
| 0 | Préparation | 1 sem. | Monorepo, observabilité, clôture multi-tenant | — |
| 1-2 | Paiement | 2×2 sem. | Mobile money (Orange Money, Wave) + carte | S0 |
| 3-4 | KYC & Signature | 2×2 sem. | OTP, CNI, signature électronique | S0 |
| 5-7 | PWA mobile | 3×2 sem. | Vite + React + PWA | S2 (paiement) |
| 8 | Landing SEO | 2 sem. | Site Astro public | — (parallélisable) |
| 9+ | Bonus | — | WhatsApp, QR carte, analytics, conformité | S7 |

**Total chemin critique : ~17 semaines (≈4 mois) pour les Priorités 1.**

---

## Sprint 0 — Préparation (1 semaine)

### Objectif
Mettre les fondations en place pour pouvoir avancer rapidement et en confiance.

### Tickets

**S0-1 — Restructuration en monorepo (pnpm workspaces)** · 2j
- Créer la structure :
  ```
  sirius/
  ├── apps/
  │   ├── backend/        # ex backend/
  │   ├── frontend/       # ex frontend/
  │   └── portal-mobile/  # à créer en S5
  ├── packages/
  │   └── shared/         # types, API client, utils
  ├── pnpm-workspace.yaml
  └── package.json        # racine
  ```
- Migrer `backend/` → `apps/backend/`, `frontend/` → `apps/frontend/`.
- Créer `packages/shared/` avec : types Prisma exposés, client Supabase, helpers communs.
- **Critère d'acceptation :** `pnpm install` à la racine, `pnpm --filter backend dev` lance l'API, `pnpm --filter frontend dev` lance le frontend.
- **Note Turbo :** ne pas ajouter Turbo maintenant. Reporté à quand les builds deviennent lents.

**S0-2 — Observabilité** · 1j
- Sentry sur `apps/backend` + `apps/frontend` (capture erreurs + sourcemaps).
- PostHog sur le frontend (analytics produit, funnels).
- **Critère :** une erreur volontaire backend remonte dans Sentry, un événement `page_viewed` apparaît dans PostHog.

**S0-3 — Clôture multi-tenant** · 1j
- Vérifier toutes les **RLS policies Supabase** (script de check ou inspection dashboard).
- Test d'isolation : créer 2 organisations, créer données dans chacune, vérifier qu'un user d'org A ne voit rien d'org B (tester via API + Supabase direct).
- Finaliser `inviteMemberByEmail` via Supabase Admin API.
- Archiver `MIGRATION_MULTITENANT_STATUS.md` → `docs/archives/`.
- **Critère :** test d'isolation passé, invitation par email fonctionnelle.

**S0-4 — Discipline de release** · 0.5j
- `CHANGELOG.md` à la racine.
- Branch protection sur `main` (1 review obligatoire).
- Template PR avec checklist (tests, screenshots mobile, breaking changes).

**S0-5 — Cabinet pilote** · 0.5j (en parallèle)
- Identifier 1 cabinet courtier partenaire.
- MOU simple : usage gratuit en échange de feedback hebdo.

### Livrables Sprint 0
- Monorepo fonctionnel.
- Sentry + PostHog en prod.
- Multi-tenant validé en prod.
- Cabinet pilote engagé.

---

## Sprint 1 — Paiement mobile money (partie 1)

### Objectif
Brancher un agrégateur PSP et permettre un paiement test en sandbox.

### Tickets

**S1-1 — Choix PSP & contractualisation** · 1j
- Comparer **PayDunya vs CinetPay** sur : couverture (Orange Money, Wave, Free Money, carte), frais, qualité doc, webhooks, support.
- Reco par défaut : **PayDunya** (plus mature au Sénégal).
- Créer compte sandbox + récupérer clés API.
- **Critère :** clés sandbox dans `.env`, doc PSP partagée à l'équipe.

**S1-2 — Module `payment-provider`** · 3j
- Sur le pattern de [insurance-provider](apps/backend/src/modules/insurance-provider/) :
  ```
  apps/backend/src/modules/payment-provider/
  ├── payment-provider.service.ts
  ├── providers/
  │   ├── paydunya.provider.ts
  │   └── types.ts
  ```
- Méthodes : `createInvoice(montant, client, contrat) → { url, token }`, `verifyPayment(token)`.
- **Critère :** test unitaire qui crée une facture sandbox et reçoit une URL de paiement.

**S1-3 — Endpoint d'initiation** · 2j
- `POST /api/payments/initiate` → crée invoice PSP + ligne `paiements` avec statut `pending`.
- Multi-tenant : `organization_id` propagé.
- **Critère :** appel depuis Postman renvoie une URL PSP, ligne `paiements` créée.

**S1-4 — Webhook PSP** · 2j
- `POST /api/payments/webhook/paydunya` (route publique, signature vérifiée).
- Mise à jour `paiements.statut` (`completed` / `failed`).
- Log dans table `payment_events` (audit).
- **Critère :** simulation webhook sandbox → `paiements.statut = completed`.

**S1-5 — UI portail client : page paiement** · 2j
- Bouton "Payer" sur page contrat → redirige vers URL PSP.
- Page de retour : success / failed / pending.
- **Critère :** parcours bout en bout en sandbox.

### Livrable Sprint 1
Un client peut initier un paiement sandbox depuis le portail web et le webhook met à jour le statut.

---

## Sprint 2 — Paiement mobile money (partie 2)

### Objectif
Passage en production + génération attestation.

### Tickets

**S2-1 — Réconciliation** · 2j
- Cron quotidien : pour chaque `paiements.statut = pending` de plus de 1h, requêter le PSP pour rafraîchir.
- Gestion des doublons (idempotence webhook).

**S2-2 — Génération attestation PDF** · 3j
- À la confirmation paiement → générer PDF attestation (`pdf-lib`) avec : logo cabinet, infos client, contrat, montant, n° quittance.
- Stocker dans Supabase Storage (`storage/attestations/{contrat_id}/`).
- Email + notification au client avec lien.

**S2-3 — Passage en production PSP** · 2j
- Validation contrat PSP, KYC entreprise.
- Bascule clés prod, test avec un vrai paiement de 100 FCFA.

**S2-4 — Dashboard paiements** · 2j
- Côté courtier : liste paiements, filtres (statut, date, mode), export CSV.
- KPIs : taux de conversion devis→paiement, délai moyen.

**S2-5 — Tests e2e** · 1j
- Playwright : parcours complet souscription → paiement → attestation reçue.

### Livrable Sprint 2
Un client peut payer en Orange Money/Wave en production et reçoit son attestation PDF.

---

## Sprint 3 — KYC & onboarding (partie 1)

### Objectif
Sécuriser la création de compte et collecter les documents d'identité.

### Tickets

**S3-1 — OTP par SMS** · 3j
- Choisir provider SMS (InTouch ou Twilio).
- Endpoint `POST /api/auth/send-otp` + `POST /api/auth/verify-otp`.
- Table `otp_codes` (expiration 5min, max 3 tentatives).
- Intégration au flux d'inscription portail.
- **Critère :** un user reçoit un SMS et peut valider son compte.

**S3-2 — Upload CNI recto/verso + selfie** · 3j
- Composant React mobile-first avec capture caméra (`<input capture>`).
- Upload chiffré (Supabase Storage avec RLS strict).
- Table `kyc_documents` : `client_id`, `type`, `url`, `statut` (`pending`/`approved`/`rejected`), `verified_at`.
- **Critère :** un client upload sa CNI, le courtier voit le statut "à vérifier".

**S3-3 — Validation manuelle KYC (back-office)** · 2j
- Page courtier : liste KYC en attente, preview docs, boutons approuver/rejeter avec motif.
- Notification au client (email + push).

**S3-4 — Préparation OCR** · 2j
- Spike technique Google Vision API : extraire nom/prénom/date naissance/n° CNI.
- Décision build vs buy (Tesseract self-host vs Vision API).

### Livrable Sprint 3
Inscription avec OTP SMS, upload KYC, validation manuelle courtier.

---

## Sprint 4 — KYC & Signature électronique (partie 2)

### Objectif
Automatiser KYC + permettre la signature contrat sans papier.

### Tickets

**S4-1 — OCR CNI automatisé** · 3j
- Implémenter le choix S3-4 : extraction auto des champs.
- Pré-remplir le formulaire client.
- Score de confiance, fallback manuel si <80%.

**S4-2 — Signature électronique du contrat** · 4j
- Génération PDF contrat avec champs signature (nom, date, IP, géoloc, hash SHA-256 du PDF + horodatage NTP).
- UI : pad de signature (canvas) + checkbox de consentement.
- Stockage : PDF signé + métadonnées dans `contrats.signature_metadata` (JSON).
- **Critère :** un contrat signé est légalement archivé avec preuve d'intégrité.

**S4-3 — Conformité légale** · 2j
- Mentions OHADA / loi sénégalaise sur la signature électronique.
- Mention CIMA dans le contrat.
- Validation par juriste externe (1j de consulting).

**S4-4 — Tests e2e onboarding complet** · 1j
- Playwright : inscription OTP → KYC → souscription → signature → paiement.

### Livrable Sprint 4
Onboarding 100% digital, légalement exploitable.

---

## Sprint 5 — PWA mobile-first (bootstrap)

### Objectif
Bootstrap technique de la PWA et premier écran utilisable.

### Tickets

**S5-1 — Bootstrap `apps/portal-mobile/`** · 1j
- `pnpm create vite portal-mobile -- --template react-ts`.
- Ajout `tailwindcss`, `react-router-dom@7`, `@supabase/supabase-js`, `lucide-react`, `react-hot-toast`.
- Réutilisation de `packages/shared/` pour types et client API.
- **Critère :** `pnpm --filter portal-mobile dev` affiche un Hello World.

**S5-2 — `vite-plugin-pwa` + manifest** · 2j
- Config Workbox (cache API + assets).
- `manifest.webmanifest` (nom, icônes 192/512, theme_color, display: standalone).
- Splash screens iOS.
- **Critère :** Lighthouse PWA score > 90, "Install" disponible sur mobile.

**S5-3 — Auth Supabase** · 2j
- Pages login / signup / forgot-password mobile-first.
- Réutiliser `AuthContext` du `frontend/` via `packages/shared/`.
- Persistance session (localStorage).
- **Critère :** un utilisateur existant peut se connecter sur la PWA.

**S5-4 — Shell mobile (layout + bottom tab bar)** · 3j
- Composant `MobileLayout` : bottom tabs (Accueil, Contrats, Devis, Sinistres, Profil).
- Header avec nom du cabinet + cloche notifications.
- Animation transitions de pages (framer-motion light).
- Gestion safe-area iOS (env(safe-area-inset-bottom)).
- **Critère :** navigation fluide entre onglets sur mobile réel.

**S5-5 — Page d'accueil PWA** · 2j
- Dashboard client : prochaine échéance, sinistres en cours, raccourcis (déclarer / devis / payer).

### Livrable Sprint 5
PWA installable sur Android/iOS avec login + dashboard d'accueil.

---

## Sprint 6 — PWA mobile-first (contenu)

### Objectif
Pages métier principales et notifications push.

### Tickets

**S6-1 — Page Contrats** · 2j
- Liste swipeable, détail (couvertures, prime, échéance, documents).
- Bouton "Payer" relié à S2.

**S6-2 — Page Devis** · 3j
- Formulaires mobile-first par produit (Auto, MRH, Voyage).
- Comparaison de formules (cards horizontales swipeables).
- Bouton "Souscrire" → flux signature + paiement.

**S6-3 — Notifications Push Web** · 3j
- Génération clés VAPID.
- Demande de permission au bon moment (après login, contextuel).
- Backend : `POST /api/push/subscribe` + envoi via Workbox.
- Cas d'usage : nouveau sinistre, échéance contrat, paiement reçu.
- **Critère :** push reçu sur Android et iOS 16.4+ après fermeture de l'app.

**S6-4 — Centre de notifications in-app** · 2j
- Réutilisation du modèle `notifications` existant + Supabase Realtime.

### Livrable Sprint 6
PWA avec parcours souscription + notifications push fonctionnelles.

---

## Sprint 7 — PWA mobile-first (sinistres + lancement)

### Objectif
Module sinistres mobile + déploiement production.

### Tickets

**S7-1 — Déclaration de sinistre mobile** · 4j
- Formulaire adaptatif selon type (Auto, Vol, Habitation…).
- Capture photos via caméra (`<input capture="environment">`).
- Mode hors-ligne : stockage local IndexedDB → sync au retour réseau.
- Géolocalisation auto (option).

**S7-2 — Suivi de sinistre** · 2j
- Liste sinistres + détail avec timeline (statut, échanges, docs).
- Messaging temps réel avec courtier (Supabase Realtime, déjà en place).

**S7-3 — Profil & paramètres** · 1j
- Données perso, mot de passe, préférences notifs, déconnexion.

**S7-4 — Polish & accessibilité** · 2j
- Audit Lighthouse (performance, accessibilité, PWA, SEO).
- Cibles : Performance > 85, Accessibilité > 90, PWA > 90.
- Optimisation images (Vite imagetools).

**S7-5 — Déploiement production** · 1j
- Build → Cloudflare Pages.
- Domaine custom : `app.<cabinet>.sirius.sn` (par tenant).
- Tests sur 3 vrais devices Android + 1 iPhone.

### Livrable Sprint 7
PWA complète en production, utilisable par le cabinet pilote.

---

## Sprint 8 — Landing SEO publique

### Objectif
Capter du trafic organique pour générer des leads.

### Tickets

**S8-1 — Bootstrap `apps/landing/` (Astro)** · 1j
**S8-2 — Pages produits** (Auto, MRH, Voyage, Santé) · 3j
**S8-3 — Simulateur public** · 3j (formulaire devis sans login → API publique avec rate-limiting → email de capture)
**S8-4 — SEO technique** · 2j (Schema.org `InsuranceAgency`, sitemap, robots.txt, balises FR-SN, Open Graph, Search Console)
**S8-5 — Blog (Astro Content Collections)** · 1j (3 articles seed)

### Livrable Sprint 8
Landing publique indexable + simulateur générant des leads.

---

## Sprints 9+ — Bonus (à séquencer selon feedback)

| Item | Effort | Priorité |
|---|---|---|
| Carte d'assurance digitale (QR offline) | 1 sprint | Haute (différenciation) |
| WhatsApp Business API | 1 sprint | Haute (canal dominant) |
| Renouvellement automatique multi-canal | 0.5 sprint | Moyenne |
| Audit trail des actions sensibles | 0.5 sprint | Haute (B2B) |
| Analytics courtier avancés | 2 sprints | Moyenne |
| Marketplace d'assureurs (autres APIs) | 3 sprints | Basse |
| Conformité CIMA/RGPD complète | Continu | Haute |
| App native React Native | 3 sprints | À évaluer après 3 mois de PWA |

---

## Métriques de succès par sprint

| Sprint | Métrique principale |
|---|---|
| S0 | Aucune erreur Sentry > niveau warning sur les flux critiques |
| S2 | 1 paiement réel en production réussi |
| S4 | 1 contrat souscrit + signé + payé bout en bout sans papier |
| S7 | 10 utilisateurs du cabinet pilote ont installé la PWA |
| S8 | 50 visites organiques / semaine sur la landing |

---

## Capacité requise

- **2 développeurs full-stack** (1 backend, 1 frontend) sur le chemin critique.
- **+1 dev frontend** en parallèle pour la landing dès S6 (Sprint 8 sinon report).
- **Designer (50%)** sur S5-S7 pour la PWA.
- **Juriste externe (1j)** sur S4.
- **Product (50%)** continu pour piloter cabinet pilote + arbitrer scope.

Avec **2 devs seuls : ~5 mois** au lieu de 4. Avec **1 dev seul : ~9 mois** — décourager.

---

## Ce qu'on NE fait PAS dans cette roadmap

- ❌ Réécrire le `frontend/` courtier (il marche, on l'améliore en continu, pas de big bang).
- ❌ Migrer vers Turbo dès maintenant (pnpm workspaces suffit).
- ❌ App native React Native en S1-S8 (PWA d'abord, native si besoin prouvé).
- ❌ Microservices (monolithe Express tient largement).
- ❌ Refonte UI complète du back-office (ROI faible vs nouvelles features).
