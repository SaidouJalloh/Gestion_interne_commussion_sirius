# Analyse comparative Sirius vs Assuraf

> Document interne — Benchmark concurrentiel et pistes d'amélioration
> Date : 2026-04-22
> Cible : équipe produit / tech Sirius

---

## 1. Contexte

Assuraf (assuraf.com) est une plateforme sénégalaise d'assurance en ligne qui partage plusieurs traits avec le portail client Sirius. Ce document compare les deux offres, identifie les écarts, et propose une feuille de route d'amélioration priorisée.

---

## 2. Positionnement — différence fondamentale

| Axe | **Assuraf** | **Sirius** |
|---|---|---|
| Modèle | B2C direct (courtier 100% digital grand public) | B2B2C SaaS multi-tenant (cabinets courtiers + portail client intégré) |
| Cible | Particulier sénégalais / Afrique francophone | Cabinets de courtage + leurs clients finaux |
| Plateformes | Web + iOS + Android natives (login biométrique FaceID/empreinte) | Web uniquement (React 19) |
| Fondation | 2018, Dakar (Souleymane Gning) | Plateforme récente, en migration multi-tenant |
| Notoriété | Presse tech africaine, app stores, ~200k$ levés | Produit interne |

**Conclusion :** ce ne sont pas des concurrents directs. Assuraf **est** un courtier ; Sirius **outille** des courtiers. Mais le portail client Sirius (`frontend/src/portal/`) couvre exactement le même parcours utilisateur qu'Assuraf — donc la comparaison est pertinente sur cette surface.

---

## 3. Comparaison fonctionnelle (parcours client)

| Fonctionnalité | Assuraf | Sirius |
|---|---|---|
| Catalogue multi-produits (Auto / MRH / Voyage / Santé / Vie) | Oui | Oui + Rapatriement, Flotte, Entreprise |
| Devis gratuit en ligne en quelques minutes | Oui | Oui (`DemandeDevis.tsx`) + API **ASKIA** temps réel (avantage Sirius) |
| Souscription 100% en ligne | Oui | Oui, parcours 5 étapes (`Souscription.tsx`) |
| Paiement en ligne | Oui | Partiel — modèle `paiements` en base mais pas de PSP branché |
| Déclaration de sinistre | Oui (formulaire) | Oui, 6 types + historique + messaging temps réel (`DeclarerSinistre.tsx`, `SinistreDetail.tsx`) |
| App mobile native | **Oui** (FaceID/empreinte) | **Non** |
| Disponibilité 24/7 + notifications | Oui | Oui (Supabase Realtime + pg_cron pour rappels J-60/J-30/J-7) |
| Back-office courtier (CRM, commissions, analytics) | Non exposé | Oui — avantage fort Sirius |
| Multi-tenant / SuperAdmin | Non | Oui (`organizations`, RLS Supabase) |
| Mode sombre / responsive | Non vérifié | Oui (Tailwind `dark:`) |

---

## 4. Points forts Sirius à préserver

- **Intégration ASKIA** pour tarification temps réel — Assuraf ne l'expose pas publiquement. Abstraction `insurance-provider` prête à accueillir d'autres compagnies (SUNU, NSIA, SANLAM…).
- **Architecture multi-tenant** (`organizations`, `organization_members`, RLS Supabase) → scalable à N cabinets.
- **Workflow sinistre riche** (statuts, historique, messages, documents, types spécifiques) bien plus structuré qu'un simple formulaire.
- **Back-office courtier complet** — commissions, FGA, taxes, alertes d'expiration 60 jours, dashboards KPI.
- **Notifications automatisées** (pg_cron + Realtime) déjà industrialisées.

---

## 5. Écarts identifiés et améliorations proposées

### Priorité 1 — Expérience client grand public

1. **Portail client en PWA mobile-first (Vite + React)** dans un dossier `portal-mobile/` du même repo.
   - Stack : **React 19 + Vite + `vite-plugin-pwa`** (pas Next.js — la PWA est derrière un login, pas besoin de SSR/SEO, bundle plus léger pour la 3G, cohérence avec le `frontend/` existant).
   - Pattern d'UI : bottom tab bar (Contrats, Devis, Sinistres, Notifs, Profil), inspiré de ParkZone.
   - Installable sur Android et iOS (16.4+) avec push Web, icône home screen, splash screen.
   - MVP : login (WebAuthn/Passkeys), liste contrats, déclaration sinistre avec appareil photo (`<input capture>`), notifications push Web.
   - Avantage vs React Native : 3× moins cher, mise à jour instantanée, pas de review Apple, même codebase React que `frontend/` → réutilisation directe des types, hooks et de l'API client.
   - Déploiement : build statique → Cloudflare Pages / Netlify (CDN mondial, pas de serveur Node à maintenir).
   - Base : copier `frontend/src/portal/pages/` comme point de départ, puis adapter écran par écran au pattern mobile.
   - App native (React Native / Expo) seulement dans un second temps si le besoin se confirme (biométrie native fine, widgets, intégrations OS).
   - Landing SEO publique = projet séparé en **Astro** (voir P2 #5), pas dans le même dossier.

2. **Intégration des paiements mobile money ouest-africains**
   - Orange Money, Wave, Free Money, Wizall + carte bancaire.
   - Passer par un agrégateur : PayDunya, CinetPay ou InTouch.
   - Actuellement `mode_paiement` existe en base sans PSP réellement branché.

3. **Onboarding client simplifié**
   - OTP par SMS à la création de compte.
   - KYC avec capture CNI (OCR) et selfie.
   - Signature électronique du contrat (pdf-lib + horodatage).

### Priorité 2 — Conversion et acquisition

4. **Comparateur multi-assureurs** — exploiter l'abstraction `insurance-provider` pour afficher 2–3 devis côte à côte. Positionne Sirius comme agrégateur, terrain qu'Assuraf revendique.

5. **Landing page publique + SEO**
   - Assuraf capte du trafic organique ("assurance auto Sénégal", "devis MRH Dakar").
   - Le portail Sirius est derrière un login → ajouter un site marketing avec simulateur accessible sans compte, puis conversion.

6. **Chatbot / WhatsApp Business**
   - Canal dominant au Sénégal pour le support.
   - Relance automatique des devis abandonnés.

### Priorité 3 — Rétention et différenciation B2B

7. **Carte d'assurance digitale** (QR code vérifiable hors ligne) dans le portail — utile en contrôle routier.

8. **Renouvellement automatique + rappels multi-canal** (SMS / WhatsApp / email). Infra notifications en place, il faut étendre les canaux.

9. **Analytics courtier avancés** — cohortes clients, taux de renouvellement, sinistralité par segment. Différenciation SaaS qu'Assuraf ne peut pas offrir à ses partenaires.

10. **Marketplace d'assureurs** via `api_config` JSON par compagnie — chaque courtier branche ses propres API partenaires.

### Priorité 4 — Conformité et confiance

11. **Conformité CIMA / FANAF** (zone CIMA) — clauses obligatoires, mentions légales, archivage réglementaire des contrats.

12. **Audit trail** des actions sensibles (souscription, sinistre, modification contrat) — critique pour un SaaS B2B vendu à des cabinets régulés.

13. **RGPD + loi sénégalaise 2008-12** — politique claire et bannière de consentement dans le portail.

---

## 6. Synthèse stratégique

Sirius est **techniquement plus mature** qu'Assuraf (multi-tenant, ASKIA temps réel, Realtime, workflow sinistre structuré, back-office courtier complet). Son retard porte sur **trois points** que le marché sénégalais valorise fortement :

1. App mobile native
2. Paiement mobile money intégré
3. Présence publique / SEO

**Combler ces trois points transforme Sirius en produit qu'un courtier peut déployer avec un portail client crédible face à Assuraf — tout en conservant l'avantage SaaS B2B qu'Assuraf n'adresse pas.**

### Recommandation de séquencement

Démarrer par les trois items de **Priorité 1** (PWA mobile-first, paiement mobile money, KYC/signature). Ce sont eux qui débloquent un déploiement pilote chez un vrai cabinet courtier.

> **Note multi-tenant :** l'architecture multi-tenant est **fonctionnellement terminée** côté code (tous les modules backend filtrent par `organization_id`, le frontend a l'OrganizationSelector, les migrations NOT NULL sont appliquées). Il reste à **valider les RLS Supabase en prod, tester l'isolation entre 2 organisations, et finaliser l'invitation par email**. Le fichier `MIGRATION_MULTITENANT_STATUS.md` est obsolète et doit être archivé.

---

## 7. Feuille de route d'exécution

### Sprint 0 — préparation (1 semaine)

- Choisir le cabinet pilote + signer un MOU simple.
- Mettre en place **Sentry** + **PostHog**.
- **Clôturer le multi-tenant :** vérifier les RLS Supabase, tester l'isolation entre 2 orgs, finaliser l'invitation par email (Supabase Admin API), archiver `MIGRATION_MULTITENANT_STATUS.md`.

### Sprint 1-2 — Paiement mobile money

Choix d'agrégateur (PayDunya ou CinetPay), module `payment/providers/`, webhook, sandbox → prod.

### Sprint 3-4 — KYC + signature électronique

OTP SMS, upload CNI + selfie chiffré, signature `pdf-lib` + hash SHA-256, OCR CNI.

### Sprint 5-7 — PWA mobile-first (`portal-mobile/`)

- Sprint 5 : bootstrap **Vite + React + `vite-plugin-pwa`** + auth Supabase + shell mobile (bottom tabs), manifest, icônes.
- Sprint 6 : pages contrats, devis, notifications push Web (Workbox + VAPID).
- Sprint 7 : déclaration sinistre avec caméra (`<input capture>`), installabilité Android/iOS, polish, déploiement Cloudflare Pages.

### Sprint 8 — Landing SEO

Site **Astro** séparé (`landing/`), simulateur public sans login, Schema.org `InsuranceAgency`, Search Console.

### En fond de roadmap

WhatsApp Business, QR carte d'assurance, analytics courtier avancés, conformité CIMA/RGPD, audit trail.

---

## 8. Sources

- [Assuraf — site officiel](https://assuraf.com/)
- [Assuraf — We Are Tech Africa](https://www.wearetech.africa/fr/fils/solutions/senegal-assuraf-offre-diverses-polices-d-assurance-sur-ses-plateformes-web-et-mobile)
- [Assuraf — Afrikstartups](https://afrikstartups.com/structures/assuraf/)
- [Assuraf Mobile — Play Store](https://play.google.com/store/apps/details?id=com.afdecoding.assurafmobile)
- [Assuraf — App Store iOS](https://apps.apple.com/fr/app/assuraf/id1641569465)
- [Assuraf — LinkedIn](https://sn.linkedin.com/company/assuraf)

---

*Document généré pour partage interne. Les constats sur Sirius sont issus d'une exploration du dépôt à la date indiquée ; les constats sur Assuraf s'appuient sur des sources publiques (site, presse, app stores) — la plateforme bloquant le scraping direct, certaines informations détaillées (PSP, partenaires assureurs, volumes) n'ont pas pu être vérifiées.*
