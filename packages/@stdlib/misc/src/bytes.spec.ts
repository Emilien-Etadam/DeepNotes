import { equalUint8Arrays, concatUint8Arrays } from './bytes';

describe('equalUint8Arrays', () => {
  it('deux arrays identiques → true', () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([1, 2, 3]);
    expect(equalUint8Arrays(a, b)).toBe(true);
  });

  it('deux arrays différents → false', () => {
    const a = new Uint8Array([1, 2, 3]);
    const b = new Uint8Array([1, 2, 4]);
    expect(equalUint8Arrays(a, b)).toBe(false);
  });

  it('deux arrays vides → true', () => {
    const a = new Uint8Array([]);
    const b = new Uint8Array([]);
    expect(equalUint8Arrays(a, b)).toBe(true);
  });

  it('longueurs différentes → false', () => {
    const a = new Uint8Array([1, 2]);
    const b = new Uint8Array([1, 2, 3]);
    expect(equalUint8Arrays(a, b)).toBe(false);
  });
});

describe('concatUint8Arrays', () => {
  it('concat de deux arrays → résultat correct', () => {
    const a = new Uint8Array([1, 2]);
    const b = new Uint8Array([3, 4]);
    const result = concatUint8Arrays(a, b);
    expect(result).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it('concat d\'un seul array → retourne le même contenu', () => {
    const a = new Uint8Array([1, 2, 3]);
    const result = concatUint8Arrays(a);
    expect(result).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('concat de zéro arrays → array vide', () => {
    const result = concatUint8Arrays();
    expect(result).toEqual(new Uint8Array([]));
  });
});
