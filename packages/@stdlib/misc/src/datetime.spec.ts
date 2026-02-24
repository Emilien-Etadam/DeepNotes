import {
  addSeconds,
  addMinutes,
  addHours,
  addDays,
  addMonths,
  addYears,
  relativeTimeStr,
} from './datetime';

describe('addSeconds', () => {
  it('valeur positive', () => {
    const d = new Date('2025-01-15T12:00:00.000Z');
    const result = addSeconds(d, 30);
    expect(result.getTime()).toBe(d.getTime() + 30 * 1000);
  });

  it('valeur négative', () => {
    const d = new Date('2025-01-15T12:00:00.000Z');
    const result = addSeconds(d, -10);
    expect(result.getTime()).toBe(d.getTime() - 10 * 1000);
  });
});

describe('addMinutes', () => {
  it('valeur positive', () => {
    const d = new Date('2025-01-15T12:00:00.000Z');
    const result = addMinutes(d, 5);
    expect(result.getTime()).toBe(d.getTime() + 5 * 60 * 1000);
  });

  it('valeur négative', () => {
    const d = new Date('2025-01-15T12:00:00.000Z');
    const result = addMinutes(d, -3);
    expect(result.getTime()).toBe(d.getTime() - 3 * 60 * 1000);
  });
});

describe('addHours', () => {
  it('valeur positive', () => {
    const d = new Date('2025-01-15T12:00:00.000Z');
    const result = addHours(d, 2);
    expect(result.getTime()).toBe(d.getTime() + 2 * 60 * 60 * 1000);
  });

  it('valeur négative', () => {
    const d = new Date('2025-01-15T12:00:00.000Z');
    const result = addHours(d, -1);
    expect(result.getTime()).toBe(d.getTime() - 1 * 60 * 60 * 1000);
  });
});

describe('addDays', () => {
  it('valeur positive', () => {
    const d = new Date('2025-01-15T12:00:00.000Z');
    const result = addDays(d, 7);
    expect(result.getUTCDate()).toBe(22);
  });

  it('valeur négative', () => {
    const d = new Date('2025-01-15T12:00:00.000Z');
    const result = addDays(d, -5);
    expect(result.getUTCDate()).toBe(10);
  });
});

describe('addMonths', () => {
  it('valeur positive', () => {
    const d = new Date('2025-01-15T12:00:00.000Z');
    const result = addMonths(d, 2);
    expect(result.getUTCMonth()).toBe(2);
  });

  it('valeur négative', () => {
    const d = new Date('2025-03-15T12:00:00.000Z');
    const result = addMonths(d, -1);
    expect(result.getUTCMonth()).toBe(1);
  });
});

describe('addYears', () => {
  it('valeur positive', () => {
    const d = new Date('2025-01-15T12:00:00.000Z');
    const result = addYears(d, 3);
    expect(result.getUTCFullYear()).toBe(2028);
  });

  it('valeur négative', () => {
    const d = new Date('2025-01-15T12:00:00.000Z');
    const result = addYears(d, -2);
    expect(result.getUTCFullYear()).toBe(2023);
  });
});

describe('relativeTimeStr', () => {
  it('date il y a 30 secondes → contient "second" ou "just now"', () => {
    const str = relativeTimeStr(-30 * 1000);
    expect(str.includes('second') || str === 'now').toBe(true);
  });

  it('date il y a 2 heures → contient "hour"', () => {
    const str = relativeTimeStr(-2 * 60 * 60 * 1000);
    expect(str.toLowerCase().includes('hour')).toBe(true);
  });

  it('date il y a 3 jours → contient "day"', () => {
    const str = relativeTimeStr(-3 * 24 * 60 * 60 * 1000);
    expect(str.toLowerCase().includes('day')).toBe(true);
  });
});
