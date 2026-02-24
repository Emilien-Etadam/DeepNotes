import { isIncluded } from './arrays';

describe('isIncluded', () => {
  it('valeur présente dans un array → true', () => {
    expect(isIncluded(2, [1, 2, 3])).toBe(true);
  });

  it('valeur absente d\'un array → false', () => {
    expect(isIncluded(4, [1, 2, 3])).toBe(false);
  });

  it('valeur présente dans un string → true', () => {
    expect(isIncluded('a', 'abc')).toBe(true);
  });

  it('valeur absente d\'un string → false', () => {
    expect(isIncluded('z', 'abc')).toBe(false);
  });

  it('array vide → false', () => {
    expect(isIncluded(1, [])).toBe(false);
  });

  it('string vide → false', () => {
    expect(isIncluded('x', '')).toBe(false);
  });
});
