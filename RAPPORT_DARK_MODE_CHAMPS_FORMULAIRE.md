# Rapport : styles incompatibles dark mode sur champs de formulaire Quasar

**Contexte** : Application en dark mode (`dark: true` dans `quasar.config.cjs`), fond général #181818 / #1d1d1d. Plusieurs champs (q-input, q-select, q-field) affichent du texte noir sur fond gris foncé.

**Méthode** : Recherche dans `apps/client/src/` (fichiers `.vue` et `.scss`) des styles inline ou scoped qui forcent une couleur de texte sombre ou un fond clair sur les champs Quasar, et des classes qui surchargent `.q-field__native`, `.q-field__control`, `.q-input`, `.q-select`.

**Résultat** : Aucune occurrence de `color: black`, `color: #000`, `color: #333`, `background: white`, `background: #fff`, etc. directement sur des champs de formulaire. Les problèmes d’illisibilité viennent très probablement de **contexte** (champs dans un `q-menu` ou un panneau où le thème sombre Quasar ne s’applique pas, ou styles par défaut du composant). Les fichiers suivants sont concernés ou à vérifier.

---

## 1. Fichiers où des champs sont dans un contexte à risque (q-menu / panneau)

### 1.1 `apps/client/src/code/areas/tiptap/inline-math/NodeView.vue`

| Ligne | Élément | Style actuel | Problème |
|-------|--------|--------------|----------|
| 20-21 | `div` conteneur du `q-input` | `style="background-color: rgb(29, 29, 29); padding: 8px"` | Fond OK (sombre). Aucune couleur de texte sur le `q-input`. |
| 21-30 | `q-input` (textarea) dans `q-menu` | Aucun style de couleur | Le contenu du `q-menu` est souvent rendu en portail ; le thème dark peut ne pas s’appliquer, d’où texte noir par défaut. |

**Correction proposée** :  
Ajouter un bloc `<style scoped>` (ou compléter l’existant) avec un `:deep()` pour forcer la couleur du texte (et optionnellement du fond du contrôle) dans le menu, par ex. :

```scss
:deep(.q-field__native),
:deep(.q-field__input) {
  color: rgba(255, 255, 255, 0.92);
}
```

Ne pas imposer de fond clair ; laisser le fond géré par le thème ou le conteneur actuel.

---

### 1.2 `apps/client/src/code/areas/tiptap/math-block/NodeView.vue`

| Ligne | Élément | Style actuel | Problème |
|-------|--------|--------------|----------|
| 20-21 | `div` conteneur du `q-input` | `style="background-color: rgb(29, 29, 29); padding: 8px"` | Même situation que inline-math. |
| 21-30 | `q-input` dans `q-menu` | Aucun style de couleur | Même risque que 1.1. |

**Correction proposée** :  
Identique à 1.1 : ajouter `:deep(.q-field__native)` et `:deep(.q-field__input) { color: rgba(255, 255, 255, 0.92); }` (sans forcer de fond clair).

---

### 1.3 `apps/client/src/layouts/PagesLayout/MainContent/DisplayUI/DisplayFindAndReplace.vue`

| Ligne | Élément | Style actuel | Problème |
|-------|--------|--------------|----------|
| 7-10 | Conteneur du panneau | `background-color: #404040` | Fond sombre OK. |
| 153-156 | `.q-input :deep() .q-field__control` | `height: 34px` uniquement | Aucune couleur de texte. Les `TextField` (q-input) peuvent hériter du thème light si le panneau est rendu hors du layout principal. |

**Correction proposée** :  
Si les champs « Find » / « Replace » sont illisibles (texte noir sur #404040), ajouter dans le même bloc `:deep()` :

```scss
.q-field__native,
.q-field__input {
  color: rgba(255, 255, 255, 0.92);
}
```

Sinon, supprimer toute surcharge de couleur et s’assurer que le conteneur (ou un parent) a bien la classe / le thème dark Quasar.

---

## 2. Composant de champ partagé

### 2.1 `apps/client/src/components/TextField.vue`

| Ligne | Élément | Style actuel | Problème |
|-------|--------|--------------|----------|
| 5 | `q-input` | `:input-style="{ color: readonly ? '#d8d8d8' : undefined }"` | En readonly : texte #d8d8d8 (clair), OK. En mode édition : aucune couleur imposée (undefined). |

Aucun style ne **force** du texte noir ici. Si certains champs utilisant `TextField` sont noirs, c’est soit le thème Quasar (dark non appliqué dans ce contexte), soit un style ailleurs.

**Correction proposée** :  
- Soit ne rien changer et corriger les contextes (menus, dialogs) pour que le dark s’applique.  
- Soit, pour robustesse, imposer une couleur claire dans tous les cas, par ex.  
  `:input-style="{ color: readonly ? '#d8d8d8' : 'rgba(255,255,255,0.92)' }"`  
  (à adapter si vous préférez une variable CSS ou un token du thème).

---

## 3. Fichiers qui surchargent des classes Quasar sans couleur problématique

Ces fichiers touchent `.q-field*` ou `.q-input` mais **ne forcent pas** de couleur de texte sombre ni de fond clair ; ils restent compatibles dark mode.

| Fichier | Lignes | Style | Verdict |
|---------|--------|--------|--------|
| `apps/client/src/components/EvaluatedPasswordField.vue` | 107-114 | `.q-field__control:before` / `:after` (bordures / hauteur), pas de `color` ni `background` | OK |
| `apps/client/src/pages/home/AcceptInvite.vue` | 196-211 | `:deep(.q-field__label,.q-field__native,.q-field__input)` → `color: rgba(255,255,255,0.92)` ; fonds du contrôle en rgba blanc | OK (déjà clair) |
| `apps/client/src/pages/home/Setup.vue` | 146-171 | Idem : couleurs claires et fonds semi-transparents | OK |
| `apps/client/src/pages/home/Login/Login.vue` | 68-84 | Idem | OK |
| `apps/client/src/pages/home/Register.vue` | 267-270 | `.q-field__label { font-size: 18px }` uniquement | OK |
| `apps/client/src/App.vue` | 174-175 | `.q-field--disabled * { cursor: auto !important }` | OK |

Aucune correction nécessaire pour la lisibilité dark mode.

---

## 4. Fichiers sans style sur les champs

Les composants suivants utilisent `q-input`, `q-select` ou `q-field` sans aucun style inline/scoped sur la couleur ou le fond des champs :  
`Combobox.vue`, `PasswordField.vue`, `InviteUserDialog.vue`, `NewPageDialog.vue`, `MovePageDialog.vue`, `ChangeRoleDialog.vue`, `AcceptRequestDialog.vue`, etc.  
Si des champs y sont illisibles, la cause est à chercher dans le thème global (Quasar dark) ou dans le conteneur (dialog/menu) qui n’hérite pas du dark.

---

## 5. Synthèse des corrections proposées

| Fichier | Action proposée |
|---------|------------------|
| `code/areas/tiptap/inline-math/NodeView.vue` | Ajouter `:deep(.q-field__native), :deep(.q-field__input) { color: rgba(255,255,255,0.92); }` (pas de fond clair). |
| `code/areas/tiptap/math-block/NodeView.vue` | Même règle que ci-dessus. |
| `DisplayFindAndReplace.vue` | Si les champs sont illisibles : ajouter la même règle dans le bloc existant `.q-input :deep()`. Sinon, s’assurer que le thème dark s’applique au panneau. |
| `TextField.vue` | Optionnel : forcer une couleur claire en mode édition (ex. `rgba(255,255,255,0.92)`) dans `input-style` pour tous les contextes. |

Aucun autre fichier dans `apps/client/src/` ne contient de style qui **force** explicitement une couleur de texte sombre ou un fond clair sur les champs listés ; les corrections ciblent les contextes à risque (menus, panneaux) et le composant partagé `TextField.vue`.
