import type { DataHash } from '@stdlib/data';
import { validateDataHash } from '@stdlib/data/src/universal';
import type { PageSnapshotRow } from '@deeplib/db';

import { infos } from './infos';

export const pageSnapshots = validateDataHash({
  table: 'page_snapshots',
  idColumns: ['id'],

  get: async ({ suffix: pageId, executor }) =>
    (executor as any)
      .selectFrom('page_snapshots')
      .where('page_id', '=', pageId)
      .select(['id', 'creation_date', 'author_id', 'type'])
      .orderBy('creation_date', 'desc')
      .execute(),

  fields: {
    infos: infos,
  },
}) as DataHash<PageSnapshotRow[], any>;
