import { dataHashes } from '@deeplib/data';
import { DataAbstraction } from '@stdlib/data';
import { once } from 'lodash';

import { db } from './knex';
import { getRedis, getSub } from './redis';

export const dataAbstraction = once(
  () => new DataAbstraction(db, dataHashes, getRedis(), getSub()),
);
