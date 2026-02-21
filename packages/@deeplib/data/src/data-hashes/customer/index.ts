import type { DataHash } from '@stdlib/data';
import { validateDataHash } from '@stdlib/data/src/universal';
import type { UserRow } from '@deeplib/db';

import { userId } from './user-id';

export const customer = validateDataHash({
  table: 'users',
  idColumns: ['customer_id'],

  get: async ({ suffix: customerId, columns, executor }) => {
    const q = (executor as any)
      .selectFrom('users')
      .where('customer_id', '=', customerId);
    return (columns?.length
      ? q.select(columns as any)
      : q.selectAll()
    ).executeTakeFirst();
  },

  fields: {
    'user-id': userId,
  },
}) as DataHash<UserRow, any>;
