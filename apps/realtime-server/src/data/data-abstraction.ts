import { dataHashes } from '@deeplib/data';
import { DataAbstraction } from '@stdlib/data';
import { once } from 'lodash';

import { db } from './knex';
import { getRedis, getSub } from './redis';

export const dataAbstraction = once(async () => {
  const da = new DataAbstraction(db, dataHashes, getRedis(), getSub());
  await da.init();
  return da;
});
