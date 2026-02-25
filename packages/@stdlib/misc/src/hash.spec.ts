import { hashFNV1a } from './hash';

describe('hashFNV1a', () => {
  it('même string → même hash (déterministe)', () => {
    const h1 = hashFNV1a('hello');
    const h2 = hashFNV1a('hello');
    expect(h1).toBe(h2);
  });

  it('strings différentes → hashes différents', () => {
    const h1 = hashFNV1a('hello');
    const h2 = hashFNV1a('world');
    expect(h1).not.toBe(h2);
  });

  it('string vide → retourne un nombre', () => {
    const h = hashFNV1a('');
    expect(typeof h).toBe('number');
    expect(Number.isInteger(h)).toBe(true);
  });

  it('avec seed custom → hash différent du seed par défaut', () => {
    const defaultSeed = hashFNV1a('test');
    const customSeed = hashFNV1a('test', 12345);
    expect(customSeed).not.toBe(defaultSeed);
  });
});
