import sodium from 'libsodium-wrappers-sumo';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const executeTakeFirst = vi.fn();
  const deleteExecute = vi.fn().mockResolvedValue(undefined);
  const query = {
    where: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    executeTakeFirst,
  };

  return {
    executeTakeFirst,
    db: {
      selectFrom: vi.fn(() => query),
      deleteFrom: vi.fn(() => ({
        where: vi.fn().mockReturnThis(),
        execute: deleteExecute,
      })),
    },
    dataAbstraction: vi.fn().mockResolvedValue({
      insert: vi.fn().mockResolvedValue(undefined),
      hget: vi.fn(),
    }),
    decryptUserRehashedLoginHash: vi.fn(() => new Uint8Array([1])),
    getPasswordHashValues: vi.fn(() => ({
      saltBytes: new Uint8Array([2]),
      hashBytes: new Uint8Array([3]),
    })),
    derivePasswordValues: vi.fn(() => ({
      hash: new Uint8Array([4]),
      key: new Uint8Array([5]),
      salt: new Uint8Array([6]),
    })),
    createPrivateKeyring: vi.fn(() => ({
      wrapSymmetric: vi.fn(() => ({ wrappedValue: new Uint8Array([10, 11]) })),
    })),
    createSymmetricKeyring: vi.fn(() => ({
      wrapSymmetric: vi.fn(() => ({ wrappedValue: new Uint8Array([12, 13]) })),
    })),
    createGroup: vi.fn().mockResolvedValue(undefined),
    hashUserEmail: vi.fn(() => new Uint8Array([20, 21])),
    encryptUserEmail: vi.fn(() => new Uint8Array([22, 23])),
  };
});

vi.mock('src/data/knex', () => ({
  db: mocks.db,
}));

vi.mock('src/data/data-abstraction', () => ({
  dataAbstraction: mocks.dataAbstraction,
}));

vi.mock('src/utils/crypto', () => ({
  decryptUserRehashedLoginHash: mocks.decryptUserRehashedLoginHash,
  derivePasswordValues: mocks.derivePasswordValues,
  encryptUserRehashedLoginHash: vi.fn(),
}));

vi.mock('src/utils/groups', () => ({
  createGroup: mocks.createGroup,
}));

vi.mock('@deeplib/data', async (importOriginal) => {
  const original = await importOriginal<typeof import('@deeplib/data')>();
  return {
    ...original,
    hashUserEmail: mocks.hashUserEmail,
    encryptUserEmail: mocks.encryptUserEmail,
  };
});

vi.mock('@stdlib/crypto', async (importOriginal) => {
  const original = await importOriginal<typeof import('@stdlib/crypto')>();
  return {
    ...original,
    getPasswordHashValues: mocks.getPasswordHashValues,
    createPrivateKeyring: mocks.createPrivateKeyring,
    createSymmetricKeyring: mocks.createSymmetricKeyring,
  };
});

describe('users utils', () => {
  it('hasAnyUser retourne false si aucun user', async () => {
    const { hasAnyUser } = await import('src/utils/users');
    mocks.executeTakeFirst.mockResolvedValueOnce(undefined);

    await expect(hasAnyUser()).resolves.toBe(false);
  });

  it('hasAnyUser retourne true si un user existe', async () => {
    const { hasAnyUser } = await import('src/utils/users');
    mocks.executeTakeFirst.mockResolvedValueOnce({ id: 'user-1' });

    await expect(hasAnyUser()).resolves.toBe(true);
  });

  it('assertCorrectUserPassword leve NOT_FOUND pour user introuvable', async () => {
    const { assertCorrectUserPassword } = await import('src/utils/users');
    mocks.executeTakeFirst.mockResolvedValueOnce(undefined);

    await expect(
      assertCorrectUserPassword({
        userId: 'missing',
        loginHash: new Uint8Array([1]),
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('assertCorrectUserPassword leve BAD_REQUEST pour mauvais mot de passe', async () => {
    const { assertCorrectUserPassword } = await import('src/utils/users');
    vi.spyOn(sodium, 'memcmp').mockReturnValue(false);
    mocks.executeTakeFirst.mockResolvedValueOnce({
      encrypted_rehashed_login_hash: new Uint8Array([1]),
    });

    await expect(
      assertCorrectUserPassword({
        userId: 'user-1',
        loginHash: new Uint8Array([1]),
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('assertCorrectUserPassword passe quand le mot de passe est correct', async () => {
    const { assertCorrectUserPassword } = await import('src/utils/users');
    vi.spyOn(sodium, 'memcmp').mockReturnValue(true);
    mocks.executeTakeFirst.mockResolvedValueOnce({
      encrypted_rehashed_login_hash: new Uint8Array([1]),
    });

    await expect(
      assertCorrectUserPassword({
        userId: 'user-1',
        loginHash: new Uint8Array([1]),
      }),
    ).resolves.toBeUndefined();
  });

  it('assertNonDemoAccount leve FORBIDDEN pour un compte demo', async () => {
    const { assertNonDemoAccount } = await import('src/utils/users');
    const hget = vi.fn().mockResolvedValue(true);
    mocks.dataAbstraction.mockResolvedValueOnce({ hget });

    await expect(assertNonDemoAccount({ userId: 'user-1' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('assertNonDemoAccount passe pour un compte non-demo', async () => {
    const { assertNonDemoAccount } = await import('src/utils/users');
    const hget = vi.fn().mockResolvedValue(false);
    mocks.dataAbstraction.mockResolvedValueOnce({ hget });

    await expect(assertNonDemoAccount({ userId: 'user-1' })).resolves.toBeUndefined();
  });

  it('registerUser cree les enregistrements attendus', async () => {
    const { registerUser } = await import('src/utils/users');
    const da = {
      insert: vi.fn().mockResolvedValue(undefined),
      hget: vi.fn().mockResolvedValue(false),
    };
    mocks.dataAbstraction.mockResolvedValue(da);

    const result = await registerUser({
      ip: '127.0.0.1',
      userAgent: 'vitest',
      demo: true,
      email: 'user@example.com',
      passwordValues: {
        hash: new Uint8Array([1]),
        key: new Uint8Array([2]),
        salt: new Uint8Array([3]),
      } as any,
      userId: 'user-1',
      groupId: 'group-1',
      pageId: 'page-1',
      userPublicKeyring: new Uint8Array([1]),
      userEncryptedPrivateKeyring: new Uint8Array([2]),
      userEncryptedSymmetricKeyring: new Uint8Array([3]),
      userEncryptedName: new Uint8Array([4]),
      userEncryptedDefaultNote: new Uint8Array([5]),
      userEncryptedDefaultArrow: new Uint8Array([6]),
      groupCreation: {
        groupEncryptedName: new Uint8Array([7]),
      } as any,
      pageCreation: {
        pageEncryptedSymmetricKeyring: new Uint8Array([8]),
        pageEncryptedRelativeTitle: new Uint8Array([9]),
        pageEncryptedAbsoluteTitle: new Uint8Array([10]),
      } as any,
    } as any);

    expect(result.id).toBe('user-1');
    expect(mocks.db.deleteFrom).toHaveBeenCalledWith('users');
    expect(da.insert).toHaveBeenCalled();
    expect(mocks.createGroup).toHaveBeenCalled();
  });
});
