import { lerp, map, minmax, posMod } from './math';

describe('lerp', () => {
  it('lerp(0, 10, 0) → 0', () => {
    expect(lerp(0, 10, 0)).toBe(0);
  });

  it('lerp(0, 10, 1) → 10', () => {
    expect(lerp(0, 10, 1)).toBe(10);
  });

  it('lerp(0, 10, 0.5) → 5', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });
});

describe('map', () => {
  it('map(5, 0, 10, 0, 100) → 50', () => {
    expect(map(5, 0, 10, 0, 100)).toBe(50);
  });

  it('map(0, 0, 10, 0, 100) → 0', () => {
    expect(map(0, 0, 10, 0, 100)).toBe(0);
  });

  it('map(10, 0, 10, 0, 100) → 100', () => {
    expect(map(10, 0, 10, 0, 100)).toBe(100);
  });
});

describe('minmax', () => {
  it('valeur dans la plage → retourne la valeur', () => {
    expect(minmax(5, 0, 10)).toBe(5);
  });

  it('valeur sous le min → retourne min', () => {
    expect(minmax(-1, 0, 10)).toBe(0);
  });

  it('valeur au-dessus du max → retourne max', () => {
    expect(minmax(15, 0, 10)).toBe(10);
  });
});

describe('posMod', () => {
  it('posMod(5, 3) → 2', () => {
    expect(posMod(5, 3)).toBe(2);
  });

  it('posMod(-1, 3) → 2', () => {
    expect(posMod(-1, 3)).toBe(2);
  });

  it('posMod(0, 3) → 0', () => {
    expect(posMod(0, 3)).toBe(0);
  });
});
