import { describe, expect, it } from 'vitest';

import { DataLayer } from '..';
import { createSymmetricKeyring } from './symmetric-keyring';

describe('symmetric-keyring', () => {
  it('creee un keyring avec une couche raw', () => {
    const keyring = createSymmetricKeyring(undefined, { raw: true });

    expect(keyring.topLayer).toBe(DataLayer.Raw);
    expect(keyring.topKey).toBeTruthy();
  });

  it('wrap/unwrap symmetric conserve la couche raw', () => {
    const keyring = createSymmetricKeyring(undefined, { raw: true });
    const wrappingKey = createSymmetricKeyring(undefined, { raw: true });

    const wrapped = keyring.wrapSymmetric(wrappingKey);
    const unwrapped = wrapped.unwrapSymmetric(wrappingKey);

    expect(unwrapped.topLayer).toBe(DataLayer.Raw);
  });

  it('decrypt remonte une erreur sur ciphertext invalide', () => {
    const keyring = createSymmetricKeyring(undefined, { raw: true });

    expect(() => keyring.decrypt(new Uint8Array([1, 2, 3]))).toThrow();
  });
});
