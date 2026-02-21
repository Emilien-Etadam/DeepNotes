# Résilience et sauvegardes (éviter les crashs et la perte de données)

Ce doc liste ce qu’il faut mettre en place pour que DeepNotes ne crashe pas inutilement et que tu ne perdes pas tes données (local WSL puis LXC Proxmox).

---

## 1. Sauvegardes PostgreSQL (priorité haute)

**PostgreSQL est la source de vérité** : utilisateurs, groupes, pages, métadonnées, tout ce qui doit survivre à un redémarrage.

- **À faire** : sauvegardes régulières (pg_dump) et les stocker **en dehors** du même disque/volume que la base.
- **Script fourni** : `scripts/backup-postgres.sh`. À la racine du repo :  
  `./scripts/backup-postgres.sh` (crée `backups/deepnotes-pg-YYYYMMDD-HHMMSS.sql`)  
  ou `./scripts/backup-postgres.sh /chemin/externe` pour écrire les dumps ailleurs (recommandé en prod).
  Pour une restauration :  
  `docker exec -i postgres psql -U postgres deepnotes < backups/deepnotes-pg-YYYYMMDD-HHMMSS.sql`
- **Fréquence conseillée** : au moins 1× par jour (cron). En local WSL, 1× par jour ou avant chaque grosse mise à jour.
- **Rétention** : garder au moins 7 jours (ou 4 semaines si peu d’espace) et tester une restauration de temps en temps.

Sans backup Postgres, une corruption de volume ou une mauvaise manip = **perte définitive des données**.

---

## 2. KeyDB (Redis)

KeyDB stocke surtout du **cache / sessions / état temps réel**. En cas de perte, l’app peut recréer l’état à partir de Postgres (avec possiblement une reconnexion des utilisateurs).

- **Déjà en place** : volume nommé `keydb_data` → les données survivent au redémarrage des conteneurs.
- **Optionnel** : activer AOF dans `keydb.conf` pour limiter la perte en cas de crash (ex. `appendonly yes`). Par défaut KeyDB fait du RDB (snapshots).
- **Backup KeyDB** : moins critique que Postgres ; utile si tu veux éviter de recréer sessions/cache. Tu peux copier périodiquement le fichier sous `/data` du volume (ou faire un BGSAVE puis copier le dump).

---

## 3. Redémarrage automatique (déjà en place)

Dans `docker-compose.yml`, tous les services ont `restart: always` et Postgres/KeyDB ont des **healthchecks**. Donc en cas de crash, Docker redémarre les conteneurs et attend que la base soit prête avant de lancer les app.

À ne pas enlever.

---

## 4. Limiter les risques côté disque

- **Volumes Docker** : `postgres_data` et `keydb_data` sont des volumes nommés → survivent à `docker compose down` (contrairement au conteneur lui‑même). Ne pas faire `docker compose down -v` en prod sauf si tu veux tout effacer.
- **Espace disque** : surveiller l’espace sur la partition où Docker stocke les volumes (surtout Postgres). Si le disque est plein, Postgres peut refuser d’écrire → risque de corruption.
- **WSL** : les volumes Docker sont dans le disque virtuel WSL. Une sauvegarde régulière du filesystem WSL ou, mieux, des dumps Postgres **copiés vers Windows ou un autre stockage** évitent de tout perdre si le disque WSL est endommagé.
- **LXC** : même idée : sauvegardes Postgres vers un autre stockage (NFS, autre LXC, NAS).

---

## 5. Secrets et .env

- **Ne jamais committer** le `.env` de prod (déjà dans `.gitignore` normalement).
- Garder une **copie sécurisée** des secrets (mot de passe Postgres, KeyDB, `ACCESS_SECRET`, `REFRESH_SECRET`, clés d’encryption) : sans eux, tu ne pourras pas te reconnecter ni déchiffrer les données.
- En LXC, tu peux recopier ce `.env` (ou les variables) depuis un endroit sûr après déploiement.

---

## 6. Mises à jour

- Avant une mise à jour majeure : **faire un backup Postgres** puis `docker compose pull` / rebuild puis `docker compose up -d`.
- Les migrations DB (Knex) sont gérées par l’app au démarrage ; en cas de rollback de code, avoir un backup récent permet de revenir en arrière proprement.

---

## 7. Checklist rapide

| Action | Statut |
|--------|--------|
| Sauvegardes Postgres automatiques (script + cron ou tâche planifiée) | À mettre en place |
| Sauvegardes stockées ailleurs que sur le même volume/disque | À configurer |
| Test de restauration Postgres au moins une fois | À faire |
| Ne pas utiliser `docker compose down -v` en prod | À respecter |
| Surveiller l’espace disque | À faire (manuel ou monitoring) |
| Copie sécurisée des secrets (.env / mots de passe) | À faire |
| `restart: always` + healthchecks (déjà dans compose) | OK |

En suivant ça, tu réduis fortement le risque de tout perdre et de crasher sans retour.
