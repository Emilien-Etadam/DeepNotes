# Stack technique (à jour)

Ce document décrit l’état actuel de la stack après remise à niveau du repo.

## Environnement

| Outil      | Version cible | Note                    |
|-----------|----------------|-------------------------|
| Node      | 20+ (recommandé 22) | `nvm use 22`           |
| pnpm      | 9              | `packageManager` dans package.json |
| TypeScript| 5.7.x          | Monorepo (tsconfig.packages.json) |
| Turborepo | 2.x            | Build / dev parallèle   |

## Principaux packages

- **Frontend** : Vue 3.5, Quasar 2.17, Vite 6, Pinia, vue-router, Tiptap 2.11
- **Backend** : Fastify 4, tRPC, Knex 3, PostgreSQL, KeyDB (Redis)
- **E2EE** : libsodium-wrappers-sumo (CJS en build client via alias Vite)
- **Lint** : ESLint 9 (flat config), typescript-eslint 8, eslint-plugin-vue

## Build

- **Backend / packages** : `pnpm install` puis `npx tsc --build tsconfig.packages.json` et `pnpm run repo:build`
- **Client SPA** : `cd apps/client && pnpm run build:spa` (nécessite Node 20+)
- **Lancement dev** : `./start.sh` (ou `./start.sh --docker` pour tout en Docker)

## Détails techniques

- **Config Quasar** : `quasar.config.cjs` (CJS pour éviter ESM + lodash). Pas de `quasar.config.js`.
- **tsconfig client** : `extends: "./.quasar/tsconfig.json"` (plus `@quasar/app-vite/tsconfig-preset`, non exporté en 2.4).
- **libsodium** : alias Vite vers le build CJS ; patch pnpm pour l’import ESM (optionnel pour le build navigateur).
- **unilogr** : stub navigateur `apps/client/src/unilogr-browser.ts` (alias Vite) car le package utilise `fs` / `node:util`.

## Limites connues

- **Lint client** : des erreurs de parsing sur certains `.vue` (Vue + TypeScript dans le script) et des règles type-aware peuvent rester. Les globals auto-importés (useMeta, mainLogger, etc.) sont déclarés dans `eslint.config.mjs`.
- **Peer deps** : avertissements possibles (ex. @intlify, y-prosemirror) sans bloquer le build.
- Les fichiers `.eslintignore` sont dépréciés avec ESLint 9 ; les ignores sont dans `eslint.config.mjs`.

## Voir aussi

- `PLAN.md` : plan de modernisation et statut des phases.
- `template.env` : variables d’environnement à copier en `.env`.
