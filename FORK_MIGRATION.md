# Migration des forks npm vers les packages officiels

Objectif : éliminer les forks et dépendances custom pour réduire la dette technique et faciliter les montées de version.

---

## Inventaire des dépendances « fork / custom / patch »

### 1. @deepnotes/simple-lru-cache (scope npm DeepNotes)

- **Type :** Republication sous scope `@deepnotes/` du package officiel `simple-lru-cache`.
- **Usage :** Un seul endroit : `packages/@stdlib/data/src/data-abstraction.ts` — import par défaut et utilisation de l’API `{ cache, get, set, del, reset }` avec `new simpleLRUCache({ maxSize })`.
- **Upstream :** `simple-lru-cache` (Gabriel Eisbruch, https://github.com/geisbruch/node-simple-lru-cache), version 0.0.2. Même API : `Cache.prototype.get(key, hit?)`, `set(key, val, hit?)`, `del(key)`, `reset()`, propriété `cache`.
- **Changelog upstream :** Package stable, 2 versions (0.0.1, 0.0.2), pas d’évolution récente. Aucune divergence fonctionnelle identifiée entre `@deepnotes/simple-lru-cache` et `simple-lru-cache`.

**Décision : REMPLAÇABLE**

- Le package officiel expose la même API (get/set/del/reset, option `hit`, propriété `cache`). Aucun correctif ou comportement spécifique du scope `@deepnotes/` n’est utilisé.
- **Action :** Remplacer `@deepnotes/simple-lru-cache` par `simple-lru-cache@^0.0.2` dans `packages/@stdlib/data/package.json` et adapter l’import si besoin (export par défaut identique).

---

### 2. libsodium-wrappers-sumo (patch pnpm)

- **Type :** Package officiel `libsodium-wrappers-sumo@0.7.16` avec un patch pnpm (pas un fork npm).
- **Patch :** `patches/libsodium-wrappers-sumo@0.7.16.patch` — modifie un seul fichier : `dist/modules-sumo-esm/libsodium-wrappers.mjs` (fichier ESM minifié). Le diff remplace l’intégralité du contenu de ce fichier (contenu minifié, analyse détaillée non faite).
- **Usage :** Import `sodium` depuis `libsodium-wrappers-sumo` dans plusieurs modules (crypto, auth, key-rotation, etc.). Aucun usage d’une API ajoutée par le patch n’a été identifié dans le code source.
- **Changelog upstream :** Versions 0.7.16 et 0.8.x existantes (libsodium.js). Sans analyse ligne à ligne du patch, on ne peut pas affirmer que le correctif est intégré en amont.

**Décision : NON REMPLAÇABLE (temporaire)**

- Le patch modifie le binaire ESM distribué. La raison exacte (correctif wasm, compatibilité bundler, etc.) n’est pas documentée et le diff est illisible en pratique (fichier minifié).
- **Action :** Conserver le patch. Pour une migration ultérieure : (1) reproduire le correctif à la main sur la source ou (2) tester la suppression du patch (build + tests + scénarios crypto) et documenter le résultat. Ne pas monter de version majeure (ex. 0.8.x) dans cette étape.

---

### 3. Overrides pnpm (prosemirror-model, prosemirror-view)

- **Type :** Pin de version dans `package.json` racine (`pnpm.overrides`), pas un fork.
- **Valeurs :** `prosemirror-model": "~1.18.3"`, `prosemirror-view": "~1.29.2"`.
- **Rôle :** Aligner les versions de Prosemirror dans le monorepo (Tiptap, y-prosemirror, etc.).

**Décision : Hors scope**

- Ce ne sont pas des forks, uniquement des contraintes de version. Aucune action de « retour à l’upstream » à faire ici.

---

## Résumé des actions

| Dépendance                    | Décision              | Action effectuée / à faire                          |
|------------------------------|------------------------|-----------------------------------------------------|
| @deepnotes/simple-lru-cache  | REMPLAÇABLE            | Remplacer par `simple-lru-cache@^0.0.2` (voir § C)  |
| libsodium-wrappers-sumo      | NON REMPLAÇABLE        | Conserver le patch, documenter pour plus tard       |
| prosemirror-model/view       | Hors scope             | Aucune                                              |

---

## Étapes de remplacement (ÉTAPE C) — simple-lru-cache

1. Dans `packages/@stdlib/data/package.json`, remplacer `"@deepnotes/simple-lru-cache": "^0.0.2"` par `"simple-lru-cache": "^0.0.2"`.
2. Dans `packages/@stdlib/data/src/data-abstraction.ts`, remplacer l’import `import simpleLRUCache from '@deepnotes/simple-lru-cache'` par `import simpleLRUCache from 'simple-lru-cache'`.
3. Vérifier que l’API utilisée (constructeur avec `{ maxSize }`, `get`, `set`, `del`, `reset`, propriété `cache` si utilisée) est identique à l’upstream (confirmé : oui).
4. Exécuter `pnpm install`, `pnpm run repo:build`, puis `pnpm run spa:dev` pour validation.

Aucun changement dans `.syncpackrc.json` : aucune exception liée à ces packages n’y est déclarée.

---

## Validation (ÉTAPE D)

- **pnpm install** (--no-frozen-lockfile) : OK.
- **pnpm run build** : OK (17 tasks).
- **pnpm run repo:build** : OK.
- **pnpm run spa:dev** : OK (serveur SPA démarre, URL affichée).
