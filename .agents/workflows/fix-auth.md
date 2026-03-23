---
description: Audit & Stabilisation de l’architecture multi-tenant
---

Objectif :
Analyser en profondeur un projet SaaS multi-tenant afin de valider la qualité de l’architecture front-end et back-end, et identifier les problèmes liés à l’authentification et à la gestion des sessions.

Contexte :
Le système repose sur une architecture multi-tenant avec 4 types d’utilisateurs :
- Superadmin
- Admin (clients de la plateforme, ex: compagnies d’assurance)
- Clients (assurés)
- Interface de déclaration de sinistre

Actuellement, seuls les rôles superadmin et admin sont implémentés.

Problème principal :
La récupération du profil utilisateur connecté est instable ou incorrecte, ce qui impacte l’authentification et la gestion des sessions.

---

Instructions :

1. Analyse de l’architecture
- Vérifie la séparation des responsabilités entre front-end et back-end
- Évalue la structure des dossiers et la modularité
- Analyse la gestion du multi-tenant (isolation des données, logique par client)

2. Analyse des rôles utilisateurs
- Identifie les rôles implémentés
- Vérifie la gestion des permissions
- Détecte les incohérences ou manques

3. Audit de l’authentification
- Analyse le flow complet : login → token → session → récupération du profil
- Vérifie où et comment le token est stocké
- Identifie les points de rupture possibles (refresh, navigation, etc.)

4. Audit de la gestion des sessions
- Vérifie la persistance de la session côté front
- Analyse la synchronisation avec le back-end
- Inspecte les context/hooks/store utilisés

5. Identification des problèmes
- Liste clairement les bugs ou incohérences
- Explique leurs causes probables

6. Recommandations techniques
- Propose des solutions concrètes et adaptées (ex: centralisation auth, AuthProvider, refactor hooks)
- Suggère des améliorations pour la scalabilité multi-tenant

---

Format de réponse attendu :

- ✅ Points corrects
- ⚠️ Problèmes détectés
- 🧠 Analyse technique
- 🛠️ Recommandations concrètes (priorisées)
- 🚀 Améliorations futures

---

Contraintes :
- Réponse claire, structurée et orientée action
- Prioriser les problèmes critiques (auth, session, multi-tenant)
- Donner des exemples concrets si nécessaire