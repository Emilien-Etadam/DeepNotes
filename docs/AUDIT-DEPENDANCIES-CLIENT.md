# Audit des dépendances — apps/client

Vérification : indispensable ou pas, mise à jour / alternative plus simple, avant de réparer le lint.

---

## Résumé exécutif

| Catégorie | Action |
|-----------|--------|
| **À supprimer** | `axios` (non utilisé) |
| **À déplacer en devDependencies** | `browserslist` (uniquement outil de build) |
| **À simplifier** | Remplacer `showdown` par `marked` (un seul parser MD → HTML) |
| **Optionnel** | Retirer `js-base64` des deps directes client (déjà dans @stdlib/base64) |
| **Conserver** | Toutes les autres (utilisées ou peer de workspace) |

---

## 1. À supprimer

### `axios` (^1.6.0)
- **Usage** : Aucune occurrence dans `apps/client/src`, ni dans les packages utilisés par le client.
- **Action** : Supprimer de `apps/client/package.json` (dependencies).

---

## 2. À déplacer en devDependencies

### `browserslist` (^4.22.1)
- **Usage** : Uniquement par les outils de build (Autoprefixer, Quasar, etc.). Pas de code runtime.
- **Action** : Déplacer de `dependencies` vers `devDependencies` dans `apps/client/package.json`.

---

## 3. Simplification : un seul parser Markdown

Actuellement :
- **marked** + **marked-gfm-heading-id** : pages statiques (TermsOfService, PrivacyPolicy, Whitepaper) — MD → HTML.
- **showdown** : `NoteContainerProperties.vue` (import de fichier .md dans une note) — MD → HTML.

**Recommandation** : Garder **marked** uniquement. Marked est plus maintenu, plus sûr par défaut et plus performant. Remplacer l’usage de Showdown dans `NoteContainerProperties.vue` par marked (éventuellement avec une extension pour LaTeX inline/block si besoin).

- **Action** :
  1. Dans `NoteContainerProperties.vue`, remplacer `showdown` par `marked` (adapter les options : tables, strikethrough, etc. et les extensions custom $...$ / $$...$$).
  2. Supprimer `showdown` et `@types/showdown` de `apps/client/package.json`.

**Alternative** : Si on préfère ne pas toucher au comportement actuel tout de suite, on peut garder les deux et ne faire cette unification que plus tard (pas bloquant pour le lint).

---

## 4. Optionnel (nettoyage)

### `js-base64` (^3.7.5)
- **Usage** : Déjà dépendance de `@stdlib/base64` (workspace). Le client n’importe que `@stdlib/base64`.
- **Action** : Retirer des `dependencies` du client pour éviter la redondance. pnpm installera via @stdlib/base64.

---

## 5. Dépendances “serveur” dans le client

Elles sont **nécessaires** soit comme peer, soit pour des modes spécifiques :

| Package | Raison |
|---------|--------|
| **ioredis** | Peer de `@deeplib/data` (client utilise ce package partagé). |
| **objection** | Peer de `@deeplib/data`. |
| **express** | Utilisé dans `src-ssr/server.js` (mode SSR). |
| **compression** | Utilisé dans `src-ssr/server.js` (SSR). |
| **prom-client** | Utilisé dans `src-ssr/server.js` (métriques SSR). |
| **node-fetch** | Polyfill fetch dans `src/code/trpc.ts` (contexte Node/SSR/Electron). |

Aucune action : à conserver.

---

## 6. Autres dépendances vérifiées

| Package | Statut |
|---------|--------|
| **@stripe/stripe-js** | Utilisé (Billing, Pricing, boot stripe.client). |
| **@syncedstore/core** | Utilisé partout (collab Yjs). |
| **cookie** | Utilisé dans `src-electron/electron-main.ts`. |
| **color** | Utilisé (presence, arrows). |
| **downloadjs** | Utilisé (screenshot, recovery codes). |
| **file-saver** | Utilisé (export note). |
| **marked** + **marked-gfm-heading-id** | Utilisés (pages légales). |
| **turndown** | Utilisé (export note HTML → Markdown). À garder (rôle inverse de marked). |
| **process** | Polyfill navigateur (process.env). |
| **unilogr** | Logger partagé (boot, etc.). |

---

## 7. ESLint (packages racine)

Packages utilisés dans `eslint.config.mjs` :
- `@eslint/js`, `eslint`, `typescript-eslint`, `eslint-plugin-vue`, `eslint-plugin-prettier`, `eslint-config-prettier`, `eslint-plugin-unused-imports`, `eslint-plugin-simple-import-sort` — tous pertinents pour la config actuelle (flat config, Vue, TypeScript, Prettier). Aucune alternative plus simple recommandée sans perdre en fonctionnalité.

---

## Ordre des actions recommandé

1. **Immédiat (sans risque)**  
   - Supprimer `axios` du client.  
   - Déplacer `browserslist` en devDependencies.

2. **Optionnel**  
   - Retirer `js-base64` des deps directes du client.

3. **Plus tard (refactor)**  
   - Remplacer Showdown par Marked dans `NoteContainerProperties.vue` puis supprimer `showdown` et `@types/showdown`.

Ensuite : réparer le lint (Phase 5) en s’appuyant sur cette base de dépendances nettoyée.
