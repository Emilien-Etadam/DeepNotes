Context
DeepNotes is an open-source infinite canvas note-taking app with E2EE and real-time collaboration. The monorepo is stuck on outdated tooling (pnpm 7, Vite 2, TS 5.3, ESLint 8, forked Quasar) due to cascading dependency locks. The goal is to modernize the entire build chain without removing any features or breaking the PostgreSQL schema.
The work is organized in sequential phases. Each phase leaves the project in a buildable/runnable state. We commit after each functional step.

---

## Où on en est (sync multi-PC / nouvelle session)

À mettre à jour quand on avance, pour reprendre sur un autre PC ou dans un nouveau chat.

| Info | Valeur |
|------|--------|
| **Branche** | `dev` |
| **Dernier commit** | `git log -1 --oneline` pour voir (ex. `9b77142 fix: login/setup UI, backend unavailable...`) |
| **Dernière mise à jour** | 2025-02 (à mettre à jour après chaque grosse étape) |

**Fait récemment (résumé)**  
- Accueil = login, pas de site de vente ; comptes créés par l’admin uniquement (setup puis invitations).  
- Page Setup (premier admin), page AcceptInvite (lien d’invitation), onglet Invitations dans Account.  
- Login/Setup : textes et boutons visibles (TextField, PasswordField, DeepBtn, Checkbox + styles).  
- Message « Backend unavailable » quand PostgreSQL/Redis down ou réponse non-JSON (handleError + Login).  
- Footer minimal (une ligne).  
- Docker app-server : build OK (libsodium externalisé dans tsup, installé dans l’image).  
- Nettoyage deps client : axios supprimé, browserslist → devDeps, js-base64 retiré (voir `docs/AUDIT-DEPENDANCIES-CLIENT.md`).  
- Phase 5 ESLint : **DONE**. Phase 7.3 : build vérifié OK ; lint OK (0 erreur). Vérification Docker (6.6) à lancer manuellement.

**Pour reprendre sur un autre PC**  
`git pull origin dev` → `pnpm install` → `cp template.env .env` → lancer Postgres + Redis (Docker ou local) → `apps/app-server`: `pnpm run dev`, `apps/client`: `pnpm run dev`. Voir plus bas pour le statut des commandes (build, lint).

**Docker vs code local**  
Quand tu testes via `http://localhost:80`, c’est le **conteneur client** (nginx) qui sert le bundle SPA **déjà buildé dans l’image**. Les conteneurs **app-server**, **collab-server**, etc. exécutent aussi le code **inclus dans leurs images**. Les changements de code sur le disque ne sont pas pris en compte tant qu’on ne rebuild pas les images. Après modification du code ou des deps : `docker-compose build <service>` puis `docker-compose up -d <service>` (ou `docker-compose rm -sf <service>` si erreur ContainerConfig).

---

## Statut actuel (dernière vérification)

| Commande | Résultat |
|----------|----------|
| `pnpm install` | OK |
| `npx tsc --build tsconfig.packages.json` | OK |
| `pnpm run repo:build` | OK (18 tasks) |
| `pnpm run build` | OK (18 tasks) |
| `pnpm run lint` | **OK** (0 erreur). Client : 27 warnings (unused `error` / `_error` dans catch, args `_page` / `_pipeline`). Racine et client : `**/dist/**` ignoré, `.eslintignore` supprimés, parser TS pour `.vue`, globals Vue ajoutés. |
| `cd apps/client && pnpm run build:spa` | **OK** sous Node 20+ (tsconfig extends `.quasar/tsconfig.json`, alias libsodium + stub unilogr, fix Vue `@vue-ignore` dans TextEditor.vue). |
| `@stdlib/nestjs` | Non référencé dans le repo ; pas dans `tsconfig.packages.json`. À supprimer si le package existe. |

**Reste à faire :**

- **Phase 5 (ESLint)** : **DONE**. Lint passe (0 erreur). Optionnel : traiter les 27 warnings (catch sans usage → `} catch {` ou garder tel quel).
- **Phase 6.6 (Docker)** : **À faire manuellement**. Prérequis : `cp template.env .env` (et adapter si besoin). Puis `docker compose build` (ou `docker-compose build`) puis `docker compose up -d`. Vérifier que les services répondent (postgres, keydb, app-server, client sur le port 80).
- **Phase 7.2** : **N/A** — `@stdlib/nestjs` n’existe pas dans le repo.
- **Phase 7.3** : **DONE** — `pnpm install` / `pnpm run build` OK ; lint OK (0 erreur). `build:spa` à valider sous Node 20+.
- **Bug toolbar** : **RÉSOLU** — Cause : `q-btn` (Quasar) interceptait le mousedown ; fix : bouton natif avec `@mousedown.prevent` dans `ToolbarBtn.vue`. Détails : `docs/TOOLBAR-FORMATTING-BUG.md`.

**Documentation** : `STACK.md` résume la stack à jour et les points techniques. `README.md` mis à jour (Node 20+, pnpm 9, `./start.sh`).

---

Phase 1 — Upgrade pnpm 7 → 9 + Node 22 + Turborepo 2 — **DONE**
Step 1.1: pnpm 7 → 9 — **DONE**
Files to modify:

/home/user/DeepNotes/package.json: Change "packageManager": "pnpm@7.6.0" → "pnpm@9.15.4"
/home/user/DeepNotes/.npmrc: Already has shamefully-hoist=true, auto-install-peers=true, strict-peer-dependencies=false — no changes needed
Delete pnpm-lock.yaml (lockfileVersion 5.4 → will regenerate as v9)

Verification: pnpm install succeeds, no unresolved peer deps errors
Step 1.2: Node 18 → 22 — **DONE**
Files to modify:

/home/user/DeepNotes/package.json: "engines.node" → ">=20.0.0"
/home/user/DeepNotes/apps/client/package.json: "engines.node" → ">=20.0.0"
/home/user/DeepNotes/apps/client/quasar.config.js line 102: node: 'node16' → node: 'node20'
/home/user/DeepNotes/start.sh line 5: nvm use 18 → nvm use 22

Step 1.3: Turborepo 1.x → 2.x — **DONE**
Files to modify:

/home/user/DeepNotes/package.json: "turbo": "^1.10.16" → "turbo": "^2.3.0"
/home/user/DeepNotes/turbo.json:

$schema → "https://turbo.build/schema.json"
Rename "pipeline" key → "tasks"
Add "persistent": true to dev, build:watch, repo:build:watch



Step 1.4: Verify — **DONE** (commandes exécutées avec succès)
Commit: chore: upgrade pnpm to 9, Node to 22, Turborepo to 2

Phase 2 — Upgrade TypeScript 5.3 → 5.7+ — **DONE**
Step 2.1: Upgrade TypeScript — **DONE**
Files to modify:

/home/user/DeepNotes/package.json: "typescript": "5.3.3" → "typescript": "~5.7.3"
/home/user/DeepNotes/apps/client/package.json: "typescript": "5.3.3" → "typescript": "~5.7.3"
/home/user/DeepNotes/package.json: "tsc-alias": "~1.7.1" → "tsc-alias": "~1.8.10"

Step 2.2: Update base tsconfig — **DONE**
File: /home/user/DeepNotes/packages/@deeplib/tsconfig/base.json

"target": "ES2021" → "target": "ES2022" (enables native structuredClone, at(), etc.)
Keep "module": "commonjs" and "moduleResolution": "node" (changing these would require adding .js extensions to all imports)

Step 2.3: Fix Uint8Array generic issues (TS 5.7 breaking change) — **DONE**
TypeScript 5.7 makes Uint8Array generic. The crypto-heavy packages (@stdlib/crypto, @deeplib/data) use Uint8Array extensively via libsodium-wrappers-sumo. Since skipLibCheck: true is already set, .d.ts issues are suppressed. For source-level errors, add targeted as Uint8Array casts where needed.
Step 2.4: Fix process.env strictNullChecks errors — **DONE**
Multiple server apps access process.env.VARIABLE without null checks. Fix with non-null assertions or fallback defaults on the specific lines that error.
Step 2.5: Verify — **DONE**
Commit: chore: upgrade TypeScript to 5.7, fix type errors

Phase 3 — Replace Quasar fork + Upgrade Vite 2 → 5+ and Vue 3.2 → 3.5 — **DONE**
This is the highest-risk phase. The Vite version is locked by the Quasar CLI plugin.
Step 3.1: Replace Quasar forks with official packages — **DONE**
File: /home/user/DeepNotes/apps/client/package.json

"quasar": "npm:@deepnotes/quasar@2.13.2" → "quasar": "^2.17.7"
"@quasar/app-vite": "npm:@deepnotes/quasar-app-vite@^2.0.0-alpha.42" → "@quasar/app-vite": "^2.1.0"
"vite": "^2.9.16" → "vite": "^6.0.0"
"vue": "~3.2.47" → "vue": "^3.5.13"

File: /home/user/DeepNotes/packages/@stdlib/vue/package.json

"vue": "~3.2.47" → "vue": "^3.5.13"

Step 3.2: Update Vue ecosystem — **DONE**
File: /home/user/DeepNotes/apps/client/package.json

"pinia": "~2.0.36" → "pinia": "^2.3.0"
"vue-router": "^4.2.5" → "vue-router": "^4.5.0"
"vue-i18n": "^9.6.5" → "vue-i18n": "^9.14.0"
"@vueuse/core": "^10.5.0" → "@vueuse/core": "^12.0.0"

Step 3.3: Update Vite-adjacent plugins — **DONE**
File: /home/user/DeepNotes/apps/client/package.json

"@intlify/vite-plugin-vue-i18n": "^3.4.0" → "@intlify/unplugin-vue-i18n": "^5.0.0" (rename + upgrade)
"unplugin-auto-import": "^0.11.5" → "unplugin-auto-import": "^19.0.0"
"unplugin-vue-components": "^0.22.12" → "unplugin-vue-components": "^28.0.0"

File: /home/user/DeepNotes/apps/client/quasar.config.js line 126:

'@intlify/vite-plugin-vue-i18n' → '@intlify/unplugin-vue-i18n/vite'

Step 3.4: Fix Sass deprecations — **DONE**
File: /home/user/DeepNotes/apps/client/package.json

"sass": "1.77.0" → "sass-embedded": "^1.83.0" (official @quasar/app-vite 2.x uses sass-embedded)

Add Sass deprecation silencing in quasar.config.js via extendViteConf:
jsextendViteConf(viteConf) {
  viteConf.css = {
    preprocessorOptions: {
      scss: { silenceDeprecations: ['legacy-js-api', 'import'] }
    }
  };
}
Step 3.5: Handle quasar.config format — **DONE**
- Config renommée en `quasar.config.cjs` pour éviter ESM + import lodash. `hashFNV1a` et `Object.fromEntries` inlinés (plus de `require('@stdlib/misc')`). `node: 'node20'` dans build.

Step 3.6: Verify — **PARTIAL**
- `build:spa` : OK sous Node 20+ ; sous Node 18 → `crypto.hash is not a function`. À valider avec Node 20+.
Commit: feat: migrate to official Quasar 2.17, Vite 6, Vue 3.5
Risk mitigation: If official Quasar breaks critical features, use pnpm patch quasar to apply targeted fixes. Keep the fork available as fallback.

Phase 4 — Replace remaining custom forks — **DONE**
Step 4.1: ioredis fork → official — **DONE**
Replace "ioredis": "npm:@deepnotes/ioredis@^5.3.1" → "ioredis": "^5.4.2" in 6 files:

apps/app-server/package.json
apps/collab-server/package.json
apps/realtime-server/package.json
apps/scheduler/package.json
apps/manager/package.json
apps/client/package.json

Fix peer deps in:

packages/@stdlib/data/package.json: peer "ioredis" → ">=5.0.0"
packages/@deeplib/data/package.json: peer "ioredis" → ">=5.0.0"

Verify: Start app-server + collab-server, test Redis/KeyDB connectivity.
Step 4.2: superjson fork → official — **DONE**
Replace "superjson": "npm:@deepnotes/superjson@^1.12.4" → "superjson": "^2.2.2" in:

apps/client/package.json
apps/app-server/package.json

SuperJSON 2 is ESM-only. If CJS is needed server-side, use "superjson": "^1.13.3" (latest 1.x official).
Step 4.3: tiptap collaboration-cursor fork → official — **DONE**
Replace "@tiptap/extension-collaboration-cursor": "npm:@deepnotes/tiptap-extension-collaboration-cursor@^2.0.0-beta.202" → "@tiptap/extension-collaboration-cursor": "^2.11.0" in apps/client/package.json.
Also upgrade all Tiptap packages to consistent ^2.11.0:

@tiptap/core, @tiptap/vue-3, @tiptap/starter-kit
All @tiptap/extension-* packages
Critical: @tiptap/extension-table* pinned at 2.0.0-beta.202 → ^2.11.0

Verify: Test rich text editing with tables and collaboration cursors.
Step 4.4: html2canvas fork → official — **DONE**
Replace "html2canvas": "npm:@deepnotes/html2canvas@^1.4.2" → "html2canvas": "^1.4.1" in apps/client/package.json.
Step 4.5: dotenv-expand patch → upgrade — **DONE**
Upgrade "dotenv-expand": "9.0.0" → "dotenv-expand": "^11.0.7" in all 6 apps.
Remove from pnpm.patchedDependencies in root package.json.
Delete /home/user/DeepNotes/patches/dotenv-expand@9.0.0.patch.
Commit: chore: replace all custom forks with official packages

Phase 5 — ESLint 8 → 9 flat config — **DONE**
Step 5.1: Upgrade ESLint + plugins — **DONE**
File: /home/user/DeepNotes/package.json devDependencies:

"eslint": "^8.53.0" → "eslint": "^9.17.0"
Remove "@typescript-eslint/eslint-plugin": "^6.10.0"
Remove "@typescript-eslint/parser": "^6.10.0"
Add "typescript-eslint": "^8.18.0"
"eslint-plugin-unused-imports": "^3.0.0" → "^4.1.0"
"eslint-plugin-simple-import-sort": "^10.0.0" → "^12.1.0"
"eslint-plugin-prettier": "^5.0.1" → "^5.2.0"
"eslint-config-prettier": "^9.0.0" → "^10.0.0"
"eslint-plugin-vue": "^9.18.1" → "^9.32.0"
Remove "eslint-config-base": "workspace:*"

Step 5.2: Create root eslint.config.mjs — **DONE**
Replace /home/user/DeepNotes/.eslintrc.js with /home/user/DeepNotes/eslint.config.mjs using flat config format with typescript-eslint, eslint-plugin-prettier/recommended, eslint-plugin-unused-imports, eslint-plugin-simple-import-sort.
Step 5.3: Client Vue config — **DONE** (bloc Vue dans root eslint.config.mjs, fichiers apps/client/**/*.vue)
Step 5.4: Delete all .eslintrc.js files — **DONE**
All package-level .eslintrc.js files (they all just extend base and set tsconfigRootDir). The flat config handles this centrally.
Step 5.5: Delete packages/eslint-config-base/ — **DONE** (absent ou supprimé)
No longer needed — shared config lives in root eslint.config.mjs.
Step 5.6: Update lint/fix scripts — **DONE** (`lint`: "eslint .", fix: "eslint --fix .")
Remove --ext .js,.ts,.vue flags (not supported in ESLint 9):

"lint": "eslint --ext .js,.ts,.vue ./" → "lint": "eslint ."
"fix": "eslint --fix --ext .js,.ts,.vue ./" → "fix": "eslint --fix ."

Step 5.7: Verify — **DONE** (lint OK, 0 erreur ; 27 warnings optionnels)
- Fix : `**/dist/**` dans ignores, suppression `.eslintignore` (racine + client), parser TS pour `*.vue` (parserOptions.parser), globals (watchEffect, watchPostEffect, shallowRef, triggerRef), corrections no-empty-object-type / no-unused-expressions / vue/no-reserved-props (TextEditor), catch _error / void pour réactivité.
Commit: chore: migrate ESLint to v9 flat config

Phase 6 — Docker modernization — **DONE**
Step 6.1: Update existing Dockerfiles — **DONE**
Files: apps/app-server/Dockerfile, apps/collab-server/Dockerfile

Base: node:16 → node:22-slim (builder), node:22-alpine (runner)
pnpm: npm install -g pnpm@^8.0.0 → corepack enable && corepack prepare pnpm@9.15.4 --activate
Remove pm2 (use Docker restart policies)

Step 6.2: Create missing Dockerfiles — **DONE**
New files:

apps/realtime-server/Dockerfile
apps/scheduler/Dockerfile
apps/client/Dockerfile (Nginx-based for SPA)

Step 6.3: Update docker-compose.yml — **DONE** (postgres:16, keydb, app-server, collab, realtime, scheduler, client)
Expand current 2-service compose (postgres + keydb) to include:

postgres:16 (upgrade from 15.3)
keydb (keep current)
app-server, collab-server, realtime-server, scheduler (new services)
client (Nginx serving SPA)
Health checks on postgres/keydb, dependency ordering
Named volumes instead of bind mounts for data

Step 6.4: Create .dockerignore — **DONE**
Exclude node_modules, **/dist, .git, *.tsbuildinfo, data dirs.
Step 6.5: Update start.sh — **DONE** (--docker, nvm use 22)
Add --docker flag for Docker mode while keeping existing dev mode.
Step 6.6: Verify — **À faire manuellement** : `cp template.env .env` puis `docker compose build` et `docker compose up -d` (Docker doit être installé et le daemon accessible).
Commit: feat: complete Docker setup with all services

Phase 7 — Cleanup — **DONE**
Step 7.1: Update remaining dependencies — **DONE** (tsup ^8.3, husky ^9, vitest ^2, knex ^3.1)

"tsup": "^7.2.0" → "^8.3.0" in all apps
"husky": "^8.0.3" → "^9.0.0" + update prepare script
"vitest": "^0.34.6" → "^2.0.0"
"knex": "2.3.0" → "^3.1.0" across all packages (test DB migrations)
Keep fastify@^4.x (v5 has breaking plugin changes — separate effort)

Step 7.2: Evaluate @stdlib/nestjs — **N/A**
- Aucune référence à @stdlib/nestjs dans le repo ; pas dans tsconfig.packages.json. Le package n’existe pas dans packages/ (rien à supprimer).
Step 7.3: Verify full build — **DONE**
- `pnpm install` / `pnpm run build` : **OK**. `pnpm run lint` : **OK** (0 erreur, 27 warnings optionnels). `build:spa` : à valider sous Node 20+.
Commit: chore: update remaining dependencies, cleanup dead code

Key Risks & Mitigations
RiskMitigationQuasar fork has critical patchesUse pnpm patch to apply fixes to official packageUint8Array generics in TS 5.7skipLibCheck: true + targeted as Uint8Array castsVite 2→6 breaks client buildCoupled with Quasar upgrade — official @quasar/app-vite 2.x bundles Vite 5/6Tiptap table beta→stable breaksPin to stable 2.11 and test table editing thoroughlyknex 2→3 breaks queriesTest all DB operations, especially migrationsESLint rule renames (v6→v8)typescript-eslint v8 has compatibility, ban-types→no-restricted-types