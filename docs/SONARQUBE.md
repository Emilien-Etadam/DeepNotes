# Analyser le code avec SonarQube / SonarCloud

Le projet peut être passé dans **SonarQube** (self-hosted) ou **SonarCloud** (SaaS) pour la qualité de code, les vulnérabilités et la dette technique. La config de base est dans `sonar-project.properties` à la racine.

---

## Prérequis

- **Node 20+** (recommandé 22.x) — le scanner JS/TS de Sonar l’utilise.
- Un **serveur SonarQube** en cours d’exécution, ou un compte **SonarCloud**.
- **pnpm install** déjà exécuté (les `node_modules` sont utilisés pour l’analyse TypeScript).

---

## 1. Lancer l’analyse (CLI)

### SonarQube (self-hosted)

```bash
# Installer le scanner une fois (global ou en devDependency)
pnpm add -D sonarqube-scanner
# ou : npm install -g sonarqube-scanner

# Depuis la racine du repo
export SONAR_HOST_URL=http://localhost:9000   # URL de ton SonarQube
export SONAR_TOKEN=xxx                        # token généré dans SonarQube (User > My Account > Security)

pnpm run sonar
# ou : pnpm exec sonar-scanner
```

### SonarCloud

```bash
pnpm add -D sonarqube-scanner

export SONAR_HOST_URL=https://sonarcloud.io
export SONAR_TOKEN=xxx   # token SonarCloud (My Account > Security)

pnpm exec sonar-scanner
```

Pour SonarCloud, il faut aussi définir l’organisation et la clé projet (souvent dans `sonar-project.properties` ou en variables) :

```properties
# À ajouter ou surcharger pour SonarCloud
sonar.organization=ton-org-github
sonar.projectKey=ton-org-github_deepnotes
```

---

## 2. Ce qui est analysé

- **Langues** : TypeScript, JavaScript, Vue (fichiers `.vue`), CSS/SCSS.
- **Périmètre** : `apps/` et `packages/` (voir `sonar.sources` dans `sonar-project.properties`).
- **Exclusions** : `node_modules`, `dist`, `.quasar`, builds Capacitor/Electron/SSR, configs, etc. (détail dans `sonar.exclusions`).

Le scanner s’appuie sur les `tsconfig.json` existants pour l’analyse TypeScript. En cas de monorepo très gros ou de manque de mémoire, tu peux décommenter dans `sonar-project.properties` :

- `sonar.typescript.tsconfigPaths` pour cibler quelques tsconfig,
- `sonar.javascript.node.maxspace=4096` pour augmenter la heap Node.

---

## 3. Couverture des tests (optionnel)

SonarQube peut afficher la couverture de code si tu fournis un rapport **LCOV**.

Avec **Vitest** :

1. Configurer Vitest pour produire un rapport lcov (à la racine ou dans le package qui lance les tests) :

```ts
// vitest.config.ts (exemple)
export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      outputDir: 'coverage',
    },
  },
});
```

2. Lancer les tests avec couverture :  
   `pnpm test -- --coverage`
3. Décommenter dans `sonar-project.properties` :  
   `sonar.javascript.lcov.reportPaths=coverage/lcov.info`
4. Relancer `pnpm exec sonar-scanner`.

---

## 4. Importer les issues ESLint (optionnel)

Pour éviter les doublons et enrichir l’analyse, tu peux exporter les résultats ESLint et les importer comme « external issues » dans SonarQube (format ESLint). Voir la doc SonarQube : [Importing External Analyzer Reports](https://docs.sonarsource.com/sonarqube-server/analyzing-source-code/importing-external-issues/external-analyzer-reports).  
Tu peux utiliser un formateur ESLint qui produit le rapport attendu, puis indiquer son chemin dans la config du projet SonarQube.

---

## 5. Résumé

| Étape | Action |
|-------|--------|
| 1 | Créer le projet dans SonarQube ou SonarCloud, récupérer la clé et le token. |
| 2 | Définir `SONAR_HOST_URL` et `SONAR_TOKEN` (et `sonar.organization` / `sonar.projectKey` pour SonarCloud). |
| 3 | À la racine : `pnpm exec sonar-scanner`. |
| 4 | (Optionnel) Activer la couverture LCOV et les rapports ESLint. |

La première analyse peut être longue (monorepo TypeScript/Vue). En cas de timeout ou de manque de mémoire, utiliser `sonar.javascript.node.maxspace` et éventuellement `sonar.typescript.tsconfigPaths` comme indiqué dans `sonar-project.properties`.
