# Migration Quasar → Vuetify ou PrimeVue (DeepNotes)

Analyse du client (`apps/client/`) au **28 mars 2026**. Aucune modification du code source n’a été effectuée pour ce document.

---

## Recommandation : Vuetify 3 plutôt que PrimeVue

Pour ce dépôt, **Vuetify 3** est le choix le plus cohérent :

- **Icônes** : le projet repose sur **MDI** (`@quasar/extras` + `mdi-v7`, noms `mdi-*` partout). Vuetify 3 intègre nativement MDI ; PrimeVue pousse plutôt PrimeIcons ou un setup à la main.
- **Sémantique UI** : layout type application (`q-layout`, `q-header`, `q-drawer`, `q-page`), champs denses, menus — proche du modèle **Material / app shell** que Vuetify formalise avec `v-app`, `v-navigation-drawer`, `v-app-bar`, etc.
- **Volume de composants** : la surface Quasar est large mais “classique” (listes, formulaires, dialogs). Les deux librairies couvrent ces besoins ; Vuetify minimise souvent l’écart mental avec Quasar sur les **drawer + toolbar + list**.

**PrimeVue** reste pertinent si l’équipe veut un look moins Material, un theming très custom (thème unstyled), ou une grille de composants “data-heavy” (DataTable avancée) — ce n’est pas le cœur actuel de DeepNotes côté client.

**Point commun difficile** : les **dialogs programmatiques** (`$q.dialog({ component: ... })` + `useDialogPluginComponent`) n’ont pas d’équivalent aussi uniforme ; il faudra un **service maison** ou des wrappers (Vuetify `v-dialog` piloté par un store / composable, PrimeVue `DynamicDialog` / service Dialog).

---

## 1. Inventaire complet

### 1.1 Composants Quasar (`<q-*>`) — occurrences d’ouverture de balise

Comptage sur `apps/client/src/**/*.vue` (balises ouvrantes `<q-…`).

| Composant | Occurrences | Fichiers distincts (approx.) |
|-----------|-------------|------------------------------|
| `q-item-section` | 123 | ~30 |
| `q-icon` | 77 | ~27 |
| `q-separator` | 69 | ~25 |
| `q-item` | 60 | ~21 |
| `q-item-label` | 57 | ~30 |
| `q-card-section` | 40 | ~19 |
| `q-tooltip` | 28 | ~12 |
| `q-list` | 26 | ~19 |
| `q-menu` | 21 | ~11 |
| `q-card-actions` | 19 | ~19 |
| `q-select` | 13 | ~5 |
| `q-page` | 10 | ~10 |
| `q-tab` | 9 | 2 (`GroupSettingsDialog`, `PagesSettingsDialog`) |
| `q-input` | 9 | ~5 |
| `q-form` | 8 | ~8 |
| `q-btn` | 8 | ~4 (dont usages directs hors `DeepBtn`) |
| `q-toolbar` | 7 | ~3 |
| `q-toolbar-title` | 6 | ~3 |
| `q-avatar` | 5 | ~5 |
| `q-space` | 3 | ~3 |
| `q-radio` | 3 | 1 (`InsertImageDialog`) |
| **`q-menu-hover`** | **3 blocs** | **1** — **composant interne** (`src/components/QMenuHover.vue`), pas Quasar |
| `q-tabs` | 2 | 2 |
| `q-page-container` | 2 | 2 |
| `q-layout` | 2 | 2 |
| `q-infinite-scroll` | 2 | 2 |
| `q-header` | 2 | 2 |
| `q-drawer` | 2 | 2 |
| `q-dialog` | 2 | 2 (`CustomDialog.vue`, `DeletionDialog.vue`) |
| `q-checkbox` | 2 | 2 |
| `q-card` | 2 | 2 |
| `q-circular-progress` | 4 | ~4 |
| `q-footer` | 1 | 1 |
| `q-file` | 1 | 1 (`InsertImageDialog.vue`) |
| `q-btn-dropdown` | 1 | 1 (`DeepBtnDropdown.vue`) |
| `q-badge` | 1 | 1 (`NotificationsBadge.vue`) |

**Note** : `DeepBtn` / `DeepBtnDropdown` encapsulent `q-btn` / `q-btn-dropdown` — une grande partie des actions passe par ces wrappers.

**Fichiers clés de structure** : `App.vue`, `layouts/HomeLayout/HomeLayout.vue`, `layouts/PagesLayout/PagesLayout.vue`, `layouts/PagesLayout/MainContent/MainContent.vue`, barres d’outils et sidebars sous `layouts/PagesLayout/`.

### 1.2 Plugins Quasar (config + usage)

Déclarés dans `apps/client/quasar.config.cjs` → `framework.plugins` :

| Plugin | Rôle Quasar | Usage observé dans le projet |
|--------|-------------|--------------------------------|
| **Notify** | toasts | Très répandu : `$quasar().notify`, `$q.notify`, types `QNotifyCreateOptions` / `QNotifyUpdateOptions` |
| **Cookies** | cookies JS | `auth.client.ts` (`Cookies.get('loggedIn')`), `router/index.ts`, `code/cookies.ts` (`import { Cookies } from 'quasar'`) |
| **Meta** | balises HTML / titre | `useMeta` (wrapper `src/code/utils/use-meta.ts` → `quasar` `useMeta`) sur de nombreuses pages |
| **Dialog** | dialogs impératifs + composants dynamiques | `$q.dialog`, `$quasar().dialog`, `asyncDialog` dans `code/utils/misc.ts` ; nombreux `component: SomeDialog.vue` |
| **Loading** | overlay chargement | **Déclaré dans la config** ; **aucune utilisation** trouvée de `$q.loading` / `Loading.show` dans `src` |

### 1.3 Directives Quasar

| Directive | Fichiers |
|-----------|----------|
| `v-close-popup` | `NoteProperties.vue`, `DisplayTopBtns.vue`, `AccountPopup.vue`, `TableContextMenu.vue`, `ManageTwoFactorAuthDialog.vue` |
| `v-ripple` | `PageItem.vue`, `Checklist.vue`, `PagePopupOptions.vue`, `TabBtn.vue`, `MiniSidebarBtn.vue`, `PageBacklinks.vue` |

Commentaire config : `quasar.config.cjs` mentionne explicitement `v-ripple` et `v-close-popup`.

### 1.4 Imports depuis `'quasar'` et types

**Valeurs / composants** : `Cookies`, `useQuasar`, `useMeta`, `QForm`, `QMenu`, types divers (`QBtnProps`, `QInputProps`, `QDialogProps`, `QSelectProps`, `QCheckboxProps`, `QItemProps`, `QListProps`, `QIconProps`, `QBtnDropdownProps`, `QMenuProps`, `QNotifyCreateOptions`, `QNotifyUpdateOptions`, `MetaOptions` via `quasar/dist/types/meta`, `Cookies`, `QDialogOptions`).

**Fichiers représentatifs** : `code/cookies.ts`, `code/utils/use-meta.ts`, `code/utils/misc.ts`, `components/TutorialTooltip.vue` (`QMenu` + ref typée), `pages/home/Account/Security/ChangePassword.vue` (`QForm`), nombreux `import type { … } from 'quasar'` dans composants et onglets de paramètres.

### 1.5 `quasar/wrappers`

Utilisé pour l’intégration CLI Quasar :

- `boot` : presque tous les fichiers `src/boot/*.ts`
- `route` : `src/router/index.ts`
- `store` : `src/stores/index.ts`

### 1.6 Utilisation de `$q` / `useQuasar`

- **Auto-import** (config Vite) : `useQuasar`, `Notify`, `Cookies`, `Dialog`, `useDialogPluginComponent`.
- **Helper** : `src/code/helpers.ts` exporte `$quasar = makeHelper('Quasar', useQuasar, '$q')` — utilisé massivement pour `notify` / `dialog` hors composants où `this.$q` n’existe pas.
- **`helpers.universal.ts`** : `$quasar(app.config.globalProperties.$q)` pour initialiser le helper avec l’instance globale.
- **`$q` dans les templates** : `DisplayMobileAltBtn.vue`, `DisplayUserAvatars.vue` (`$q.platform.is.mobile`), nombreux `@click="$q.dialog({…})"`, `$q.notify` dans quelques Vues.
- **`useQuasar()`** explicite : `DisplayLeftBtns.vue`, `DisplayMobileAltBtn.vue`, `DisplayUserAvatars.vue`.

### 1.7 Variables CSS / SASS Quasar

- **`src/css/quasar.variables.scss`** : `$primary`, `$secondary`, `$accent`, `$dark`, `$positive`, `$negative`, `$info`, `$warning`, breakpoints (`$breakpoint-*`), containers (`$container-*`). Injecté via la chaîne de build Quasar + `app.scss`.
- **Variables CSS générées** : usage de `var(--q-primary)` (ex. `Setup.vue`, `app.scss` pour checkboxes).
- **Sélecteurs internes Quasar** : nombreux `:deep(.q-field__*)`, `.q-btn`, `.q-layout`, `.q-drawer`, `.q-notification`, `.q-tooltip`, etc. dans `App.vue`, `app.scss`, pages login/setup, `DeepBtn.vue`, `PagesLayout.vue`, `RightSidebar.vue`, `MainToolbar.vue`, éditeur TipTap (`inline-math` / `math-block` NodeView), etc.

### 1.8 Classes utilitaires `q-*` (spacing / layout Quasar)

- **Utilitaires de spacing type `q-pa-*`, `q-mt-*`** : usage **faible** — ex. `q-pa-md`, `q-mt-xl` (`ErrorNotFound.vue`), `q-my-md` (`CustomInfiniteScroll.vue`, `NotificationsPopup.vue`).
- **Combinaisons `row` / `justify-center`** : présentes avec les utilitaires flex Quasar sur quelques vues (`Account.vue`, `ErrorNotFound.vue`, scroll infini, popup notifications).
- **Occurrences totales du motif de mot `q-*`** dans `*.vue` et `*.scss` sous `src` : **~1168** tokens (inclut **noms de composants** `q-item`, **classes internes** `.q-field__*`, etc.) — à traiter comme **signal de dette de renommage global**, pas seulement “padding utilities”.

### 1.9 Boot files (`apps/client/src/boot/`)

| Fichier | Rôle |
|---------|------|
| `internals.universal.ts` | Initialise l’objet `internals` (stockage, crypto, realtime, router, tiptap, etc.) via wrapper `boot` |
| `helpers.universal.ts` | Initialise `$quasar()` depuis `app.config.globalProperties.$q`, hydrate les stores Pinia côté client |
| `sodium.universal.ts` | `await sodium.ready` (libsodium) |
| `i18n.universal.ts` | `vue-i18n` + `boot` |
| `vue.universal.ts` | Expose `globalThis`, `internals`, stores sur `app.config.globalProperties` |
| `http-headers/*.universal.ts` | En-têtes (cache, X-Frame-Options, Referrer-Policy) |
| `array-at-polyfill.client.ts` | Polyfill client |
| `logger.client.ts` | Configure `mainLogger` |
| `cross-tab-session-storage.client.ts` | Session cross-onglets |
| `auth.client.ts` | Auth (`Cookies`, tokens, `realtime.connect()`) |
| `ui.client.ts` | État UI sidebar depuis `localStorage` |
| `prosemirror.client.ts` | Init ProseMirror côté client |
| `syncedstore.client.ts` | `enableVueBindings` pour `@syncedstore/core` |
| `tiptap.client/*` | Éditeur TipTap, extensions, find-and-replace |

Tous les `boot` / `route` / `store` dépendent aujourd’hui de **`quasar/wrappers`**.

### 1.10 Configuration Quasar

- **Fichier principal** : `apps/client/quasar.config.cjs` (pas de `quasar.config.js` à la racine client).
- **Mode** : scripts `quasar dev -m spa` / `quasar build -m spa` → **SPA uniquement** (pas de SSR Quasar activé dans ce fichier).
- **Router** : `vueRouterMode: 'hash'`.
- **Framework** : `dark: true`, `iconSet: 'mdi-v7'`, `extras: ['mdi-v7']`.
- **CSS** : `css: ['app.scss']`, SCSS avec `@use 'src/css/tokens'`, `includePaths`, alias Vite (libsodium, unilogr, stubs Capacitor/RevenueCat), dedupe ProseMirror, plugins `unplugin-auto-import` / `unplugin-vue-components`, `@intlify/unplugin-vue-i18n`.
- **PWA** : bloc `pwa` présent dans la config (à revoir si passage à Vite nu).
- **Fichier temporaire** : `quasar.config.cjs.temporary.compiled.*.cjs` — artefact de build, ignorer pour la migration logique.

---

## 2. Dépendances Quasar (`package.json`)

### 2.1 `apps/client/package.json`

| Package | Rôle |
|---------|------|
| **`quasar`** (^2.18.6) | Framework UI + plugins (Notify, Dialog, Meta, Cookies, Loading) |
| **`@quasar/extras`** (^1.16.7) | Icônes / polices — ici **mdi-v7** |
| **`@quasar/app-vite`** (^2.4.1, devDependency) | CLI Quasar + intégration Vite, résolution `quasar.config`, boot files, présets build |

### 2.2 Racine du monorepo

| Package | Rôle |
|---------|------|
| **`@quasar/icongenie`** | Génération / pipeline d’icônes (hors runtime client) |

---

## 3. Analyse de complexité par famille de composants

Légende : **F** = facile, **M** = moyen, **D** = difficile.

| Composant Quasar | Complexité | Commentaire |
|------------------|------------|-------------|
| `q-icon`, `q-separator`, `q-space`, `q-badge` | F | Mapping direct vers icônes / dividers / spacers / badges |
| `q-btn` (dont via `DeepBtn`) | M | Props couleur, loading, slots ; ripple → remplacer par comportement équivalent |
| `q-input`, `q-field` (styles) | M | Nombreux overrides `:deep(.q-field__*)` à reporter sur le nouveau design system |
| `q-select` (slots options, `emit-value`, `map-options`) | M à D | `RoleSelect`, dialogs avec sélecteurs — valider équivalence comportementale |
| `q-checkbox`, `q-radio` | M | Wrappers existants `Checkbox.vue`, `Radio.vue` simplifient la migration |
| `q-list` / `q-item` / `q-item-section` / `q-item-label` | M | Listes denses, `clickable`, `avatar`, `side` — recomposition en `v-list` PrimeVue ou listes Vuetify |
| `q-menu`, `q-tooltip` | M | Positionnement, `auto-close`, ancres — tests UI nécessaires |
| **`q-menu-hover` (interne)** | D | Pattern activator/menu réutilisé dans `TableContextMenu.vue` — à réimplémenter (composable + menu cible) |
| `q-dialog` + `q-card` *déclaratifs* | M | `CustomDialog`, `DeletionDialog` : adapter slots / fullscreen / persistent |
| **`$q.dialog` programmatique** | **D** | Nombreux appels `component: …` ; **`useDialogPluginComponent`** dans `CustomDialog` / `DeletionDialog` — refonte en service + dialogs pilotés par état |
| `q-layout`, `q-header`, `q-footer`, `q-drawer`, `q-page`, `q-page-container` | M à D | Squelette app entier ; breakpoints mini drawer dans `PagesLayout.vue` (classes `.q-drawer--mini`) |
| `q-tabs` / `q-tab` | M | Deux dialogs de réglages à onglets |
| `q-form` | M | Validation HTML / submit — recâbler sur patterns Vuetify/PrimeVue |
| `q-infinite-scroll` | M | `CustomInfiniteScroll`, `NotificationsPopup` — alternative `IntersectionObserver` ou composant équivalent |
| `q-file` | M | Un flux (`InsertImageDialog`) |
| `q-circular-progress` | F à M | `LoadingOverlay`, scroll infini |
| `TutorialTooltip` + `QMenu` + `updatePosition()` | D | API impérative de position — réimplémentation ciblée |

**Plugins** :

| Plugin | Complexité | Commentaire |
|--------|------------|-------------|
| Notify | M | Nombreux appels + notifications dynamiques mises à jour (`QNotifyUpdateOptions`) |
| Cookies | F | Remplaçable par `js-cookie` ou util interne |
| Meta | M | Migrer vers `@vueuse/head` ou `unhead` |
| Dialog | D | Voir ci-dessus |
| Loading | F | Peu ou pas d’usage effectif — peut être retiré ou remplacé par overlay maison |

---

## 4. Plan de migration proposé (phases)

### Phase 1 — Build system : `@quasar/app-vite` → Vite nu

- Créer `vite.config.ts` reprenant : alias, `define`, SCSS `additionalData`, dedupe ProseMirror, plugins i18n / auto-import (sans presets `quasar`), visualizer optionnel.
- Remplacer l’entrée Quasar par `createApp` standard, montage manuel de `vue-router`, Pinia, i18n.
- Remplacer **`quasar/wrappers`** :  
  - `boot/*` → exécution ordonnée de fonctions `setupApp(app, ctx)` depuis un `main.ts`.  
  - `router/index.ts` : exporter une factory `createRouter(store)` sans `route()`.  
  - `stores/index.ts` : exporter Pinia sans `store()`.
- Adapter **variables Sass** : sortir les tokens de `quasar.variables.scss` vers des variables propres + thème Vuetify/PrimeVue.
- Scripts `package.json` : `vite`, `vite build` à la place de `quasar dev/build`.

### Phase 2 — Composants par fréquence décroissante

1. **Listes / items** (`q-list`, `q-item`, `q-item-section`, `q-item-label`, `q-separator`) — plus gros volume.
2. **Champs** (`q-input`, `q-select`, `PasswordField`, `TextField`, `Combobox`, styles `:deep(.q-field*)`).
3. **Boutons** (`DeepBtn`, `DeepBtnDropdown`, `q-btn` isolés).
4. **Cartes / sections** (`q-card-section`, `q-card-actions` dans les dialogs métier).
5. **Layout** (`q-layout`, `q-header`, `q-drawer`, `q-page`, `q-toolbar`, `q-footer`).
6. **Menus / tooltips** (`q-menu`, `q-tooltip`, puis **`QMenuHover` + `TableContextMenu`**).
7. **Composants rares** : `q-file`, `q-tabs`, `q-infinite-scroll`, `q-circular-progress`, `q-badge`.

### Phase 3 — Plugins et directives

- **Notify** : introduire un wrapper `toast.notify(opts)` mapant les options existantes (type, message, actions, `update`).
- **Dialog** : service unique (`openDialog(Component, props)`) + migration progressive des `onOk`/`onCancel` vers emits / promises.
- **Meta** : `unhead` / `@vueuse/head`.
- **Cookies** : couche mince sans Quasar.
- **Directives** : `v-close-popup` → fermeture explicite sur clic item ; `v-ripple` → ripple du design system ou suppression.

### Phase 4 — Classes utilitaires et thème

- Remplacer les rares `q-pa-*` / `q-mt-*` par utilitaires du nouveau framework ou par classes du design system existant (`app.scss`, tokens).
- Auditer les **`row` / `col-*`** et les alignements.
- Remplacer toutes les références **`var(--q-primary)`** et sélecteurs **`.q-*`** par variables du nouveau thème.

### Phase 5 — Nettoyage boot files et config

- Supprimer `quasar.config.cjs`, dépendances `quasar`, `@quasar/app-vite`, `@quasar/extras` (si MDI pris en charge autrement).
- Mettre à jour `src/quasar.d.ts` / références `@quasar/app-vite`.
- Vérifier **root** `package.json` pour `@quasar/icongenie` (garder seulement si encore utile).

---

## 5. Risques et points d’attention

### 5.1 Sans équivalent direct ou friction forte

- **Dialogs dynamiques** + **`useDialogPluginComponent`** : cœur de la complexité ; prévoir plusieurs jours de conception + régression sur tous les flux (groupes, pages, images, liens, 2FA, notifications).
- **`QMenuHover`** + menus contextuels tableau : pattern custom à porter tel quel sur un autre stack.
- **`TutorialTooltip`** : dépend de `QMenu` et `updatePosition()`.

### 5.2 Modes Quasar non utilisés (risque faible côté config actuelle)

- **SSR / Electron** : non activés dans `quasar.config.cjs` du client ; la migration SPA reste le périmètre réaliste.
- **Stubs Capacitor / RevenueCat** : restent des alias Vite à reporter dans le futur `vite.config`.

### 5.3 Chiffrement E2E et collaboration temps réel

- La logique repose sur **`internals`**, **libsodium**, **Yjs / TipTap / realtime** (`auth.client.ts`, `syncedstore`, `tiptap.client`, `code/areas/realtime`) — **indépendants de Quasar** au niveau métier.
- **Seul point de couplage** : `$quasar().notify` dans `code/areas/realtime/client.ts` et chemins d’erreur — à remplacer par le futur service de notification sans toucher au protocole.

### 5.4 Dépendances internes qui tirent Quasar implicitement

- **`$quasar` / `useQuasar`** dans des **`.ts`** (pas seulement des `.vue`) : `misc.ts`, `keyboard-shortcut-map.ts`, notifications, auth, presse-papiers, etc.
- **Types `QNotifyCreateOptions`** propagés (`notifications.ts` et items de notification) : définir des types maison équivalents avant de retirer `quasar`.

### 5.5 Régression UI

- **Dark mode** forcé dans Quasar (`dark: true`) : reproduire sur le nouveau thème.
- **Accessibilité** : menus, dialogs et listes denses à retester (focus trap, clavier).

---

## 6. Synthèse des chiffres

| Métrique | Valeur |
|----------|--------|
| Composants `q-*` distincts (hors `q-menu-hover` interne) | ~40 noms uniques |
| Balises ouvrantes `q-*` (total tableau §1.1) | **622** (inclut 3× `q-menu-hover` interne) |
| Fichiers Vue touchant fortement les listes / items | ~30 |
| Appels `notify` / `$quasar().notify` / `$q.notify` | ~60+ occurrences dans `src` |
| Appels `dialog` / `$q.dialog` / `asyncDialog` | ~25+ fichiers concernés |
| Plugins Quasar déclarés | 5 (dont Loading peu utilisé) |
| Directives | 2 familles (`v-ripple`, `v-close-popup`) |

---

## Annexe A — Fichiers par composant « structure » (liste exacte)

Attention lors d’un `grep` naïf : la chaîne `<q-card` matche aussi **`q-card-section`**. Pour `q-card` seul, utiliser une regex du type `<q-card([^a-z-]|/?>)`.

| Composant | Fichiers |
|-----------|----------|
| `q-layout` | `layouts/HomeLayout/HomeLayout.vue`, `layouts/PagesLayout/PagesLayout.vue` |
| `q-page-container` | `layouts/HomeLayout/HomeLayout.vue`, `layouts/PagesLayout/MainContent/MainContent.vue` |
| `q-header` | `layouts/HomeLayout/Header/Header.vue`, `layouts/PagesLayout/MainToolbar/MainToolbar.vue` |
| `q-footer` | `layouts/HomeLayout/Footer.vue` |
| `q-drawer` | `layouts/PagesLayout/LeftSidebar/LeftSidebar.vue`, `layouts/PagesLayout/RightSidebar/RightSidebar.vue` |
| `q-dialog` | `components/CustomDialog.vue`, `components/DeletionDialog.vue` |
| `q-card` (racine seulement) | `components/CustomDialog.vue`, `components/DeletionDialog.vue` |
| `q-infinite-scroll` | `components/CustomInfiniteScroll.vue`, `layouts/PagesLayout/MainToolbar/Notifications/NotificationsPopup.vue` |
| `q-tabs` | `layouts/PagesLayout/MainToolbar/PagesSettingsDialog/PagesSettingsDialog.vue`, `layouts/PagesLayout/RightSidebar/PageProperties/GroupSettingsDialog/GroupSettingsDialog.vue` |
| `q-file` | `layouts/PagesLayout/MainToolbar/InsertImageDialog.vue` |
| `q-btn-dropdown` | `components/DeepBtnDropdown.vue` |
| `q-badge` | `layouts/PagesLayout/MainToolbar/Notifications/NotificationsBadge.vue` |
| `q-circular-progress` | `components/CustomInfiniteScroll.vue`, `components/LoadingOverlay.vue`, `components/MiniSidebarBtn.vue`, `layouts/PagesLayout/MainToolbar/Notifications/NotificationsPopup.vue` |
| `q-menu-hover` (interne) | `components/QMenuHover.vue` (définition), `layouts/PagesLayout/TableContextMenu.vue` (usage) |

**Régénérer les listes** (depuis la racine du dépôt), en adaptant `NOM` :

```bash
grep -rl '<q-NOM\([[:space:]/>]\|$\)' apps/client/src --include='*.vue'
```

Pour les composants à fort volume (`q-item`, `q-separator`, etc.), cette commande liste tous les fichiers concernés.

---

*Document généré pour planifier la migration ; mettre à jour les comptages après refactors partiels.*
