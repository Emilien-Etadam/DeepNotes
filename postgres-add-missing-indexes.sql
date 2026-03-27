-- Run this on production databases outside a transaction.
-- Uses CONCURRENTLY to avoid write locks on hot tables.

CREATE INDEX CONCURRENTLY IF NOT EXISTS devices_user_id_idx
  ON public.devices (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS pages_group_id_idx
  ON public.pages (group_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS page_snapshots_page_id_idx
  ON public.page_snapshots (page_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS sessions_user_id_idx
  ON public.sessions (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS sessions_invalidated_idx
  ON public.sessions (invalidated);
