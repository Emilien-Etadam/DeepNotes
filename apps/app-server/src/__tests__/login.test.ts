import sodium from 'libsodium-wrappers-sumo';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authenticator } from 'otplib';

const mocks = vi.hoisted(() => {
  const executeTakeFirst = vi.fn();
  const query = {
    where: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    executeTakeFirst,
  };

  return {
    executeTakeFirst,
    db: {
      selectFrom: vi.fn(() => query),
    },
  computePasswordHash: vi.fn(() => '$argon2id$v=19$m=32768,t=3,p=1$dummy$dummy'),
  decryptUserRehashedLoginHash: vi.fn(() => new Uint8Array([1, 2, 3])),
  encryptUserRehashedLoginHash: vi.fn(() => new Uint8Array([8])),
  derivePasswordValues: vi.fn(() => ({
    hash: new Uint8Array([3]),
    salt: new Uint8Array([5]),
    key: new Uint8Array([4]),
  })),
  getUserDevice: vi.fn().mockResolvedValue({
    id: 'device-1',
    trusted: false,
  }),
  generateSessionValues: vi.fn().mockResolvedValue({
    sessionId: 'session-1',
    sessionKey: new Uint8Array([99]),
    refreshCode: 'refresh-code',
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  }),
  getPasswordHashValues: vi.fn(() => ({
    saltBytes: new Uint8Array([1]),
    hashBytes: new Uint8Array([2]),
    timeCost: 2,
    memoryCost: 32,
  })),
  createPrivateKeyring: vi.fn(() => ({
    unwrapSymmetric: () => ({ wrappedValue: new Uint8Array([21, 22]) }),
  })),
  createSymmetricKeyring: vi.fn(() => ({
    unwrapSymmetric: () => ({ wrappedValue: new Uint8Array([31, 32]) }),
  })),
  decryptUserAuthenticatorSecret: vi.fn(() => 'totp-secret'),
  decryptRecoveryCodes: vi.fn(() => ['code-a', 'code-b']),
  encryptRecoveryCodes: vi.fn(() => new Uint8Array([7, 7, 7])),
  verifyRecoveryCode: vi.fn(() => false),
  sendRegistrationEmail: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('src/utils/crypto', () => ({
  TARGET_OPS_LIMIT: 2,
  TARGET_MEM_LIMIT: 32 * 1048576,
  computePasswordHash: mocks.computePasswordHash,
  decryptUserRehashedLoginHash: mocks.decryptUserRehashedLoginHash,
  encryptUserRehashedLoginHash: mocks.encryptUserRehashedLoginHash,
  derivePasswordValues: mocks.derivePasswordValues,
  decryptUserAuthenticatorSecret: mocks.decryptUserAuthenticatorSecret,
  decryptRecoveryCodes: mocks.decryptRecoveryCodes,
  encryptRecoveryCodes: mocks.encryptRecoveryCodes,
  verifyRecoveryCode: mocks.verifyRecoveryCode,
}));

vi.mock('@deeplib/db', async (importOriginal) => {
  const original = await importOriginal<typeof import('@deeplib/db')>();
  return {
    ...original,
    createKysely: () => mocks.db as any,
  };
});

vi.mock('src/utils/devices', () => ({
  getUserDevice: mocks.getUserDevice,
}));

vi.mock('src/utils/sessions', () => ({
  generateSessionValues: mocks.generateSessionValues,
}));

vi.mock('src/trpc/api/users/account/register', () => ({
  sendRegistrationEmail: mocks.sendRegistrationEmail,
}));

vi.mock('@stdlib/crypto', async (importOriginal) => {
  const original = await importOriginal<typeof import('@stdlib/crypto')>();
  return {
    ...original,
    getPasswordHashValues: mocks.getPasswordHashValues,
    createPrivateKeyring: mocks.createPrivateKeyring,
    createSymmetricKeyring: mocks.createSymmetricKeyring,
  };
});

function createUserRow() {
  return {
    id: 'user-1',
    email_verified: true,
    email_verification_code: 'code',
    encrypted_rehashed_login_hash: Buffer.from([1, 2, 3]),
    public_keyring: Buffer.from([7, 8, 9]),
    encrypted_private_keyring: Buffer.from([10, 11]),
    encrypted_symmetric_keyring: Buffer.from([12, 13]),
    two_factor_auth_enabled: false,
    encrypted_authenticator_secret: null,
    encrypted_recovery_codes: null,
    personal_group_id: 'group-1',
  };
}

function createCtx(input?: {
  redisGet?: (key: string) => Promise<string>;
  redisTtl?: (key: string) => Promise<number>;
}) {
  const execute = vi.fn().mockResolvedValue(undefined);
  const trx = {
    updateTable: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          execute,
        })),
      })),
    })),
  };
  return {
    req: {
      ip: '127.0.0.1',
      headers: { 'user-agent': 'vitest' },
      cookies: {},
    },
    res: {},
    redis: {
      get: vi.fn((key: string) =>
        input?.redisGet ? input.redisGet(key) : Promise.resolve('0'),
      ),
      ttl: vi.fn((key: string) =>
        input?.redisTtl ? input.redisTtl(key) : Promise.resolve(0),
      ),
      incr: vi.fn().mockResolvedValue(1),
      expire: vi.fn().mockResolvedValue(1),
    },
    dataAbstraction: {
      transaction: async (cb: (dtrx: unknown) => Promise<unknown>) => cb({ trx }),
    },
  };
}

describe('login', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();

    mocks.decryptUserRehashedLoginHash.mockReturnValue(new Uint8Array([1, 2, 3]));
    mocks.derivePasswordValues.mockReturnValue({
      hash: new Uint8Array([3]),
      salt: new Uint8Array([5]),
      key: new Uint8Array([4]),
    });
    mocks.getUserDevice.mockResolvedValue({
      id: 'device-1',
      trusted: false,
    });
    mocks.generateSessionValues.mockResolvedValue({
      sessionId: 'session-1',
      sessionKey: new Uint8Array([99]),
      refreshCode: 'refresh-code',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    mocks.executeTakeFirst.mockResolvedValue(createUserRow());
    mocks.decryptRecoveryCodes.mockReturnValue(['code-a', 'code-b']);
    mocks.encryptRecoveryCodes.mockReturnValue(new Uint8Array([7, 7, 7]));
    mocks.verifyRecoveryCode.mockReturnValue(false);
  });

  it('retourne UNAUTHORIZED pour un mot de passe incorrect', async () => {
    const { login } = await import('src/trpc/api/sessions/login');
    vi.spyOn(sodium, 'memcmp').mockReturnValue(false);

    await expect(
      login({
        ctx: createCtx() as any,
        input: {
          email: 'user@example.com',
          loginHash: new Uint8Array([1, 2, 3]),
          rememberSession: false,
        },
      } as any),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('retourne accessToken et refreshToken pour un mot de passe correct', async () => {
    const { login } = await import('src/trpc/api/sessions/login');
    vi.spyOn(sodium, 'memcmp').mockReturnValue(true);

    const result = await login({
      ctx: createCtx() as any,
      input: {
        email: 'user@example.com',
        loginHash: new Uint8Array([1, 2, 3]),
        rememberSession: true,
      },
    } as any);

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(mocks.generateSessionValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        deviceId: 'device-1',
        rememberSession: true,
      }),
    );
  });

  it('retourne UNAUTHORIZED si email non verifie et renvoie un mail', async () => {
    const { login } = await import('src/trpc/api/sessions/login');
    vi.spyOn(sodium, 'memcmp').mockReturnValue(true);

    mocks.executeTakeFirst.mockResolvedValue({
      ...createUserRow(),
      email_verified: false,
      email_verification_code: 'verify-code-1',
    });

    await expect(
      login({
        ctx: createCtx() as any,
        input: {
          email: 'user@example.com',
          loginHash: new Uint8Array([1, 2, 3]),
          rememberSession: false,
        },
      } as any),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });

    expect(mocks.sendRegistrationEmail).toHaveBeenCalledWith({
      email: 'user@example.com',
      emailVerificationCode: 'verify-code-1',
    });
  });

  it('accepte un login avec 2FA valide', async () => {
    const { login } = await import('src/trpc/api/sessions/login');
    vi.spyOn(sodium, 'memcmp').mockReturnValue(true);
    vi.spyOn(authenticator, 'check').mockReturnValue(true);

    mocks.executeTakeFirst.mockResolvedValue({
      ...createUserRow(),
      two_factor_auth_enabled: true,
      encrypted_authenticator_secret: Buffer.from([1, 2, 3]),
    });

    const result = await login({
      ctx: createCtx() as any,
      input: {
        email: 'user@example.com',
        loginHash: new Uint8Array([1, 2, 3]),
        rememberSession: true,
        authenticatorToken: '123456',
        rememberDevice: false,
      },
    } as any);

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
  });

  it('retourne UNAUTHORIZED si utilisateur introuvable', async () => {
    const { login } = await import('src/trpc/api/sessions/login');
    mocks.executeTakeFirst.mockResolvedValue(undefined);

    await expect(
      login({
        ctx: createCtx() as any,
        input: {
          email: 'missing@example.com',
          loginHash: new Uint8Array([1, 2, 3]),
          rememberSession: false,
        },
      } as any),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('retourne aussi sessionKey pour un login reussi sans 2FA', async () => {
    const { login } = await import('src/trpc/api/sessions/login');
    vi.spyOn(sodium, 'memcmp').mockReturnValue(true);
    mocks.executeTakeFirst.mockResolvedValue(createUserRow());

    const result = await login({
      ctx: createCtx() as any,
      input: {
        email: 'user@example.com',
        loginHash: new Uint8Array([1, 2, 3]),
        rememberSession: true,
      },
    } as any);

    expect(result.sessionKey).toEqual(new Uint8Array([99]));
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
  });

  it("valide l'input: email vide rejete", async () => {
    const { loginProcedure } = await import('src/trpc/api/sessions/login');
    const procedure = loginProcedure() as any;
    const parser = procedure._def.inputs[0] as { parseAsync: (input: unknown) => Promise<unknown> };

    await expect(
      parser.parseAsync({
        email: '',
        loginHash: new Uint8Array([1, 2, 3]),
        rememberSession: false,
      }),
    ).rejects.toBeDefined();
  });

  it('retourne TOO_MANY_REQUESTS si trop de tentatives echouees', async () => {
    const { login } = await import('src/trpc/api/sessions/login');

    await expect(
      login({
        ctx: createCtx({
          redisGet: async (key) =>
            key.startsWith('email-failed-login-attempts') ? '4' : '0',
          redisTtl: async () => 600,
        }) as any,
        input: {
          email: 'user@example.com',
          loginHash: new Uint8Array([1, 2, 3]),
          rememberSession: false,
        },
      } as any),
    ).rejects.toMatchObject({ code: 'TOO_MANY_REQUESTS' });
  });

  it("2FA: sans token ni recoveryCode -> UNAUTHORIZED", async () => {
    const { login } = await import('src/trpc/api/sessions/login');
    vi.spyOn(sodium, 'memcmp').mockReturnValue(true);
    mocks.executeTakeFirst.mockResolvedValue({
      ...createUserRow(),
      two_factor_auth_enabled: true,
    });

    await expect(
      login({
        ctx: createCtx() as any,
        input: {
          email: 'user@example.com',
          loginHash: new Uint8Array([1, 2, 3]),
          rememberSession: true,
        },
      } as any),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('2FA: authenticatorToken invalide -> UNAUTHORIZED + increment', async () => {
    const { login } = await import('src/trpc/api/sessions/login');
    vi.spyOn(sodium, 'memcmp').mockReturnValue(true);
    vi.spyOn(authenticator, 'check').mockReturnValue(false);
    mocks.executeTakeFirst.mockResolvedValue({
      ...createUserRow(),
      two_factor_auth_enabled: true,
      encrypted_authenticator_secret: Buffer.from([1, 2, 3]),
    });

    const ctx = createCtx();

    await expect(
      login({
        ctx: ctx as any,
        input: {
          email: 'user@example.com',
          loginHash: new Uint8Array([1, 2, 3]),
          rememberSession: true,
          authenticatorToken: 'bad-token',
          rememberDevice: false,
        },
      } as any),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });

    expect(ctx.redis.incr).toHaveBeenCalled();
    expect(ctx.redis.expire).toHaveBeenCalled();
  });

  it('2FA: recoveryCode avec encrypted_recovery_codes null -> UNAUTHORIZED', async () => {
    const { login } = await import('src/trpc/api/sessions/login');
    vi.spyOn(sodium, 'memcmp').mockReturnValue(true);
    mocks.executeTakeFirst.mockResolvedValue({
      ...createUserRow(),
      two_factor_auth_enabled: true,
      encrypted_recovery_codes: null,
    });

    await expect(
      login({
        ctx: createCtx() as any,
        input: {
          email: 'user@example.com',
          loginHash: new Uint8Array([1, 2, 3]),
          rememberSession: true,
          recoveryCode: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        },
      } as any),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('2FA: recoveryCode invalide (aucun match) -> UNAUTHORIZED', async () => {
    const { login } = await import('src/trpc/api/sessions/login');
    vi.spyOn(sodium, 'memcmp').mockReturnValue(true);
    mocks.verifyRecoveryCode.mockReturnValue(false);
    mocks.executeTakeFirst.mockResolvedValue({
      ...createUserRow(),
      two_factor_auth_enabled: true,
      encrypted_recovery_codes: Buffer.from([9, 9, 9]),
    });

    await expect(
      login({
        ctx: createCtx() as any,
        input: {
          email: 'user@example.com',
          loginHash: new Uint8Array([1, 2, 3]),
          rememberSession: true,
          recoveryCode: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        },
      } as any),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('2FA: recoveryCode valide consomme le code et met a jour users', async () => {
    const { login } = await import('src/trpc/api/sessions/login');
    vi.spyOn(sodium, 'memcmp').mockReturnValue(true);
    mocks.verifyRecoveryCode.mockImplementation((...args: any[]) => {
      const [provided, stored] = args as [string, string];
      return provided === 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' && stored === 'code-a';
    });
    mocks.executeTakeFirst.mockResolvedValue({
      ...createUserRow(),
      two_factor_auth_enabled: true,
      encrypted_recovery_codes: Buffer.from([9, 9, 9]),
    });

    const ctx = createCtx();
    const result = await login({
      ctx: ctx as any,
      input: {
        email: 'user@example.com',
        loginHash: new Uint8Array([1, 2, 3]),
        rememberSession: true,
        recoveryCode: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      },
    } as any);

    expect(result.accessToken).toBe('access-token');
    expect(mocks.encryptRecoveryCodes).toHaveBeenCalledWith(['code-b']);
  });

  it('2FA: device trusted skip la verification 2FA', async () => {
    const { login } = await import('src/trpc/api/sessions/login');
    vi.spyOn(sodium, 'memcmp').mockReturnValue(true);
    const authenticatorSpy = vi.spyOn(authenticator, 'check').mockReturnValue(false);
    mocks.getUserDevice.mockResolvedValue({
      id: 'device-1',
      trusted: true,
    });
    mocks.executeTakeFirst.mockResolvedValue({
      ...createUserRow(),
      two_factor_auth_enabled: true,
      encrypted_authenticator_secret: Buffer.from([1, 2, 3]),
    });

    const result = await login({
      ctx: createCtx() as any,
      input: {
        email: 'user@example.com',
        loginHash: new Uint8Array([1, 2, 3]),
        rememberSession: true,
      },
    } as any);

    expect(result.accessToken).toBe('access-token');
    expect(authenticatorSpy).not.toHaveBeenCalled();
  });

  it('2FA: rememberDevice true met le device en trusted', async () => {
    const { login } = await import('src/trpc/api/sessions/login');
    vi.spyOn(sodium, 'memcmp').mockReturnValue(true);
    vi.spyOn(authenticator, 'check').mockReturnValue(true);
    mocks.executeTakeFirst.mockResolvedValue({
      ...createUserRow(),
      two_factor_auth_enabled: true,
      encrypted_authenticator_secret: Buffer.from([1, 2, 3]),
    });

    const ctx = createCtx();
    const result = await login({
      ctx: ctx as any,
      input: {
        email: 'user@example.com',
        loginHash: new Uint8Array([1, 2, 3]),
        rememberSession: true,
        authenticatorToken: '123456',
        rememberDevice: true,
      },
    } as any);

    expect(result.accessToken).toBe('access-token');
  });
});
