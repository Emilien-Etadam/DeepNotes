# Audit – Champs de formulaire et checkboxes/toggles (dark mode / placeholder)

**Périmètre :** `apps/client/src/` — fichiers `.vue` et `.scss`  
**Règle :** audit uniquement, aucune correction.

**Contexte global :** Quasar est configuré avec `dark: true` (quasar.config.cjs). L’app est en dark mode ; les contenus dans `q-dialog`, `q-menu`, `q-drawer`, `q-page` sont en contexte dark.

---

## 1. Composants de base (réutilisables)

| Fichier | Ligne | Type | Placeholder ou label | Couleur placeholder/case forcée | Contexte dark | Lisibilité estimée |
|---------|-------|------|----------------------|----------------------------------|---------------|--------------------|
| `components/TextField.vue` | 2 | q-input (via TextField) | Défini par le parent (label/placeholder) | Oui — `input-style` : `color: readonly ? '#d8d8d8' : 'rgba(255,255,255,0.92)'` ; pas de `::placeholder` dans le fichier | N/A (composant) | OK en dark ; en light le texte serait clair sur clair |
| `components/PasswordField.vue` | 2 | q-input | Défini par le parent (label) | Non | N/A | OK |
| `components/Combobox.vue` | 2 | q-select | Défini par le parent (label/options) | Non | N/A | OK |
| `components/Checkbox.vue` | 2 | q-checkbox | Défini par le parent (label/slot) | Non (style uniquement flex/marges) | N/A | OK |
| `components/EvaluatedPasswordField.vue` | 2 | PasswordField | Label par parent | Non (style .q-field__control before/after, pas couleur texte/placeholder) | N/A | OK |

---

## 2. Pages d’auth / setup (q-page)

| Fichier | Ligne | Type | Placeholder ou label | Couleur placeholder/case forcée | Contexte dark | Lisibilité estimée |
|---------|-------|------|----------------------|----------------------------------|---------------|--------------------|
| `pages/home/AcceptInvite.vue` | 52 | TextField | label="Email" | Non (couleur champ/label forcée : rgba(255,255,255,0.92)) ; pas de `::placeholder` | oui (q-page login-page) | OK |
| `pages/home/AcceptInvite.vue` | 63 | TextField | label="Display name" | Idem | oui | OK |
| `pages/home/AcceptInvite.vue` | 72 | PasswordField | label="Password" | Idem | oui | OK |
| `pages/home/AcceptInvite.vue` | 80 | PasswordField | label="Repeat password" | Idem | oui | OK |
| `pages/home/Setup.vue` | 21 | TextField | label="Email" | Oui — `:deep(input::placeholder) { color: rgba(255, 255, 255, 0.5); }` (l.157–158) | oui (q-page login-page) | OK (placeholder clair sur fond sombre) |
| `pages/home/Setup.vue` | 31 | TextField | label="Display name" | Idem | oui | OK |
| `pages/home/Setup.vue` | 40 | PasswordField | label="Password" | Idem | oui | OK |
| `pages/home/Setup.vue` | 48 | PasswordField | label="Repeat password" | Idem | oui | OK |
| `pages/home/Register.vue` | 27 | q-input | label-slot "Email" | Non ; .q-page :deep() ne cible que .q-field__label (font-size) | oui (q-page) | À vérifier (pas de style placeholder ; dépend du thème Quasar) |
| `pages/home/Register.vue` | 59 | q-input | label-slot "Display name" | Idem | oui | À vérifier |
| `pages/home/Register.vue` | 90 | EvaluatedPasswordField | label="Password" | Non | oui | OK |
| `pages/home/Register.vue` | 99 | PasswordField | label="Repeat password" | Non | oui | OK |
| `pages/home/Login/Standard.vue` | 24 | TextField | label="Email" | Non (parent Login.vue force .q-field__* et .q-checkbox__label) | oui (q-page login-page) | OK |
| `pages/home/Login/Standard.vue` | 35 | PasswordField | label="Password" | Idem | oui | OK |
| `pages/home/Login/Standard.vue` | 43 | Checkbox | label="Remember email" | Parent : .q-checkbox__label color rgba(255,255,255,0.92) | oui | OK |
| `pages/home/Login/Standard.vue` | 70 | Checkbox | label="Remember session" | Idem | oui | OK |
| `pages/home/Login/Recovery.vue` | 17 | TextField | (label par contexte) | Contexte Login → styles champs | oui | OK |
| `pages/home/Login/Authenticator.vue` | 8 | TextField | (label par contexte) | Idem | oui | OK |

---

## 3. Dialogs (q-dialog via CustomDialog)

| Fichier | Ligne | Type | Placeholder ou label | Couleur placeholder/case forcée | Contexte dark | Lisibilité estimée |
|---------|-------|------|----------------------|----------------------------------|---------------|--------------------|
| `layouts/.../TakeScreenshotDialog.vue` | 13 | q-input | label="Margin (px):" | Non | oui (q-dialog) | OK |
| `layouts/.../TakeScreenshotDialog.vue` | 24 | q-input | label="Scale (%):" | Non | oui | OK |
| `layouts/.../InsertImageDialog.vue` | 21 | q-file | label="Click here to select" | Non | oui | OK |
| `layouts/.../InsertImageDialog.vue` | 46 | TextField | label="Image URL" | Non (TextField force couleur texte, pas placeholder) | oui | OK |
| `layouts/.../InsertImageDialog.vue` | 57 | q-checkbox | label="Embed image" | Non | oui | OK |
| `layouts/.../InsertImageDialog.vue` | 13 | q-radio | label="Local image:" | Non | oui | OK |
| `layouts/.../InsertImageDialog.vue` | 37 | q-radio | label="External image:" | Non | oui | OK |
| `layouts/.../InviteUserDialog.vue` | 11 | TextField | label="User ID or Email" | Non | oui | OK |
| `layouts/.../InviteUserDialog.vue` | 20 | TextField | label="Display name" | Non | oui | OK |
| `layouts/.../InviteUserDialog.vue` | 29 | q-select | option-label="name", (Select a role) | Non | oui | OK |
| `layouts/.../AcceptRequestDialog.vue` | 18 | q-select | option-label="name" | Non | oui | OK |
| `layouts/.../ChangeRoleDialog.vue` | 14 | q-select | option-label="name" | Non | oui | OK |
| `layouts/.../MovePageDialog.vue` | 21 | q-select | label="Destination group" | Non | oui | OK |
| `layouts/.../MovePageDialog.vue` | 50 | TextField | label="Group name" | Non | oui | OK |
| `layouts/.../MovePageDialog.vue` | 83 | TextField | label="Your in-group name" | Non | oui | OK |
| `layouts/.../MovePageDialog.vue` | 34 | Checkbox | label="Set as group's main page" | Non | oui | OK |
| `layouts/.../MovePageDialog.vue` | 58 | Checkbox | label="Public for viewing" | Non | oui | OK |
| `layouts/.../MovePageDialog.vue` | 65 | Checkbox | label="Password protected" | Non | oui | OK |
| `layouts/.../GroupMemberDetailsDialog.vue` | 17 | TextField | label="User display name" | Non | oui | OK |
| `layouts/.../GroupMemberDetailsDialog.vue` | 27 | TextField | label="User ID" | Non | oui | OK |
| `layouts/.../GroupMemberDetailsDialog.vue` | 37 | TextField | label="User public key" | Non | oui | OK |
| `layouts/.../NewPageDialog.vue` | 18 | TextField | label="Page title" | Non | oui | OK |
| `layouts/.../NewPageDialog.vue` | 27 | q-select | label="Destination group" | Non | oui | OK |
| `layouts/.../NewPageDialog.vue` | 67 | TextField | label="Group name" | Non | oui | OK |
| `layouts/.../NewPageDialog.vue` | 100 | TextField | label="Your in-group name" | Non | oui | OK |
| `layouts/.../NewPageDialog.vue` | 76 | Checkbox | label="Public for viewing" | Non | oui | OK |
| `layouts/.../NewPageDialog.vue` | 84 | Checkbox | label="Password protected" | Non | oui | OK |
| `pages/home/Account/.../EnableTwoFactorAuthDialog.vue` | 86 | TextField | (secret, copy-btn, readonly) | Non | oui | OK |
| `pages/home/Account/.../EnableTwoFactorAuthDialog.vue` | 103 | TextField | placeholder="6-digit code" | Non (pas de ::placeholder dans ce fichier) | oui | À vérifier (placeholder thème Quasar en dialog) |
| `pages/home/Account/.../ManageTwoFactorAuthDialog.vue` | 48 | TextField | (contexte 2FA) | Non | oui | OK |
| `layouts/.../GeneralTab.vue` (PagesSettingsDialog) | 26 | TextField | filled, label par parent | Non | oui | OK |
| `layouts/.../GeneralTab.vue` (PagesSettingsDialog) | 45 | TextField | label="User ID" | Non | oui | OK |
| `layouts/.../GeneralTab.vue` (PagesSettingsDialog) | 56 | TextField | label="User public key" | Non | oui | OK |
| `components/DeletionDialog.vue` | 22 | q-checkbox | label="Delete permanently" | Non | oui | OK |

---

## 4. Sidebars (q-drawer) et panneaux

| Fichier | Ligne | Type | Placeholder ou label | Couleur placeholder/case forcée | Contexte dark | Lisibilité estimée |
|---------|-------|------|----------------------|----------------------------------|---------------|--------------------|
| `layouts/.../ArrowProperties.vue` | 71 | q-select | label="Source anchor" | Non | oui (RightSidebar / q-drawer) | OK |
| `layouts/.../ArrowProperties.vue` | 97 | q-select | label="Target anchor" | Non | oui | OK |
| `layouts/.../ArrowProperties.vue` | 127 | q-select | label="Source head" | Non | oui | OK |
| `layouts/.../ArrowProperties.vue` | 150 | q-select | label="Target head" | Non | oui | OK |
| `layouts/.../ArrowProperties.vue` | 186 | q-select | label="Body type" | Non | oui | OK |
| `layouts/.../ArrowProperties.vue` | 209 | q-select | label="Body style" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 236 | TextField | label="X position" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 253 | TextField | label="Y position" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 272 | q-select | label="X anchor" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 299 | q-select | label="Y anchor" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 330 | Combobox | label="Width" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 350 | Combobox | label="Head height" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 368 | Combobox | label="Body height" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 384 | Combobox | label="Container height" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 74 | Checkbox | label="Head" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 90 | Checkbox | label="Body" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 403 | Checkbox | label="Inherit color from parent" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 442 | Checkbox | label="Collapsible" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 473 | Checkbox | label="Collapsed" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 490 | Checkbox | label="Local collapsing" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 505 | Checkbox | label="Locally collapsed" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 529 | Checkbox | label="Movable" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 542 | Checkbox | label="Resizable" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 557 | Checkbox | label="Wrap head" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 570 | Checkbox | label="Wrap body" | Non | oui | OK |
| `layouts/.../NoteProperties.vue` | 585 | Checkbox | label="Read-only" | Non | oui | OK |
| `layouts/.../PageProperties.vue` | 26 | TextField | label="Relative title" | Non | oui | OK |
| `layouts/.../PageProperties.vue` | 41 | TextField | label="Absolute title" | Non | oui | OK |
| `layouts/.../PageProperties.vue` | 58 | TextField | label="Page ID" | Non | oui | OK |
| `layouts/.../GroupSettingsDialog/GeneralTab/GeneralTab.vue` | 28 | TextField | (contexte groupe) | Non | oui (dialog) | OK |
| `layouts/.../GroupSettingsDialog/GeneralTab/GeneralTab.vue` | 78 | TextField | (contexte groupe) | Non | oui | OK |
| `layouts/.../GroupSettingsDialog/GeneralTab/GeneralTab.vue` | 111 | TextField | label="Group ID" | Non | oui | OK |
| `layouts/.../GroupSettingsDialog/GeneralTab/GeneralTab.vue` | 131 | TextField | label="Distributor's public key" | Non | oui | OK |

---

## 5. Find & Replace et éditeur (overlay / q-menu)

| Fichier | Ligne | Type | Placeholder ou label | Couleur placeholder/case forcée | Contexte dark | Lisibilité estimée |
|---------|-------|------|----------------------|----------------------------------|---------------|--------------------|
| `layouts/.../DisplayFindAndReplace.vue` | 19 | TextField | placeholder="Find" | Oui — .q-input :deep() .q-field__native, .q-field__input { color: rgba(255,255,255,0.92) } ; pas de `::placeholder` | oui (overlay #404040, q-page #181818) | À vérifier (placeholder non stylé, contraste selon thème) |
| `layouts/.../DisplayFindAndReplace.vue` | 30 | TextField | placeholder="Replace" | Idem | oui | À vérifier |
| `code/areas/tiptap/math-block/NodeView.vue` | 22 | q-input | placeholder="E = mc^2", filled | Oui — :deep(.q-field__native), :deep(.q-field__input) { color: rgba(255,255,255,0.92) } ; pas de `::placeholder` | oui (q-menu, fond rgb(29,29,29)) | À vérifier (placeholder non stylé) |
| `code/areas/tiptap/inline-math/NodeView.vue` | 22 | q-input | placeholder="E = mc^2", filled | Idem | oui (q-menu) | À vérifier |

---

## 6. Autres pages (q-page)

| Fichier | Ligne | Type | Placeholder ou label | Couleur placeholder/case forcée | Contexte dark | Lisibilité estimée |
|---------|-------|------|----------------------|----------------------------------|---------------|--------------------|
| `pages/home/Account/Invitations/Invitations.vue` | 30 | TextField | label="Email", placeholder="user@example.com" | Non | oui (q-page Account) | À vérifier (placeholder non stylé dans ce fichier) |
| `pages/home/Account/General/ChangeEmail.vue` | 3 | TextField | (label par contexte) | Non | oui | OK |
| `pages/home/Account/General/ChangeEmail.vue` | 14 | TextField | (label par contexte) | Non | oui | OK |
| `layouts/.../DisplayScreens/AcceptInvitationDialog.vue` | 23 | TextField | (contexte invitation) | Non | oui (dialog/écran display) | OK |
| `layouts/.../DisplayScreens/RequestAccessDialog.vue` | 21 | TextField | (contexte request access) | Non | oui | OK |

---

## 7. Synthèse

### Placeholder
- **Couleur de placeholder forcée explicitement :**  
  - **Setup.vue** uniquement : `:deep(input::placeholder) { color: rgba(255, 255, 255, 0.5); }` — cohérent en dark.
- **Pas de `::placeholder` ailleurs :** TextField, DisplayFindAndReplace, math NodeViews, Invitations.vue, EnableTwoFactorAuthDialog (placeholder="6-digit code") dépendent du style par défaut Quasar. En dark, le contraste est en général correct mais **non garanti** partout → **à vérifier** pour : DisplayFindAndReplace, math-block/inline-math, Invitations, EnableTwoFactorAuthDialog.

### Couleur du texte des champs
- **Forcée (OK en dark) :** TextField (input-style), DisplayFindAndReplace, AcceptInvite, Setup, Login (champs + .q-checkbox__label), math NodeViews (couleur input).
- **Non forcée :** Register.vue (q-input natifs), dialogs/sidebars qui utilisent TextField/Combobox/Quasar sans override local → héritent du thème Quasar dark.

### Checkboxes / toggles
- **q-toggle :** aucune occurrence dans `apps/client/src` (recherche effectuée).
- **Couleur case/track forcée :** aucune (aucun style sur .q-checkbox__bg, .q-toggle__track, etc.).
- **Couleur label checkbox forcée :** Login.vue — `.q-checkbox__label { color: rgba(255, 255, 255, 0.92); }` (lisibilité OK en dark).
- **Contexte :** Tous les usages identifiés sont dans q-page, q-dialog ou q-drawer → contexte dark.

### Contexte dark
- **Oui :** toute l’app (Quasar `dark: true`) ; tous les champs listés sont dans q-page, q-dialog, q-menu ou q-drawer.
- **Incertain :** aucun (pas de zone en light dédiée identifiée dans le périmètre).

### Lisibilité
- **OK :** grande majorité des champs (labels et texte forcés ou thème dark cohérent).
- **À vérifier :** Register.vue (q-input sans style placeholder), DisplayFindAndReplace (placeholders "Find"/"Replace"), math-block/inline-math (placeholder "E = mc^2"), Invitations.vue (placeholder "user@example.com"), EnableTwoFactorAuthDialog (placeholder "6-digit code").
- **Illisible :** aucun cas évident en dark ; en mode light hypothétique, TextField avec couleur blanche fixe serait illisible.

---

*Rapport généré pour audit uniquement — aucune modification de code.*
