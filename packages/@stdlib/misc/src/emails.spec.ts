import { w3cEmailRegex, maxEmailLength } from './emails';

describe('w3cEmailRegex', () => {
  it('"user@example.com" → match', () => {
    expect(w3cEmailRegex.test('user@example.com')).toBe(true);
  });

  it('"user@sub.domain.com" → match', () => {
    expect(w3cEmailRegex.test('user@sub.domain.com')).toBe(true);
  });

  it('"invalid" → pas de match', () => {
    expect(w3cEmailRegex.test('invalid')).toBe(false);
  });

  it('"@domain.com" → pas de match', () => {
    expect(w3cEmailRegex.test('@domain.com')).toBe(false);
  });

  it('"user@" → pas de match', () => {
    expect(w3cEmailRegex.test('user@')).toBe(false);
  });
});

describe('maxEmailLength', () => {
  it('est 254', () => {
    expect(maxEmailLength).toBe(254);
  });
});
