import _ from 'lodash';

import type {
  AllAwaited,
  SettledAwaited,
  TupleToIntersection,
} from './typescript';
import { objFromEntries, objKeys, objValues } from './utils';

export async function allResultsMerged<T extends any[]>(
  imports: [...T],
): Promise<TupleToIntersection<AllAwaited<[...T]>>> {
  const results = await Promise.all(imports);

  return Object.assign({}, ...results);
}

export async function namedPromises<
  K extends string[],
  P extends PromiseLike<any>[],
>(
  keys: K,
  promises: P,
): Promise<{
  [key in K[number]]: P[number] extends PromiseLike<infer T> ? T : never;
}> {
  const results = await Promise.all(promises);

  return objFromEntries(keys.map((key, index) => [key, results[index]])) as any;
}

export async function promiseProp<
  P extends PromiseLike<any>,
  K extends keyof Awaited<P>,
>(promise: P, key: K) {
  return (await promise)[key];
}

export async function promiseProps<
  P extends PromiseLike<any>,
  K extends keyof Awaited<P>,
>(promise: P, keys: K[]) {
  return _.pick(await promise, keys);
}

export async function allAsyncProps<T extends object>(promises: {
  [K in keyof T]: PromiseLike<T[K]>;
}): Promise<{ [K in keyof T]: T[K] }> {
  return (await namedPromises(objKeys(promises), objValues(promises))) as any;
}

export function objectifyPromises<
  K extends string[],
  P extends PromiseLike<any>[],
>(keys: K, promises: P): { [key in K[number]]: P[number] } {
  return objFromEntries(
    keys.map((key, index) => [key, promises[index]]),
  ) as any;
}

export async function objectifyPromiseResults<
  K extends string[],
  P extends PromiseLike<any[]>,
>(
  keys: K,
  promise: P,
): Promise<{
  [key in K[number]]: P extends PromiseLike<infer T extends any[]>
    ? T[number]
    : never;
}> {
  const results = await promise;

  return objFromEntries(keys.map((key, index) => [key, results[index]])) as any;
}

export async function allSettledResults<T extends readonly [...any]>(
  promises: [...T],
): Promise<SettledAwaited<T>> {
  return (await Promise.allSettled(promises)).map((result) =>
    result.status === 'fulfilled' ? result.value : undefined,
  ) as any;
}

/** Intentional thenable — lazy PromiseLike, defers execution until .then() is called. */
class LazyPromiseLike implements PromiseLike<any> {
  private _promise: PromiseLike<any> | undefined;

  constructor(private readonly _asyncFunc: () => PromiseLike<any>) {}

  then<TResult1 = any, TResult2 = never>(
    onFulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onRejected?: ((reason?: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    this._promise ??= this._asyncFunc();
    return this._promise.then(onFulfilled, onRejected);
  }
}

export function makeLazyPromise(
  asyncFunc: () => PromiseLike<any>,
): PromiseLike<any> {
  return new LazyPromiseLike(asyncFunc);
}
