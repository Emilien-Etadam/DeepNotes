# Audit d'homogénéité visuelle — DeepNotes Client

**Périmètre :** tous les fichiers `.vue` et `.scss` dans `apps/client/src/`  
**Date :** 23 février 2025  
**Livrable :** rapport uniquement, aucune correction appliquée.

---

## 1. Font-family

### Inventaire des déclarations

| Fichier | Ligne | Déclaration |
|---------|--------|-------------|
| `css/app.scss` | 78 | `font-family: 'Inter';` (Regular) |
| `css/app.scss` | 83 | `font-family: 'Inter';` (Bold) |
| `App.vue` | 73 | `font-family: Inter, sans-serif;` |
| `App.vue` | 117 | `font-family: monospace;` |
| `components/TextEditor.vue` | 80 | `font-family: KaTeX_Main, 'Times New Roman', Times, serif;` (contexte formules) |
| `pages/home/Account/Security/TwoFactorAuth/RecoveryCodeDialog.vue` | 183-185 | `font-family: ui-monospace, 'Cascadia Mono', 'Segoe UI Mono', 'Ubuntu Mono', 'Roboto Mono', Menlo, Monaco, Consolas, monospace;` |

### Pattern dominant

- **Interface générale :** `Inter` (défini dans `app.scss` et repris dans `App.vue`).

### Écarts et recommandations

| Fichier | Ligne | Valeur actuelle | Recommandation |
|---------|--------|-----------------|----------------|
| `App.vue` | 73 | `Inter, sans-serif` | Utiliser `'Inter', sans-serif` (guillemets cohérents avec `app.scss`) pour éviter tout fallback différent. |
| `App.vue` | 117 | `monospace` | Conserver pour le contexte (probablement code / préformaté) ; documenter comme police secondaire intentionnelle. |
| `RecoveryCodeDialog.vue` | 183-185 | Stack monospace longue | Conserver pour les codes de récupération ; éventuellement centraliser dans des variables SCSS (ex. `$font-mono`) si réutilisé ailleurs. |
| `TextEditor.vue` | 80 | KaTeX + Times | Spécifique formules mathématiques ; pas d’alignement nécessaire avec l’UI générale. |

---

## 2. Font-size

### Répartition par plage

- **&lt; 12px :**  
  - `11.3px` — `pages/home/Index/Index.vue` (l.30)  
  - `12px` — `layouts/HomeLayout/Footer.vue` (57), `DisplayBottomRight.vue` (13), `DisplayHorizontalPage.vue` (123), `DisplayWorld/.../NoteSpatialContainer.vue` (170), `NoteListContainer.vue` (275), `DisplayPasswordScreen.vue` (25), `TextEditor.vue` (26, 314), `App.vue` (160), `TutorialTooltip.vue` (32, 47), `Thumbnail.vue` (67), `ErrorNotFound.vue` (6, 30vh hors plage px)

- **12–14px :**  
  - `13px` — ArrowProperties.vue (293, 305), NoteProperties.vue (157, 169, 184), DisplayHorizontalPath.vue (9), DisplayFindAndReplace.vue (22, 33), Invitations.vue (61), TextEditor.vue (26)  
  - `13.5px` — RecentPages.vue (29, 77), CurrentPath.vue (29), FavoritePages.vue (29, 80), SelectedPages.vue (29, 107), RightSidebar.vue (42)  
  - `13.8px` — PageItemContent.vue (91)  
  - `14px` — AcceptInvite.vue (45), Register.vue (20), Login/Standard.vue (17), ComparingObsidian.vue (10), HelpLayout.vue (7)  
  - `14.5px` — HelpLayout.vue (7)

- **14–16px :**  
  - `15px` — Index.vue (22, 56, 66, 125, 152), TextEditor.vue (142), inline-math/NodeView.vue (74), HomeLayout.vue (49), Download.vue (199), Thumbnail.vue (71)  
  - `15.5px` — Index.vue (56, 66)  
  - `16px` — Très fréquent (AcceptInvite, Setup, Register, RecoveryCodeDialog, VerifyEmail, FinishRegistration, Download, TermsOfService, Whitepaper, NewPageDialog, MovePageDialog, DisplayPasswordScreen, etc.)  
  - `16.5px` — Index.vue (244)  
  - `17px` — RecoveryCodeDialog.vue (187), Help.vue (98)

- **16–20px :**  
  - `18px` — AcceptInvite (34), Setup (13), Register (269), WhitepaperItems (5, 64), TermsOfServiceItems (multiples), AccountItems (5, 16), Header (62), PlatformCard (31)  
  - `19px` — DisplayPasswordScreen.vue (2)  
  - `20px` — Header.vue (62), MovePageDialog (46), NewPageDialog (63)

- **&gt; 20px :**  
  - `21px` — Download.vue (30, 50, 71, 92, 106)  
  - `22px` — Login/Recovery.vue (2), Login/Authenticator.vue (2)  
  - `24px` — Help.vue (102)  
  - `28px` — Help/Pages (ForgotPassword, WhatIsDeepNotes, Roadmap, etc. — titre)  
  - `30vh` — ErrorNotFound.vue (6)  
  - `32px` — ComparingObsidian.vue (4)  
  - `40px` — TermsOfService.vue (25), Whitepaper.vue (25), Subscribed.vue (16)  
  - `42px` — Index.vue (180)  
  - `44px` — Index.vue (115, 142)  
  - `45px` — Download.vue (15, 118), Help.vue (6)  
  - `46px` — Index.vue (12)  
  - Et variantes en `em` : TextEditor (2.2em, 1.6em, 1.2em), App.vue (2.5em, 1.75em, 1.25em), RightButtons (1.3em), Whitepaper (0.9em)

### Pattern dominant

- **Corps de texte / formulaires :** `16px` (le plus utilisé).  
- **Sidebar / listes :** `13.5px` récurrent.  
- **Petits libellés / UI :** `12px` et `13px` fréquents.

### Valeurs isolées (une seule occurrence ou usage très limité)

| Fichier | Ligne | Valeur | Recommandation |
|---------|--------|--------|----------------|
| `Index.vue` | 30 | `11.3px` | Aligner sur 11px ou 12px selon la grille. |
| `Index.vue` | 56, 66 | `15.5px` | Aligner sur 15px ou 16px. |
| `Index.vue` | 244 | `16.5px` | Aligner sur 16px. |
| `PageItemContent.vue` | 91 | `13.8px` | Aligner sur 13px ou 14px. |
| `RecoveryCodeDialog.vue` | 187 | `17px` | Garder si volonté “entre body et titre”, sinon 16px. |
| `DisplayPasswordScreen.vue` | 2 | `19px` | Aligner sur 18px ou 20px. |
| `HelpLayout.vue` | 7 | `14.5px` | Aligner sur 14px ou 15px. |
| `Whitepaper.vue` | 268 | `0.9em` | Préférer une valeur en px cohérente avec la grille (ex. 14px). |

---

## 3. Couleurs de texte

### Familles identifiées

**Blancs / clairs :**
- `color: white` — DisplayRightBtns.vue (37)
- `#fff` — Setup.vue (175, 180), Login.vue (98), Footer.vue (68)
- `rgba(255, 255, 255, 0.92)` — AcceptInvite, Setup, Login (récurrent)
- `rgba(255, 255, 255, 0.9)` — App.vue (110, 194), Header.vue (64)
- `rgba(255, 255, 255, 0.85)` — RecentPages, CurrentPath, FavoritePages, SelectedPages, RightSidebar
- `rgba(255, 255, 255, 0.8)` — AcceptInvite (46)
- `rgba(255, 255, 255, 0.7)` — RecentPages, FavoritePages, SelectedPages (inline), ComparingObsidian (10)
- `rgba(255, 255, 255, 0.35)` — Footer.vue (60)

**Gris :**
- `#d0d0d0` — EvaluatedPasswordField (54), DisplayHorizontalPage (135, 141), PageItemContent (97)
- `#d8d8d8` — TextField.vue (readonly)
- `#c8c8c8` — Footer.vue (65)
- `#c0c0c0` — EnableTwoFactorAuthDialog (25, 68, 96), MembersTab (43)
- `#b0b0b0` — PageBacklinks.vue (17)
- `#a0a0a0` — ChangePassword.vue (96)

**Accent / liens / primaire :**
- `#60b2ff` — TextEditor (247, 250), LinkURL (61), PageBacklinks (94)
- `color.adjust(#006dd2, $lightness: 23%)` — DisplayBottomRight, DisplayHorizontalPage, PageItemContent
- `#47a7ff`, `#4fc3f7` — Login.vue (88, 91)
- `#29b6f6`, `#4fc3f7` — EnableTwoFactorAuthDialog (223, 228)
- `rgba(150, 150, 255, 1)` / `rgba(255, 150, 150, 1)` — DisplayHorizontalPage, PageItemContent (liens / erreurs)

**Erreur / négatif :**
- `red` — RecoveryCodeDialog (131), ChangePassword (97)
- `#ff4040` — EvaluatedPasswordField (47)
- `rgb(235, 87, 87)` — DeepBtn.vue (71)

**Autres :**
- `aqua` — TutorialTooltip (32, 47)
- `limegreen` — DisplayFindAndReplace (128)
- `#101010` — Index.vue (28, fond bouton)

### Pattern dominant

- Texte principal clair : `rgba(255, 255, 255, 0.92)` ou `0.9` (pages auth, App).
- Texte secondaire sidebar : `rgba(255, 255, 255, 0.85)` et `0.7` pour discret.
- Liens : dérivés de `#006dd2` (SCSS) ou `#60b2ff` en dur.

### Incohérences recommandées à unifier

| Contexte | Fichier(s) / valeur(s) | Recommandation |
|----------|-------------------------|----------------|
| Gris secondaire | `#d0d0d0`, `#d8d8d8`, `#c8c8c8`, `#c0c0c0`, `#b0b0b0`, `#a0a0a0` | Définir 2–3 niveaux (ex. secondary, muted, disabled) et utiliser des variables ou tokens. |
| Lien / bleu | `#60b2ff`, `#47a7ff`, `#4fc3f7`, `#29b6f6`, `color.adjust(#006dd2, …)` | Unifier sur la couleur primaire du thème (ex. `--q-primary` ou variable SCSS). |
| Blanc | `white`, `#fff`, `rgba(255,255,255,0.92)` | Préférer une variable (ex. `--text-primary`) pour éviter mélange hex / rgba. |
| Erreur | `red`, `#ff4040` | Utiliser la couleur “negative” du thème Quasar partout. |

---

## 4. Couleurs de fond

### Inventaire (conteneurs, cartes, modals, sidebars)

**Fonds sombres principaux :**
- `#181818` — MainContent.vue, Header.vue, HomeLayout.vue, LoadingOverlay.vue
- `#212121` / `rgb(33, 33, 33)` — LeftSidebar.vue, RightSidebar.vue
- `#141414` — RecentPages, CurrentPath, FavoritePages, SelectedPages, RightSidebar (sous-zone)
- `#202020` — Footer.vue, TextEditor (204, 217), App.vue (207)
- `#2a2a2a` — NotificationItem.vue
- `#383838` — RequestsTab, GroupsTab, InvitationsTab, PageBacklinks, MembersTab, PagesTab, VersionHistory
- `#404040` — App.vue (210), DisplayFindAndReplace (10)
- `#303030` — App.vue (210)
- `rgb(24, 24, 24)` — DisplayBackground.vue
- `rgb(29, 29, 29)` — inline-math/NodeView, math-block/NodeView

**Fonds clairs / overlays :**
- `white` / `background-color: white` — RecentPages, CurrentPath, FavoritePages, LeftSidebar (mode clair ?), image-resize, youtube-video
- `rgba(255, 255, 255, 0.05)` — Thumbnail.vue
- `rgba(255, 255, 255, 0.1)` — DisplayHorizontalPage, inline-math, math-block (hover)
- `rgba(255, 255, 255, 0.12)` — AcceptInvite, Setup, Login (champs)
- `rgba(255, 255, 255, 0.15)` — séparateurs sidebars
- `rgba(255, 255, 255, 0.2)` — App.vue, AcceptInvite, Setup, Login
- `rgba(255, 255, 255, 0.25)` — idem
- `rgba(255, 255, 255, 0.35)` — TextEditor (241)
- `rgba(0, 109, 210, 0.2)` — sélection math / édition

**Accent / composants :**
- `#309cff` — Index.vue (CTA)
- `#2196f3` — NoteResizeHandle
- `#42a5f5` — NoteDropZone, NoteSpatialContainer, NoteListContainer
- `#5e00d6` — TutorialTooltip
- `#808080` — DisplayMobileAltBtn
- `#585800` — TextEditor (highlight), WhatIsDeepNotes

### Pattern dominant

- Page / layout : `#181818`.  
- Sidebars : `#212121` ou `#141414`.  
- Cartes / panneaux dans modals : `#383838`.  
- Overlay champs : `rgba(255, 255, 255, 0.12)` à `0.25`.

### Incohérences

| Contexte | Valeurs | Recommandation |
|----------|---------|----------------|
| Fond page principale | `#181818` vs `rgb(24, 24, 24)` (DisplayBackground) | Unifier en une variable (ex. `$bg-page`). |
| Sidebar | `#212121`, `rgb(33,33,33)`, `#141414` | Une variable par niveau (sidebar / sous-zone). |
| Cartes / tabs | `#383838` partout → cohérent | Garder, éventuellement variable `$bg-card`. |
| Fonds très proches | `#202020`, `#2a2a2a`, `#303030`, `#404040` | Documenter ou réduire à 2–3 niveaux sémantiques. |

---

## 5. Boutons (q-btn, DeepBtn, DisplayBtn, ToolbarBtn)

### Combinaisons observées

**DeepBtn (wrapper q-btn) :**
- Styles globaux : `border-radius: 6px`, `text-transform: none`, fond transparent ; `bg-secondary` → bordure `rgb(255,255,255,0.25)` ; `bg-negative` → bordure + `color: rgb(235,87,87)`.
- Usages : `flat`, `round`, `dense`, `no-caps`, tailles et couleurs passées par les parents (primary, negative, positive, grey-9, etc.).

**DisplayBtn :**
- Props fixes : `color="grey-9"`, `dense`, `padding: 0`, `min-width/height` et `width/height` via `btnSize`.
- `btnSize` utilisé : **30** (DisplayLeftBtns), **32** (DisplayRightBtns, DisplayFindAndReplace), **34** (DisplayLeftBtns, DisplayRightBtns), **36** (défaut dans le composant). Header.vue passe `btn-size="46px"` (string) alors que le composant attend un **number** (défaut 36) → incohérence type et valeur.

**ToolbarBtn :**
- Défaut : `btnSize: '28px'`, `iconSize: '19px'`, `border-radius: 4px` (ou 50% si round), `padding: 0`, `margin: 4px 0`, fond transparent, hover `rgba(255,255,255,0.15)`.
- MainToolbar : `round`, `icon-size="28px"` ou `30px`, parfois `dense`.
- Header : `icon-size="32px"`, `btn-size="46px"` (sur DeepBtn dans Header, pas ToolbarBtn).
- RightMenu : `:btn-size="uiStore().loggedIn ? '36px' : '46px'"` (ToolbarBtn attend string).

**q-btn direct (sans DeepBtn) :**
- RecentPages, FavoritePages, SelectedPages : `flat`, `no-caps`, `size="20px"` (icône), style `height: 32px; min-height: 0; border-radius: 0`.
- RecoveryCodeDialog : plusieurs `q-btn` pour copier / fermer.
- NoteCollapseBtn : `q-btn`.

**Padding boutons (inline / style) :**
- `padding: 14px 25px` — Index.vue (CTA)
- `padding: 15px 25px` — Index.vue (autre CTA)
- `padding: 14px 0` / `14px 0px` — AcceptInvite, Setup, Register, Standard (bouton submit)
- `padding: 10px 22px` — VerifyEmail, FinishRegistration
- `padding: 10px 20px` — Download
- `padding: 8px 0` — Recovery, Authenticator
- `padding: 1px 5px` — DisplayTopBtns, Index (badge)
- `padding: 4px 8px` — dialogs (style objet)
- `padding: 0` — DisplayBtn, ToolbarBtn, MainToolbar, sidebars (DeepBtn)

### Pattern dominant

- **DisplayBtn :** `dense`, `padding: 0`, `grey-9`, tailles 30–36 (nombre).  
- **ToolbarBtn :** 28px, radius 4px, margin 4px 0.  
- **DeepBtn “plein” (submit) :** padding vertical ~14px, horizontal 20–25px.

### Écarts par rapport au pattern

| Fichier | Élément | Écart | Recommandation |
|---------|--------|--------|----------------|
| `Header.vue` | DeepBtn | `btn-size="46px"` (string, 46) | Passer un number `:btn-size="46"` si le design le veut ; sinon aligner sur 36. |
| `RightMenu.vue` | ToolbarBtn | `:btn-size="'36px' \| '46px'"` | Harmoniser avec les autres ToolbarBtn (28px) ou documenter “header only”. |
| `Index.vue` | CTA | `padding: 15px 25px` vs `14px 25px` | Un seul padding pour tous les CTA hero (ex. 14px 24px). |
| `VerifyEmail.vue` / `FinishRegistration.vue` | DeepBtn | `padding: 10px 22px` | Aligner sur 14px 24px si même hiérarchie que les autres primary. |
| `Download.vue` | DeepBtn | `padding: 10px 20px; font-size: 15px` | Aligner padding et taille sur les autres pages (14px 24px, 16px). |
| Sidebars | q-btn | `height: 32px`, `border-radius: 0` | Soit garder comme pattern “sidebar”, soit documenter ; éviter d’introduire d’autres valeurs (ex. 30 ou 34) sans règle. |

---

## 6. Champs de formulaire (q-input, q-select, q-field)

### Styles recensés

**TextField.vue :**
- `filled`, `input-style` : `color: readonly ? '#d8d8d8' : undefined`, pas de border/background personnalisés.

**EvaluatedPasswordField.vue :**
- `:deep(.q-field__control:before)` → `border-bottom: 0` ; `:deep(.q-field__control:after)` → `height: 0` (soulignement désactivé).

**AcceptInvite.vue, Setup.vue, Login.vue :**
- Label, native, input : `color: rgba(255, 255, 255, 0.92)` (ou équivalent).
- `q-field--filled .q-field__control::before` : `background: rgba(255, 255, 255, 0.12)` (idle), `0.2` (hover), `0.25` (focused) ; Setup utilise aussi `var(--q-primary)` pour focused.
- Setup en plus : `.q-field__native`, `.q-field__control`, `.q-field .q-field__label` avec couleurs forcées (dont `#fff` sur focus).

**Register.vue :**
- `.q-field__label` en scoped ; q-input avec `size="18px"` (icône).

**DisplayFindAndReplace.vue :**
- `:deep(.q-field__control)` → `height: 34px` ; conteneur `padding: 8px`, `border-radius: 4px`, `background-color: #404040`.

**TakeScreenshotDialog, InviteUserDialog, etc. :**
- q-input / q-select sans surcharge de style (dépendent du thème Quasar).

### Pattern dominant

- Champs “auth” (AcceptInvite, Setup, Login) : fond dérivé de `rgba(255,255,255,0.12)` → `0.25`, texte `rgba(255,255,255,0.92)`.
- Champs génériques : thème Quasar + TextField (readonly → `#d8d8d8`).
- Find & Replace : hauteur 34px, fond `#404040`, radius 4px.

### Incohérences

| Fichier / zone | Propriété | Valeur | Recommandation |
|----------------|-----------|--------|----------------|
| Readonly texte | TextField | `#d8d8d8` | Remplacer par variable “text-disabled” ou gris unifié (cf. §3). |
| Focus champ | Setup vs AcceptInvite/Login | Setup utilise `#fff` et `var(--q-primary)` | Unifier les règles : soit tout en variables, soit même palette rgba que les autres. |
| Hauteur champ | DisplayFindAndReplace | `34px` | Si d’autres champs ont une hauteur différente (ex. défaut Quasar), documenter ou unifier (ex. variable `$input-height`). |
| Border / outline | EvaluatedPasswordField | border supprimé (before/after) | Cohérent avec “filled sans underline” ; s’assurer qu’aucun autre q-field n’a un border isolé (ex. 1px) sans règle. |
| border-radius | — | Non défini explicitement sur la plupart des q-input | Laisser Quasar ou définir une variable unique (ex. 4px ou 6px) si override global. |

---

## 7. Espacements (gap, margin, padding)

### Valeurs récurrentes

**Padding :**
- `20px` — Très fréquent (sections sidebar, dialogs, NoteProperties, PageProperties, etc.)
- `12px 20px` — q-card-section titres (EnablePasswordDialog, TakeScreenshotDialog, DeletionDialog, InviteUserDialog, AcceptRequestDialog, MovePageDialog, NewPageDialog, InsertImageDialog, InsertLinkDialog, etc.)
- `16px 20px` — NoteProperties (154), ArrowProperties (290)
- `padding: 0` — MainToolbar, sidebars (conteneur DeepBtn), ToolbarBtn, DisplayBtn, RequestsTab/GroupsTab/InvitationsTab conteneurs
- `32px` — PagesSettingsDialog, GroupSettingsDialog (contenu), DisplayScreens (60), ResponsiveContainer (horizontal)
- `120px 32px` / `150px 32px` — ResponsiveContainer (auth : AcceptInvite, Setup, Register vs Login)
- `8px` — DisplayFindAndReplace (8), TutorialTooltip (8), Footer (vertical 8px)
- `4px 8px` — style objet dialogs (boutons)
- `1px 5px` — DisplayTopBtns, Index (badge)
- `6px` — ToolbarBtn margin (6px 7px), NoteMiniProperties (6), ArrowProperties (57)
- `9px` — NoteEditor ($note-padding), ArrowLabel (128), NoteSpatialContainer (146 margin)
- `4px` — NoteListContainer (244), ToolbarBtn (margin 4px 0)

**Gap :**
- `4px 8px` — Footer (56)
- `12px` — Index (46), Account Invitations (25)
- `83px`, `61px`, `56px`, `48px`, `46px`, `32px` — Index.vue (grilles desktop)

**Margin :**
- `8px` — NotificationItem (30), NotificationsPopup (12), GroupInvitationSent/GroupRequestSent (17, 31, 38 etc.)
- `6px 7px` — ToolbarContent, ObjectBtns, FormattingBtns, AlignmentBtns, BasicBtns
- `4px 0` — ToolbarBtn (54)
- `margin: 0` — TextEditor (134), TextField (37)
- `3px` — NoteListContainer (260, 292)
- `9px` — NoteSpatialContainer (146)

### Pattern dominant

- **Section contenu :** `padding: 20px` ou `12px 20px` (titres).
- **Toolbar :** `padding: 0`, margin `6px 7px` ou `4px 0`.
- **Auth :** `padding: 120px 32px` ou `150px 32px` (à unifier entre Login et les autres).
- **Gap listes / grilles :** 12px récurrent ; grilles Index avec valeurs ad hoc (32–83px).

### Valeurs orphelines ou qui cassent la grille

| Fichier | Ligne / contexte | Valeur | Recommandation |
|---------|-------------------|--------|----------------|
| `Index.vue` | 287, 298, 308, 315, 325, 332 | `gap: 83px`, `46px`, `61px`, `48px`, `56px`, `32px` | Remplacer par 2–3 valeurs (ex. 32px, 48px, 64px) ou variables de grille. |
| `Login.vue` | 3 | `padding: 150px 32px` | Aligner sur `120px 32px` comme AcceptInvite/Setup/Register, sauf volonté design différente. |
| `NoteSpatialContainer.vue` | 146 | `margin: 9px` | Aligner sur 8px ou 10px (grille 4/8). |
| `NoteListContainer.vue` | 260, 292 | `margin: 3px` | Aligner sur 4px. |
| `ToolbarContent.vue` / ObjectBtns / etc. | 709, 211, 177, 62, 59 | `margin: 6px 7px` | Soit standardiser (ex. 6px partout), soit documenter “toolbar only”. |
| `ArrowProperties.vue` | 290 | `padding: 16px 20px` | Proche de 20px ; préférer 20px si pas de raison de 16. |
| `PagesSettingsDialog.vue` | 22 | `margin: -5px; height: 42px` | Valeur négative isolée ; documenter ou remplacer par un pattern (flex/gap). |
| `GroupSettingsDialog.vue` | 22 | Idem | Idem. |
| `VerifyEmail.vue` | 5 | `padding: 160px 0` | Aligner vertical avec 120px ou 150px si même famille que auth. |

---

## Synthèse des recommandations prioritaires

1. **Font-family :** Garder Inter + monospace + KaTeX ; uniformiser la forme `'Inter', sans-serif` dans App.vue.
2. **Font-size :** Introduire une grille (ex. 12, 13, 14, 16, 18, 20, 24, 28, 32, 40) et remplacer les valeurs isolées (11.3, 13.8, 15.5, 16.5, 17, 19, 14.5, 0.9em).
3. **Couleurs texte :** Définir des tokens (primary, secondary, muted, link, error) et remplacer les hex/ rgba dispersés.
4. **Couleurs fond :** Variables SCSS/CSS pour page, sidebar, card, overlay (ex. `#181818`, `#212121`, `#383838`, `rgba(255,255,255,0.12)`).
5. **Boutons :** Type et valeur cohérents pour `btn-size` (number pour DisplayBtn) ; unifier padding CTA (14px 24px) et documenter les exceptions (header 46px, sidebar 32px).
6. **Champs :** Une seule palette pour auth (couleur texte + fond focus) ; variable pour hauteur (34px) si réutilisée.
7. **Espacements :** Grille 4/8 (4, 8, 12, 16, 20, 24, 32) ; unifier padding auth (120 vs 150) et gaps Index ; remplacer 3px/9px par 4px/8px où pertinent.

— Fin du rapport —
