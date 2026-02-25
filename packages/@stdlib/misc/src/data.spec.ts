import { getFullKey } from './data';

describe('getFullKey', () => {
  it('retourne prefix:suffix>field', () => {
    expect(getFullKey('a', 'b', 'c')).toBe('a:b>c');
  });

  it('gère des préfixes et suffixes vides', () => {
    expect(getFullKey('', 'suffix', 'field')).toBe(':suffix>field');
    expect(getFullKey('prefix', '', 'field')).toBe('prefix:>field');
  });

  it('gère des champs avec caractères spéciaux', () => {
    expect(getFullKey('p', 's', 'field.with.dots')).toBe('p:s>field.with.dots');
  });

  it('gère plusieurs combinaisons', () => {
    expect(getFullKey('user', '123', 'email')).toBe('user:123>email');
    expect(getFullKey('ns', 'id', 'key')).toBe('ns:id>key');
  });
});
