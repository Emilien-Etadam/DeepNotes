# Rapport – Code mort (DeepNotes)

Analyse réalisée avec **knip** (sans configuration projet). Ce document interprète les résultats et distingue les vrais candidats au nettoyage des faux positifs.

---

## 1. Résumé

| Catégorie | Nombre | Fiabilité |
|-----------|--------|-----------|
| Fichiers « non référencés » | 276 | Beaucoup de faux positifs (Vue, Quasar, boot, entry points) |
| **Exports inutilisés** | **143** | Partiellement fiable (voir §2) |
| **Types exportés inutilisés** | **43** | Plutôt fiable |
| Dépendances inutilisées | 53 | À vérifier (dynamique, config, build) |
| DevDependencies inutilisées | 29 | Idem |
| Dépendances non listées | 7 | À corriger (ajouter dans package.json) |
| Binaires non listés | 21 | Optionnel |

---

## 2. Fichiers très probablement morts

### 2.1 Fichier entier non branché

- **`apps/app-server/src/fastify/app-store-webhook.ts`**  
  Définit une route `POST /app-store/webhook` mais **n’est jamais enregistré** dans `fastify/server.ts` (contrairement à `registerStripeWebhook` et `registerRevenueCatWebhook`).  
  **Action :** soit enregistrer le webhook dans `server.ts` si la feature est voulue, soit supprimer le fichier.

### 2.2 Script / fichier de test orphelin

- **`test-superjson.js`** (racine)  
  Aucune référence dans le projet.  
  **Action :** supprimer si plus utilisé, ou déplacer dans un répertoire de tests et l’intégrer au build/test.

### 2.3 Fichiers « Unused » à ne pas supprimer sans vérification

La liste des **276 « Unused files »** contient surtout des **faux positifs** :

- **Composants Vue** : référencés dans templates, router ou `quasar.config` (imports dynamiques), pas seulement via `import` TS.
- **Boot files** (`apps/client/src/boot/*.ts`) : chargés par convention par Quasar.
- **Points d’entrée** : `App.vue`, `router/`, `electron-main.ts`, `capacitor`, SSR, etc.
- **Fichiers de config** : `quasar.config.cjs`, `postcss.config.js`.
- **API client** (`apps/client/src/code/areas/api-interface/**`) : souvent utilisés via barrel ou appels tRPC côté client ; knip ne suit pas toujours ces chemins.

Ne pas supprimer ces fichiers sur la seule base de knip. Pour les composants Vue, vérifier `router/routes`, `quasar.config` et les templates.

---

## 3. Exports inutilisés (143)

### 3.1 Faux positifs probables (ne pas supprimer sans config knip)

- **app-server – tRPC / WebSocket**  
  Beaucoup d’exports sont des **procédures tRPC** ou des **steps WebSocket** enregistrés dans le routeur (ex. `restore`, `delete_`, `login`, `changePasswordStep1`, etc.). Ils sont utilisés indirectement (router → appels client).  
  **Recommandation :** configurer knip (ex. `ignore` ou plugins) pour ces patterns avant de supprimer.

- **app-server – `knex`** (`apps/app-server/src/data/knex.ts`)  
  Le module est importé en side-effect dans `apps/app-server/src/index.ts` ; Objection utilise `Model.knex(knex)`. L’export nommé `knex` peut ne pas être importé ailleurs. On peut le garder pour requêtes brutes ou tests.

- **app-server – `getRedlock`** (`apps/app-server/src/data/redlock.ts`)  
  Utilisé en interne par `usingLocks(getRedlock(), ...)`. L’export n’est pas importé ailleurs. Utile pour tests ou usage futur ; optionnel de le retirer de l’export.

- **client – crypto / auth**  
  `derivePasswordValues`, `deriveUserValues`, `generateRandomUserKeys` sont utilisés (app-server et client) ; knip les signale à cause des alias (`src/code/...`). Ne pas supprimer.

- **client – `applyDocUpdate` / `revertToSnapshot`** (`apps/client/src/code/pages/utils.ts`)  
  Utilisés (dont `revertToSnapshot` dans `snapshots/restore.ts`). Faux positif (alias).

### 3.2 Candidats plus solides (à vérifier avant suppression)

Vérifier manuellement ou avec une config knip affinée :

- **client**
  - `apps/client/src/boot/tiptap.client/find-and-replace.ts` : `findAndReplacePluginKey`
  - `apps/client/src/boot/tiptap.client/index.ts` : `swapXmlFragments`
  - `apps/client/src/code/areas/tiptap/` : `imageResizing`, `youtubeResizing`, `YOUTUBE_REGEX`, `YOUTUBE_REGEX_GLOBAL`, `isValidYoutubeUrl`, `getYoutubeEmbedUrl`, `isTiptapEditorEmpty`
  - `apps/client/src/code/pages/colors.ts` : `colorNames`, `colorMap`, `colorHexToColorName`
  - `apps/client/src/code/pages/page/arrows/arrow.ts` : `ARROW_WIDTH`, `ARROW_OFFSET`
  - `apps/client/src/code/pages/utils.ts` : `applyDocUpdate`, `revertToSnapshot` (si knip confirme après config)
  - `apps/client/src/code/stores.ts` : `appStore`, `uiStore`, `pagesStore` (réexport de stores – peut être utilisé par templates/plugins)
  - `apps/client/src/code/utils/misc.ts` : `modsMatch`, `getCtrlKeyName`, `getAltKeyName`, `getNameInitials`, `useResizeObserver`, `getRequestConfig`, `useAsyncData`, `debounceTick`, `createDoubleClickChecker`
  - `apps/client/src/stores/ui.ts` : `leftSidebarSectionNames`, `leftSidebarSectionIndexes`
  - `apps/client/src/boot/internals.universal.ts` : `default`

- **app-server**
  - `apps/app-server/src/utils/cookies.ts` : `setCookie`, `clearCookie`
  - `apps/app-server/src/utils/jwt.ts` : `decodeAccessJWT`
  - `apps/app-server/src/utils/invites.ts` : `getAdminUserId`
  - `apps/app-server/src/utils/notifications.ts` : `notificationRequestSchema`
  - `apps/app-server/src/trpc/helpers.ts` : `optionalAuthHelper`

Pour chaque symbole, faire une recherche d’usage (grep / “Find references”) avant suppression.

---

## 4. Types exportés inutilisés (43)

Souvent des types/interfaces utilisés seulement en interne ou destinés à l’API publique. À traiter après les exports de valeurs.

- **app-server** : `InferProcedureOutput`, `GroupKeyRotationValues`, `GroupCreationSchema`, `StoredInvite`, `UserRegistrationSchema`
- **client** : nombreux types dans `pages/page/` (ex. `IArrowReact`, `ICameraReact`, `IPinchingReact`, `PresenceState`, `IEditingReact`, `IDraggingReact`, interfaces note/region/selection, `AppStore`, `AuthStore`, `UIStore`, `LeftSidebarSectionName`, etc.)
- **collab-server** : `AwarenessChanges`

**Recommandation :** garder les types s’ils font partie de l’API publique d’un package ; sinon, les passer en non exportés ou les supprimer après vérification.

---

## 5. Dépendances

### 5.1 Dépendances non listées (à ajouter)

- `@tiptap/pm/tables` – utilisée dans `apps/client/src/boot/tiptap.client/extensions.ts`
- `@capacitor/clipboard` – utilisée dans `apps/client/src/code/utils/clipboard.ts`
- `@deeplib/db` – utilisée dans `apps/manager/src/index.ts` et `apps/scheduler/src/index.ts`
- `lodash` – utilisée dans `packages/@deeplib/mail` (brevo.ts, mailjet.ts, send-grid.ts) ; ajouter dans le `package.json` du package concerné

### 5.2 Dépendances / devDependencies « unused »

Knip signale des paquets sans import direct ; beaucoup sont utilisés par :

- Config (Quasar, Vite, PostCSS, Electron, etc.)
- Build / scripts (syncpack, sonarqube-scanner, etc.)
- Polyfills ou code conditionnel (Capacitor, RevenueCat, etc.)

Ne pas retirer sans vérifier les scripts, configs et chemins dynamiques. Pour les libs mail (Brevo, SendGrid, Mailjet, nodemailer), vérifier que tous les chemins d’envoi d’email sont bien couverts.

---

## 6. Recommandations

1. **Fichiers morts certains**  
   - Décider du sort de `apps/app-server/src/fastify/app-store-webhook.ts` (brancher ou supprimer).  
   - Supprimer ou déplacer `test-superjson.js` si inutile.

2. **Knip**  
   - Ajouter un `knip.json` (ou équivalent) par workspace pour :  
     - ignorer les entry points, boot files, composants Vue référencés par le build ;  
     - ignorer les procédures tRPC / WebSocket enregistrées dynamiquement.  
   - Réexécuter knip puis traiter en priorité les **exports** et **types** restants.

3. **Exports / types**  
   - Pour chaque symbole listé en §3.2 et §4, faire une recherche d’usage.  
   - Ne pas supprimer les exports d’API publique (packages, stores exposés).

4. **Dépendances**  
   - Ajouter les **unlisted dependencies** dans les bons `package.json`.  
   - Auditer les **unused** (surtout app-server et client) avant suppression.

5. **Build / tests**  
   - Après toute suppression, lancer build et tests pour éviter les régressions.

---

## 7. Relancer l’analyse

```bash
npx knip --no-progress
```

Avec une config knip adaptée (workspaces, ignore, plugins Vue/Quasar), les listes « Unused files » et « Unused exports » seront plus pertinentes et actionnables.
