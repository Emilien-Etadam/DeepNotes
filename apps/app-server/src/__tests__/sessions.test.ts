import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const execute = vi.fn().mockResolvedValue(undefined);
  const insertQuery = {
    values: vi.fn().mockReturnThis(),
    execute,
  };
  const updateQuery = {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    execute,
  };

  return {
    execute,
    db: {
      insertInto: vi.fn(() => insertQuery),
      updateTable: vi.fn(() => updateQuery),
      selectFrom: vi.fn(() => ({
        where: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue([{ id: 'session-a' }, { id: 'session-b' }]),
      })),
    },
    dataAbstraction: vi.fn().mockResolvedValue({
      patch: vi.fn().mockResolvedValue(undefined),
    }),
    setCookies: vi.fn(),
    generateTokens: vi.fn(() => ({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })),
  };
});

vi.mock('src/data/knex', () => ({
  db: mocks.db,
}));

vi.mock('src/data/data-abstraction', () => ({
  dataAbstraction: mocks.dataAbstraction,
}));

vi.mock('src/utils/cookies', () => ({
  setCookies: mocks.setCookies,
}));

vi.mock('src/utils/jwt', () => ({
  generateTokens: mocks.generateTokens,
}));

describe('sessions utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generateSessionValues retourne sessionKey et tokens (create session)', async () => {
    const { generateSessionValues } = await import('src/utils/sessions');

    const result = await generateSessionValues({
      sessionId: 'session-1',
      userId: 'user-1',
      deviceId: 'device-1',
      rememberSession: true,
      reply: {} as any,
    });

    expect(result.sessionId).toBe('session-1');
    expect(result.sessionKey).toBeInstanceOf(Uint8Array);
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(mocks.db.insertInto).toHaveBeenCalledWith('sessions');
    expect(mocks.setCookies).toHaveBeenCalled();
  });

  it('generateSessionValues update session si deviceId absent', async () => {
    const { generateSessionValues } = await import('src/utils/sessions');

    await generateSessionValues({
      sessionId: 'session-2',
      userId: 'user-2',
      rememberSession: false,
      reply: {} as any,
    });

    expect(mocks.db.updateTable).toHaveBeenCalledWith('sessions');
    expect(mocks.generateTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: 'session-2',
        userId: 'user-2',
        rememberSession: false,
      }),
    );
  });

  it('invalidateAllSessions invalide toutes les sessions actives', async () => {
    const { invalidateAllSessions } = await import('src/utils/sessions');

    await invalidateAllSessions('user-1');

    const da = await mocks.dataAbstraction();
    expect(mocks.db.selectFrom).toHaveBeenCalledWith('sessions');
    expect(da.patch).toHaveBeenCalledTimes(2);
    expect(da.patch).toHaveBeenCalledWith(
      'session',
      'session-a',
      { invalidated: true },
      { dtrx: undefined },
    );
  });
});
