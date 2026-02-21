import type { DataHash } from '@stdlib/data';
import { validateDataHash } from '@stdlib/data/src/universal';
import { splitStr } from '@stdlib/misc';
import type { UserPageRow } from '@deeplib/db';

import { lastParentId } from './last-parent-id';

export const userPage = validateDataHash({
  table: 'users_pages',
  idColumns: ['user_id', 'page_id'],

  get: async ({ suffix, columns, executor }) => {
    const [user_id, page_id] = splitStr(suffix, ':', 2);
    const q = (executor as any)
      .selectFrom('users_pages')
      .where('user_id', '=', user_id)
      .where('page_id', '=', page_id);
    return (columns?.length
      ? q.select(columns as any)
      : q.selectAll()
    ).executeTakeFirst();
  },
  set: async ({ suffix, model, executor }) => {
    const [user_id, page_id] = splitStr(suffix, ':', 2);
    const ex = executor as any;
    return ex
      .insertInto('users_pages')
      .values({ ...model, user_id, page_id })
      .onConflict((oc) =>
        oc.columns(['user_id', 'page_id']).doUpdateSet((eb) => {
          const set: Record<string, any> = {};
          for (const key of Object.keys(model)) {
            set[key] = eb.ref('excluded.' + key);
          }
          return set;
        }),
      )
      .executeTakeFirst();
  },

  fields: {
    'last-parent-id': lastParentId,
  },
}) as DataHash<UserPageRow, any>;
