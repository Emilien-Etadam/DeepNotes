import sodium from 'libsodium-wrappers-sumo';
import { describe, expect, it } from 'vitest';

import { wrapSymmetricKey } from './symmetric-key';

describe('symmetric-key', () => {
  it('encrypt with includeNonce false can decrypt with explicit nonce', () => {
    const key = wrapSymmetricKey();
    const nonce = sodium.randombytes_buf(
      sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES,
    );
    const plaintext = new Uint8Array([1, 2, 3, 4]);

    const ciphertext = key.encrypt(plaintext, {
      nonce,
      includeNonce: false,
      associatedData: { ctx: 'test' },
    });

    const decrypted = key.decrypt(ciphertext, {
      nonce,
      associatedData: { ctx: 'test' },
    });

    expect(Array.from(decrypted)).toEqual(Array.from(plaintext));
  });

  it('encrypt with default includeNonce prepends nonce', () => {
    const key = wrapSymmetricKey();
    const plaintext = new Uint8Array([9, 8, 7]);

    const nonceAndCiphertext = key.encrypt(plaintext);

    expect(nonceAndCiphertext.length).toBeGreaterThan(plaintext.length);
    expect(Array.from(key.decrypt(nonceAndCiphertext))).toEqual(
      Array.from(plaintext),
    );
  });
});
