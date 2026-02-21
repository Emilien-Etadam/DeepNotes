import type { DataHash } from '@stdlib/data';
import { validateDataHash } from '@stdlib/data/src/universal';
import type { PageRow } from '@deeplib/db';

import { encryptedAbsoluteTitle } from './encrypted-absolute-title';
import { encryptedRelativeTitle } from './encrypted-relative-title';
import { encryptedSymmetricKeyring } from './encrypted-symmetric-keyring';
import { exists } from './exists';
import { free } from './free';
import { groupId } from './group-id';
import { nextKeyRotationDate } from './next-key-rotation-date';
import { nextSnapshotDate } from './next-snapshot-date';
import { nextSnapshotUpdateIndex } from './next-snapshot-update-index';
import { permanentDeletionDate } from './permanent-deletion-date';

export const page = validateDataHash({
  table: 'pages',
  idColumns: ['id'],

  get: async ({ suffix: pageId, columns, executor }) => {
    const q = (executor as any).selectFrom('pages').where('id', '=', pageId);
    return (columns?.length
      ? q.select(columns as any)
      : q.selectAll()
    ).executeTakeFirst();
  },
  set: async ({ suffix: pageId, model, executor }) =>
    (executor as any)
      .updateTable('pages')
      .set(model)
      .where('id', '=', pageId)
      .executeTakeFirst(),

  fields: {
    'encrypted-absolute-title': encryptedAbsoluteTitle,
    'encrypted-symmetric-keyring': encryptedSymmetricKeyring,
    'encrypted-relative-title': encryptedRelativeTitle,
    exists: exists,
    'group-id': groupId,
    free: free,
    'next-key-rotation-date': nextKeyRotationDate,
    'next-snapshot-date': nextSnapshotDate,
    'next-snapshot-update-index': nextSnapshotUpdateIndex,
    'permanent-deletion-date': permanentDeletionDate,
  },
}) as DataHash<PageRow, any>;
