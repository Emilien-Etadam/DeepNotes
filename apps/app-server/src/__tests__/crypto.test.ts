import { describe, expect, it } from 'vitest';

function ensureCryptoEnv() {
  const key = Buffer.alloc(32, 1).toString('base64');
  process.env.USER_REHASHED_LOGIN_HASH_ENCRYPTION_KEY ??= key;
  process.env.GROUP_REHASHED_PASSWORD_HASH_ENCRYPTION_KEY ??= key;
  process.env.USER_AUTHENTICATOR_SECRET_ENCRYPTION_KEY ??= key;
  process.env.USER_RECOVERY_CODES_ENCRYPTION_KEY ??= key;
}

describe('crypto utils', () => {
  it('hashRecoveryCode and verifyRecoveryCode are consistent', async () => {
    ensureCryptoEnv();
    const { hashRecoveryCode, verifyRecoveryCode } = await import(
      'src/utils/crypto'
    );

    const hashed = hashRecoveryCode('ABC-123');

    expect(verifyRecoveryCode('ABC-123', hashed)).toBe(true);
    expect(verifyRecoveryCode('NOPE-999', hashed)).toBe(false);
  });

  it('encrypt/decrypt recovery codes round-trip', async () => {
    ensureCryptoEnv();
    const { encryptRecoveryCodes, decryptRecoveryCodes } = await import(
      'src/utils/crypto'
    );

    const codes = [new Uint8Array([1, 2, 3]), new Uint8Array([9, 8, 7])];
    const encrypted = encryptRecoveryCodes(codes);
    const decrypted = decryptRecoveryCodes(encrypted);

    expect(decrypted).toEqual(codes);
  });

  it('derivePasswordValues est deterministe avec un salt explicite', async () => {
    ensureCryptoEnv();
    const { derivePasswordValues } = await import('src/utils/crypto');

    const salt = new Uint8Array(16).fill(7);
    const password = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

    const a = derivePasswordValues({ password, salt });
    const b = derivePasswordValues({ password, salt });

    expect(a.salt).toEqual(salt);
    expect(Array.from(a.hash)).toEqual(Array.from(b.hash));
  });

  it('getDeviceHash produit un hash stable de 16 octets', async () => {
    ensureCryptoEnv();
    const { getDeviceHash } = await import('src/utils/crypto');

    const h1 = getDeviceHash({
      ip: '127.0.0.1',
      userAgent: 'Vitest',
      userId: 'aaaaaaaaaaaaaaaaaaaaa',
    });
    const h2 = getDeviceHash({
      ip: '127.0.0.1',
      userAgent: 'Vitest',
      userId: 'aaaaaaaaaaaaaaaaaaaaa',
    });

    expect(h1.length).toBe(16);
    expect(Buffer.compare(h1, h2)).toBe(0);
  });
});
