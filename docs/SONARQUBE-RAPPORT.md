# Rapport SonarQube — DeepNotes

*Dernière mise à jour : février 2026*

---

## Quality Gate : **NON PASSÉ**

| Condition | Seuil | Actuel | Statut |
|-----------|--------|---------|--------|
| Couverture du code (nouveau) | ≥ 80 % | 0 % | ❌ ERROR |
| Duplication (nouveau) | ≤ 3 % | 4,72 % | ❌ ERROR |
| Nouvelles violations | 0 | 4 | ❌ ERROR |

---

## Issues ouvertes (451 au total)

| Sévérité | Nombre |
|----------|--------|
| **CRITICAL** | 18 |
| **MAJOR** | 127 |
| **MINOR** | 306 |

---

## Principales catégories d’issues

- **Gestion d’exceptions (S2486)** — « Handle this exception or don't catch it at all » : blocs `catch` vides ou qui n’utilisent pas l’erreur (client, app-server, packages).
- **Autocomplete (Web:S6840)** — Champs de formulaire sans attribut `autocomplete` correct (AcceptInvite, Setup, Login, etc.).
- **Complexité cognitive (S3776)** — Fonctions trop complexes (routing, keyboard shortcuts, Checklist, geometry, etc.).
- **Condition négative (S7735)** — Préférer une condition positive à une négation.
- **Opérateur void (S3735)** — Remplacer l’usage de l’opérateur `void` (plusieurs déjà corrigés / CLOSED).
- **Async dans le constructeur (S7059)** — Opération asynchrone dans un constructeur (ex. `data-abstraction.ts`).
- **Docker (S7031)** — Fusionner les instructions `RUN` consécutives dans les Dockerfiles (app-server, collab-server, realtime-server, scheduler).
- **Images sans alt (Web:ImgWithoutAltCheck)** — Balises `<img>` sans attribut `alt`.
- **Préférences de style** — `Number.parseInt` / `parseFloat`, `globalThis` au lieu de `window`, membres `readonly`, etc.

---

## Zones les plus impactées

- **apps/client** — Formulaires (autocomplete), composants Vue, computed (exceptions), routing, raccourcis clavier.
- **packages (@stdlib, @deeplib)** — Exceptions, complexité, style.
- **apps/app-server** — Exceptions, Dockerfile, knex/parseInt.
- **Dockerfiles** — Regrouper les `RUN` pour réduire les couches.

---

## Recommandations rapides

1. **Quality gate** : Activer et faire remonter la couverture de tests (lcov) dans SonarQube pour le nouveau code.
2. **Priorité 1** : Traiter les 18 issues **CRITICAL** (async dans constructeur, complexité, etc.).
3. **Priorité 2** : Corriger les **MAJOR** (autocomplete, gestion d’exceptions, alias de types).
4. **Duplication** : Identifier et factoriser le code dupliqué sur la branche analysée pour repasser sous 3 %.
