const STATIC_ALLOWED_ORIGINS = new Set([
  'capacitor://deepnotes.app',
  'http://localhost',
]);

export function isAllowedCorsOrigin(requestOrigin: string | undefined): boolean {
  if (process.env.DEV) {
    return true;
  }

  if (requestOrigin === undefined) {
    return true;
  }

  const allowed = new Set(STATIC_ALLOWED_ORIGINS);

  for (const value of [
    process.env.CLIENT_URL,
    process.env.CLIENT_APP_URL,
    ...(process.env.ALLOWED_ORIGINS?.split(',') ?? []),
  ]) {
    const trimmed = value?.trim();
    if (trimmed) {
      allowed.add(trimmed);
    }
  }

  return allowed.has(requestOrigin);
}
