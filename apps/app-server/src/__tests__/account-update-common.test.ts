import { beforeEach, describe, expect, it, vi } from 'vitest';

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
    getPasswordHashValues: vi.fn(() => ({
      saltBytes: new Uint8Array([10]),
      hashBytes: new Uint8Array([11]),
    })),
    derivePasswordValues: vi.fn(() => ({
      hash: new Uint8Array([12]),
      salt: new Uint8Array([13]),
      key: new Uint8Array([14]),
    })),
    decryptUserRehashedLoginHash: vi.fn(() => new Uint8Array([15])),
    encryptUserRehashedLoginHash: vi.fn(() => new Uint8Array([16])),
    encodePasswordHash: vi.fn(() => new Uint8Array([17])),
    createPrivateKeyring: vi.fn(() => ({
      unwrapSymmetric: vi.fn(() => ({ wrappedValue: new Uint8Array([21, 22]) })),
      wrapSymmetric: vi.fn(() => ({ wrappedValue: new Uint8Array([31, 32]) })),
    })),
    createSymmetricKeyring: vi.fn(() => ({
      unwrapSymmetric: vi.fn(() => ({ wrappedValue: new Uint8Array([23, 24]) })),
      wrapSymmetric: vi.fn(() => ({ wrappedValue: new Uint8Array([33, 34]) })),
    })),
  };
});

vi.mock('src/data/knex', () => ({
  db: mocks.db,
}));

vi.mock('@stdlib/crypto', async (importOriginal) => {
  const original = await importOriginal<typeof import('@stdlib/crypto')>();
  return {
    ...original,
    getPasswordHashValues: mocks.getPasswordHashValues,
    encodePasswordHash: mocks.encodePasswordHash,
    createPrivateKeyring: mocks.createPrivateKeyring,
    createSymmetricKeyring: mocks.createSymmetricKeyring,
  };
});

vi.mock('src/utils/crypto', () => ({
  TARGET_OPS_LIMIT: 2,
  TARGET_MEM_LIMIT: 32 * 1048576,
  decryptUserRehashedLoginHash: mocks.decryptUserRehashedLoginHash,
  derivePasswordValues: mocks.derivePasswordValues,
  encryptUserRehashedLoginHash: mocks.encryptUserRehashedLoginHash,
}));

describe('account-update-common', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAccountUpdateStep1Data retourne les keyrings dechiffres', async () => {
    const { getAccountUpdateStep1Data } = await import(
      'src/websocket/users/account/account-update-common'
    );

    mocks.executeTakeFirst.mockResolvedValue({
      encrypted_rehashed_login_hash: new Uint8Array([1]),
      encrypted_symmetric_keyring: new Uint8Array([2]),
      encrypted_private_keyring: new Uint8Array([3]),
    });

    const assertCorrectUserPassword = vi.fn().mockResolvedValue(undefined);
    const assertNonDemoAccount = vi.fn().mockResolvedValue(undefined);

    const result = await getAccountUpdateStep1Data({
      userId: 'user-1',
      oldLoginHash: new Uint8Array([9]),
      assertCorrectUserPassword,
      assertNonDemoAccount,
    });

    expect(assertCorrectUserPassword).toHaveBeenCalledWith({
      userId: 'user-1',
      loginHash: new Uint8Array([9]),
    });
    expect(assertNonDemoAccount).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(result.encryptedPrivateKeyring).toEqual(new Uint8Array([21, 22]));
    expect(result.encryptedSymmetricKeyring).toEqual(new Uint8Array([23, 24]));
  });

  it('getAccountUpdateStep1Data leve BAD_REQUEST si user introuvable', async () => {
    const { getAccountUpdateStep1Data } = await import(
      'src/websocket/users/account/account-update-common'
    );

    mocks.executeTakeFirst.mockResolvedValue(undefined);

    await expect(
      getAccountUpdateStep1Data({
        userId: 'user-404',
        oldLoginHash: new Uint8Array([9]),
        assertCorrectUserPassword: vi.fn().mockResolvedValue(undefined),
        assertNonDemoAccount: vi.fn().mockResolvedValue(undefined),
      }),
    ).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: 'User not found.',
    });
  });

  it('getAccountUpdateStep1Data propage erreur mot de passe incorrect', async () => {
    const { getAccountUpdateStep1Data } = await import(
      'src/websocket/users/account/account-update-common'
    );

    await expect(
      getAccountUpdateStep1Data({
        userId: 'user-1',
        oldLoginHash: new Uint8Array([9]),
        assertCorrectUserPassword: vi
          .fn()
          .mockRejectedValue(new Error('Incorrect password')),
        assertNonDemoAccount: vi.fn().mockResolvedValue(undefined),
      }),
    ).rejects.toThrow('Incorrect password');
  });

  it('buildAccountUpdateStep2Patch retourne le patch attendu', async () => {
    const { buildAccountUpdateStep2Patch } = await import(
      'src/websocket/users/account/account-update-common'
    );

    const patch = buildAccountUpdateStep2Patch({
      userId: 'user-1',
      input: {
        newLoginHash: new Uint8Array([1, 2, 3]),
        newEncryptedPrivateKeyring: new Uint8Array([4]),
        newEncryptedSymmetricKeyring: new Uint8Array([5]),
      },
    });

    expect(mocks.derivePasswordValues).toHaveBeenCalled();
    expect(mocks.encodePasswordHash).toHaveBeenCalled();
    expect(mocks.encryptUserRehashedLoginHash).toHaveBeenCalled();
    expect(patch).toEqual({
      encrypted_rehashed_login_hash: new Uint8Array([16]),
      encrypted_private_keyring: new Uint8Array([31, 32]),
      encrypted_symmetric_keyring: new Uint8Array([33, 34]),
    });
  });
});
