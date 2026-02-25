import {
  allResultsMerged,
  namedPromises,
  promiseProps,
  allAsyncProps,
  allSettledResults,
  makeLazyPromise,
} from './promises';

describe('allResultsMerged', () => {
  it('toutes les promesses résolues → résultats fusionnés', async () => {
    const result = await allResultsMerged([
      Promise.resolve({ a: 1 }),
      Promise.resolve({ b: 2 }),
      Promise.resolve({ c: 3 }),
    ]);
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('une promesse rejetée → erreur', async () => {
    await expect(
      allResultsMerged([
        Promise.resolve({ a: 1 }),
        Promise.reject(new Error('fail')),
      ]),
    ).rejects.toThrow('fail');
  });
});

describe('namedPromises', () => {
  it('objet de promesses nommées → objet de résultats nommés', async () => {
    const result = await namedPromises(
      ['x', 'y', 'z'],
      [
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.resolve(3),
      ],
    );
    expect(result).toEqual({ x: 1, y: 2, z: 3 });
  });
});

describe('promiseProps', () => {
  it('objet avec des propriétés promesses → pick des clés sur la promesse résolue', async () => {
    const promise = Promise.resolve({ a: 1, b: 2, c: 3 });
    const result = await promiseProps(promise, ['a', 'c']);
    expect(result).toEqual({ a: 1, c: 3 });
  });
});

describe('allAsyncProps', () => {
  it('objet avec des propriétés promesses → objet résolu', async () => {
    const result = await allAsyncProps({
      foo: Promise.resolve(10),
      bar: Promise.resolve('hello'),
    });
    expect(result).toEqual({ foo: 10, bar: 'hello' });
  });
});

describe('allSettledResults', () => {
  it('mix de promesses résolues et rejetées → résultats avec value ou undefined', async () => {
    const result = await allSettledResults([
      Promise.resolve(1),
      Promise.reject(new Error('e')),
      Promise.resolve(3),
    ]);
    expect(result).toEqual([1, undefined, 3]);
  });
});

describe('makeLazyPromise', () => {
  it('la promesse ne s\'exécute pas tant qu\'elle n\'est pas awaited', async () => {
    let callCount = 0;
    const lazy = makeLazyPromise(() => {
      callCount++;
      return Promise.resolve(42);
    });
    expect(callCount).toBe(0);
    const value = await lazy;
    expect(callCount).toBe(1);
    expect(value).toBe(42);
  });

  it('une fois awaited, retourne le bon résultat', async () => {
    const lazy = makeLazyPromise(() => Promise.resolve('ok'));
    expect(await lazy).toBe('ok');
  });
});
