import { describe, expect, it } from 'vitest';

import {
  coalesce,
  iif,
  iifunc,
  isPrimitive,
  isNumeric,
  isPromiseLike,
  negateProp,
  once,
} from './utils';

describe('utils', () => {
  it('isNumeric accepte les nombres et chaines numeriques', () => {
    expect(isNumeric(42)).toBe(true);
    expect(isNumeric('42.5')).toBe(true);
  });

  it('isNumeric rejette NaN et non-numerique', () => {
    expect(isNumeric(Number.NaN)).toBe(false);
    expect(isNumeric('abc')).toBe(false);
  });

  it('coalesce retourne la premiere valeur non nulle', () => {
    expect(coalesce(null, undefined, 'ok', 'fallback')).toBe('ok');
  });

  it('once execute la fonction une seule fois', () => {
    const fn = once((value: number) => value * 2);
    expect(fn(2)).toBe(4);
    expect(fn(5)).toBe(4);
  });

  it('isPromiseLike detecte un thenable', () => {
    expect(isPromiseLike(Promise.resolve(1))).toBe(true);
    const thenable = Promise.resolve('x');
    expect(isPromiseLike(thenable)).toBe(true);
    expect(isPromiseLike(123)).toBe(false);
  });

  it('negateProp inverse un booleen par cle', () => {
    const state = { enabled: false };
    negateProp(state, 'enabled');
    expect(state.enabled).toBe(true);
  });

  it('iifunc execute la bonne branche', () => {
    expect(iifunc(true, () => 'a', () => 'b')).toBe('a');
    expect(iifunc(false, () => 'a', () => 'b')).toBe('b');
  });

  it('iif retourne la bonne valeur', () => {
    expect(iif(true, 'yes', 'no')).toBe('yes');
    expect(iif(false, 'yes', 'no')).toBe('no');
  });

  it('isPrimitive detecte correctement les primitives', () => {
    expect(isPrimitive(1)).toBe(true);
    expect(isPrimitive('a')).toBe(true);
    expect(isPrimitive({})).toBe(false);
  });
});
