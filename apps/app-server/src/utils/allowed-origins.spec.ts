import { afterEach, describe, expect, it, vi } from 'vitest';

import { isAllowedCorsOrigin } from './allowed-origins';

describe('isAllowedCorsOrigin', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('allows CLIENT_APP_URL and ALLOWED_ORIGINS when not in dev', () => {
    vi.stubEnv('DEV', '');
    vi.stubEnv('CLIENT_URL', 'http://localhost:60379');
    vi.stubEnv('CLIENT_APP_URL', 'https://notes.example.com');
    vi.stubEnv('ALLOWED_ORIGINS', 'https://alt.example.com, https://other.example.com');

    expect(isAllowedCorsOrigin('https://notes.example.com')).toBe(true);
    expect(isAllowedCorsOrigin('https://alt.example.com')).toBe(true);
    expect(isAllowedCorsOrigin('https://other.example.com')).toBe(true);
    expect(isAllowedCorsOrigin('https://unknown.example.com')).toBe(false);
  });

  it('allows any origin in dev', () => {
    vi.stubEnv('DEV', 'true');
    expect(isAllowedCorsOrigin('https://anything.example.com')).toBe(true);
  });
});
