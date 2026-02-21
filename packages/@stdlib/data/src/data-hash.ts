import type { Kysely } from 'kysely';

import type { DataField } from './data-field';

export interface DataHash<T = any, DB = any> {
  table: string;

  /** Primary key column(s) for patch/delete (e.g. ['id'] or ['group_id', 'user_id']) */
  idColumns: string[];

  get: (params: {
    suffix: string;
    columns?: string[];
    executor: Kysely<DB>;
  }) => Promise<T | undefined>;
  set?: (params: {
    suffix: string;
    model: T;
    executor: Kysely<DB>;
  }) => Promise<any>;

  fields: Record<string, DataField<T>>;
}

export type DataHashes = Record<string, DataHash>;

export function validateDataHashes<T extends Record<string, DataHash>>(
  dataHashes: T,
) {
  return dataHashes;
}

export function validateDataHash<T extends DataHash>(dataHash: T) {
  return dataHash;
}
