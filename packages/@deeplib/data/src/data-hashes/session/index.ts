import type { DataHash } from '@stdlib/data';
import { validateDataHash } from '@stdlib/data/src/universal';
import type { SessionRow } from '@deeplib/db';

import { invalidated } from './invalidated';
import { userId } from './user-id';

export const session = validateDataHash({
  table: 'sessions',
  idColumns: ['id'],

  get: async ({ suffix: sessionId, columns, executor }) => {
    const q = (executor as any)
      .selectFrom('sessions')
      .where('id', '=', sessionId);
    return (columns?.length
      ? q.select(columns as any)
      : q.selectAll()
    ).executeTakeFirst();
  },
  set: async ({ suffix: sessionId, model, executor }) =>
    (executor as any)
      .updateTable('sessions')
      .set(model)
      .where('id', '=', sessionId)
      .executeTakeFirst(),

  fields: {
    invalidated: invalidated,
    'user-id': userId,
  },
}) as DataHash<SessionRow, any>;
