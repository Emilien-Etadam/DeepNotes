import { encodePasswordHash, getPasswordHashValues } from './password-hashing';

describe('encodePasswordHash', () => {
  it('encode un hash avec des paramètres connus (salt, hash, params)', () => {
    const salt = new Uint8Array([1, 2, 3]);
    const hash = new Uint8Array([4, 5, 6]);
    const timeCost = 2;
    const memoryCost = 65536;
    const result = encodePasswordHash(hash, salt, timeCost, memoryCost);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('argon2id');
    expect(result).toContain('v=19');
    expect(result).toContain('m=65536');
    expect(result).toContain('t=2');
    expect(result).toContain('p=1');
  });
});

describe('getPasswordHashValues', () => {
  it('décode le résultat de encodePasswordHash', () => {
    const salt = new Uint8Array([1, 2, 3]);
    const hash = new Uint8Array([4, 5, 6]);
    const encoded = encodePasswordHash(hash, salt, 2, 65536);
    const decoded = getPasswordHashValues(encoded);
    expect(decoded.saltBytes).toEqual(salt);
    expect(decoded.hashBytes).toEqual(hash);
    expect(decoded.memoryCost).toBe(65536);
    expect(decoded.timeCost).toBe(2);
    expect(decoded.algorithm).toBe('argon2id');
    expect(decoded.version).toBe(19);
    expect(decoded.parallelism).toBe(1);
  });

  it('round-trip : encode puis decode, vérifier l\'identité', () => {
    const salt = new Uint8Array([10, 20, 30, 40]);
    const hash = new Uint8Array([50, 60, 70, 80, 90]);
    const encoded = encodePasswordHash(hash, salt, 3, 32768);
    const decoded = getPasswordHashValues(encoded);
    expect(decoded.saltBytes).toEqual(salt);
    expect(decoded.hashBytes).toEqual(hash);
    expect(decoded.timeCost).toBe(3);
    expect(decoded.memoryCost).toBe(32768);
  });
});
