# DeepNotes

Self-hosted, end-to-end encrypted infinite canvas for visual note-taking.

Fork of [DeepNotesApp/DeepNotes](https://github.com/DeepNotesApp/DeepNotes) — cleaned up for self-hosting (no Stripe, no SaaS dependencies, all features unlocked).

## Features

- Infinite canvas with floating notes and directional arrows
- Deep page nesting (pages inside notes inside pages)
- End-to-end encryption (libsodium)
- Real-time collaboration (Yjs CRDT)
- Rich text editor (TipTap/ProseMirror) with math (KaTeX), code blocks, checklists
- Export any page as structured Markdown for AI assistants
- Groups with roles and encrypted invitations
- Two-factor authentication
- Dark mode

## Quick Install (Proxmox VE)

From the Proxmox shell:

```bash
bash -c "$(wget -qLO - https://raw.githubusercontent.com/Emilien-Etadam/DeepNotes/dev/pve-install.sh)"
```

Creates a Debian 12 LXC with Docker, clones the repo, generates all secrets, builds and starts the stack. Point your reverse proxy to the container's port 80.

## Manual Install (Docker)

```bash
git clone https://github.com/Emilien-Etadam/DeepNotes.git
cd DeepNotes
cp template.env .env
# Edit .env: set CLIENT_APP_URL, generate secrets with openssl rand -hex 32
docker compose up -d --build
```

## Architecture

Six Docker containers:

| Container       | Role                          |
|-----------------|-------------------------------|
| client          | Nginx serving Vue 3 SPA       |
| app-server      | Fastify + tRPC API            |
| collab-server   | Yjs WebSocket (CRDT sync)     |
| realtime-server | WebSocket notifications       |
| postgres        | PostgreSQL 16                 |
| keydb           | KeyDB (Redis-compatible cache)|

## Configuration

Copy `template.env` to `.env`. All secrets must be replaced with unique values generated via `openssl rand -hex 32` (for hex secrets) or `openssl rand -base64 32` (for base64 keys). `CLIENT_APP_URL` must match your public HTTPS URL.

## License

AGPL-3.0 — same as the original project.
