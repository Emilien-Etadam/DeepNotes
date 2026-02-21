import type { DataHash } from '@stdlib/data';
import { validateDataHash } from '@stdlib/data/src/universal';
import type { UserRow } from '@deeplib/db';

import { hashUserEmail } from '../../emails';
import { userId } from './user-id';

export const email = validateDataHash({
  table: 'users',
  idColumns: ['id'],

  get: async ({ suffix: emailStr, columns, executor }) => {
    const q = (executor as any)
      .selectFrom('users')
      .where('email_hash', '=', Buffer.from(hashUserEmail(emailStr)));
    return (columns?.length
      ? q.select(columns as any)
      : q.selectAll()
    ).executeTakeFirst();
  },

  fields: {
    'user-id': userId,
  },
}) as DataHash<UserRow, any>;
