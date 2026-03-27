import type { DataAbstraction } from './data-abstraction';

export interface DataAuthParams {
  dataAbstraction: DataAbstraction;
  userId: string | undefined;
  suffix: string;
}

export interface DataField<T = unknown> {
  dontCache?: boolean;
  cacheLocally?: boolean;
  notifyUpdates?: boolean;

  userGettable?: (params: DataAuthParams) => boolean | Promise<boolean>;
  userSettable?: (params: DataAuthParams) => boolean | Promise<boolean>;

  columns?: Extract<keyof T, string>[];

  get?: (params: {
    model?: T;

    suffix: string;

    dataAbstraction: DataAbstraction;
  }) => unknown;
  set?: (params: {
    model: T;

    suffix: string;
    value: unknown;
  }) => unknown;
}
