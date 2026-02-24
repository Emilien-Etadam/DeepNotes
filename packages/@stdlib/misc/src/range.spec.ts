import { rangeStop, rangeCount } from './range';

describe('rangeStop', () => {
  it('rangeStop(0, 5) → [0, 1, 2, 3, 4]', () => {
    expect(rangeStop(0, 5)).toEqual([0, 1, 2, 3, 4]);
  });

  it('rangeStop(2, 5) → [2, 3, 4]', () => {
    expect(rangeStop(2, 5)).toEqual([2, 3, 4]);
  });

  it('rangeStop(0, 6, 2) → [0, 2, 4]', () => {
    expect(rangeStop(0, 6, 2)).toEqual([0, 2, 4]);
  });
});

describe('rangeCount', () => {
  it('rangeCount(0, 3) → [0, 1, 2]', () => {
    expect(rangeCount(0, 3)).toEqual([0, 1, 2]);
  });

  it('rangeCount(5, 3) → [5, 6, 7]', () => {
    expect(rangeCount(5, 3)).toEqual([5, 6, 7]);
  });

  it('rangeCount(0, 3, 2) → [0, 2, 4]', () => {
    expect(rangeCount(0, 3, 2)).toEqual([0, 2, 4]);
  });
});
