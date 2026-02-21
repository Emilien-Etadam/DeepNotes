# Point : boutons de mise en forme (toolbar) sans effet sur le texte

## Problème

- **Symptôme** : Les boutons du **milieu** de la barre d’outils (Gras, Italique, Souligné, listes, alignement, etc.) réagissent au survol et au clic, mais **aucun effet n’est appliqué au contenu** : le texte sélectionné ne change pas.
- **Ce qui fonctionne** : Les raccourcis clavier (ex. Ctrl+B pour gras) et les boutons à droite (Account, etc.). L’insertion d’image (Alt+Shift+I) fonctionne aussi.
- **Contexte** : L’éditeur de texte est TipTap/ProseMirror dans des notes sur un canvas. La toolbar est dans un en-tête fixe (`MainToolbar` / `ToolbarContent.vue`). Les commandes (ex. `page.selection.toggleMark('bold')`) s’appuient sur `page.editing.react.editor` et `format()` qui utilise soit cet éditeur (avec `chain().focus().setMark(...)`), soit la sélection « page » (notes/arrows) avec `selectAll()` sur chaque éditeur des éléments sélectionnés.

---

## Solutions testées et erreurs identifiées

### 1. `@mousedown.capture.prevent` sur le conteneur de la toolbar

- **Idée** : Éviter que le clic sur la toolbar enlève le focus à l’éditeur (et que `activeElem` disparaisse, ce qui désactivait les boutons).
- **Résultat** : Les boutons restent cliquables (plus désactivés au clic), mais **la mise en forme ne s’applique toujours pas au texte**.
- **Erreur identifiée** : Le focus est conservé, mais la **sélection texte (ProseMirror)** est vraisemblablement perdue ou réduite avant l’exécution de la commande (ordre des événements / comportement du navigateur).

### 2. Sauvegarde de la sélection au `mousedown` (capture) + restauration au clic

- **Idée** : Au `mousedown` sur la toolbar (phase capture), lire `editor.state.selection` (from/to) et la sauvegarder dans une ref ; au `click` du bouton, restaurer cette sélection avec `setTextSelection` + `focus` puis appeler la commande.
- **Implémentation** : `onToolbarMouseDown` sauve `{ from, to, editor }` si `sel.from !== sel.to` ; `onToolbarBtnClick` restaure via `editor.commands.setTextSelection(...)` et `editor.commands.focus(...)` puis `button.click(page.value)`.
- **Résultat** : **Aucun effet** sur le texte.
- **Erreur identifiée** : Au moment du `mousedown` sur la toolbar, le navigateur a très probablement **déjà modifié ou effacé** la sélection (cible = bouton/toolbar). Donc la sauvegarde au mousedown est souvent **trop tard** : sélection déjà vide ou réduite, d’où rien à restaurer ou une plage incorrecte.

### 3. Restauration via `editor.commands` au lieu de `chain()`

- **Idée** : Utiliser `editor.commands.setTextSelection(...)` et `editor.commands.focus(...)` comme dans `find-and-replace.ts`, au lieu de `chain().focus().setTextSelection().run()` (API incertaine selon la version TipTap).
- **Résultat** : Toujours **aucun effet** sur le texte (le problème n’était pas uniquement l’API de restauration).

### 4. Sauvegarde continue de la sélection via `editor.on('selectionUpdate')`

- **Idée** : Ne plus se fier au mousedown. À chaque changement d’éditeur actif, s’abonner à `editor.on('selectionUpdate')` et stocker en continu la dernière sélection non vide (from/to + editor). Au clic sur un bouton, restaurer cette « dernière sélection » puis exécuter la commande.
- **Implémentation** : `watch` sur `page.value?.editing?.react?.editor` → `editor.on('selectionUpdate', handler)` qui met à jour une ref ; cleanup au changement d’éditeur ; au clic, restauration puis `button.click(page.value)`.
- **Résultat** : **Toujours pas d’effet** sur le texte.
- **Erreurs possibles (non confirmées par les logs)** :
  - L’événement `selectionUpdate` n’existe pas ou ne se comporte pas comme prévu dans la version TipTap utilisée.
  - La ref est mise à jour mais la restauration échoue (positions invalides, document modifié, ou `setTextSelection` sans effet dans ce contexte).
  - Un autre facteur (ex. `format()` qui ne cible pas le bon éditeur, ou sélection « page » vide alors qu’on est en mode édition) fait que la commande ne s’applique pas au bon endroit.

---

## Cause racine

`q-btn` (Quasar) intercepte le `mousedown` en interne pour gérer son ripple effect et son pipeline de click. Cela rend impossible l’utilisation de `@mousedown.prevent` pour empêcher la perte de focus de l’éditeur ProseMirror. Résultat : quand on cliquait un bouton de formatage, la sélection texte dans l’éditeur était détruite avant que la commande ne s’exécute.

Toutes les tentatives de sauvegarder/restaurer la sélection (via `mousedown` capture, `selectionUpdate` listener, `setTextSelection`, etc.) échouaient parce que le problème était structurel : `q-btn` ne laisse pas le `preventDefault` agir au bon moment.

---

## Fix appliqué

Remplacement de `q-btn` par un `<button>` HTML natif dans `ToolbarBtn.vue`, avec `@mousedown.prevent` directement sur l’élément. C’est l’approche standard utilisée par les toolbars TipTap/ProseMirror (y compris les composants officiels BubbleMenu et FloatingMenu).

### Fichiers modifiés

- **`apps/client/src/components/ToolbarBtn.vue`** — `<button>` natif avec `@mousedown.prevent` et `color: inherit` pour le thème sombre.
- **`apps/client/src/layouts/PagesLayout/MainToolbar/ToolbarContent.vue`** — Suppression du code de sauvegarde/restauration de sélection (`lastTextSelectionRef`, `selectionUpdateCleanupRef`, watch `selectionUpdate`, `onToolbarMouseDown`), simplification de `onToolbarBtnClick`.
- **`apps/client/src/code/pages/page/selection/selection.ts`** — Suppression des blocs de debug (fetch logs).

### Règle à retenir

Ne jamais utiliser de composant UI framework (Quasar, Vuetify, etc.) pour les boutons d’une toolbar d’éditeur de texte riche. Toujours utiliser des `<button>` natifs avec `@mousedown.prevent` pour préserver le focus et la sélection ProseMirror.

---

*Dernière mise à jour : 2025-02 (fix appliqué : bouton natif dans ToolbarBtn).*
