import { describe, expect, it } from 'vitest';

import { DataLayer } from '..';
import { createSymmetricKeyring } from './symmetric-keyring';
import { createPrivateKeyring } from './private-keyring';

describe('private-keyring', () => {
  it('creee un keyring raw avec topKey', () => {
    const keyring = createPrivateKeyring(new Uint8Array(32), { raw: true });

    expect(keyring.topLayer).toBe(DataLayer.Raw);
    expect(keyring.topKey).toBeTruthy();
  });

  it('bloque encrypt/decrypt sur keyring non-raw', () => {
    const rawKeyring = createPrivateKeyring(new Uint8Array(32), { raw: true });
    const wrappingKey = createSymmetricKeyring(undefined, { raw: true });
    const wrapped = rawKeyring.wrapSymmetric(wrappingKey);

    expect(() =>
      wrapped.encrypt(new Uint8Array([1]), {} as any, {} as any),
    ).toThrow('Cannot encrypt with non-raw keyring.');
    expect(() => wrapped.decrypt(new Uint8Array([1]))).toThrow(
      'Cannot decrypt with non-raw keyring.',
    );
  });
});
