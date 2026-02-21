import type { DataHash } from '@stdlib/data';
import { validateDataHash } from '@stdlib/data/src/universal';
import type { PageLinkRow } from '@deeplib/db';

import { list } from './list';

export const pageBacklinks = validateDataHash({
  table: 'page_links',
  idColumns: ['target_page_id', 'source_page_id'],

  get: async ({ suffix: pageId, executor }) =>
    (executor as any)
      .selectFrom('page_links')
      .where('target_page_id', '=', pageId)
      .orderBy('last_activity_date', 'desc')
      .select('source_page_id')
      .execute(),

  fields: {
    list,
  },
}) as DataHash<PageLinkRow[], any>;
