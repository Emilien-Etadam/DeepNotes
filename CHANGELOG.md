# Changelog

## [1.1.0] - 2026-05-23

### Breaking changes

- **Client now uses relative URLs.** A reverse proxy exposing `/api/trpc`, `/ws/collab`, and `/ws/realtime` on the same origin as the client is now required.
- Removed build-time variables `APP_SERVER_URL`, `COLLAB_SERVER_URL`, and `REALTIME_SERVER_URL` from the client Docker image and environment templates. The SPA resolves API and WebSocket endpoints from `window.location` at runtime.

### Added

- `apps/client/src/lib/endpoints.ts` — helpers `apiUrl`, `apiWsUrl`, `collabUrl`, and `realtimeUrl`.
- `ALLOWED_ORIGINS` (comma-separated) on the app-server for additional CORS origins alongside `CLIENT_URL` and `CLIENT_APP_URL`.
- Vite dev-server proxy in `quasar.config.cjs` for local development without a separate reverse proxy.
- `docker-compose.override.yml.example` — optional localhost-only exposure of backend ports for debugging.

### Changed

- Client container nginx routes `/api/trpc`, `/ws/collab`, and `/ws/realtime` to internal backends (no post-build URL injection in `docker-entrypoint.sh`).
