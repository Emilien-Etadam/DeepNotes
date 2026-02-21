import type { DataHash } from '@stdlib/data';
import { validateDataHash } from '@stdlib/data/src/universal';
import type { GroupRow } from '@deeplib/db';

import { accessKeyring } from './access-keyring';
import { areJoinRequestsAllowed } from './are-join-requests-allowed';
import { encryptedContentKeyring } from './encrypted-content-keyring';
import { encryptedName } from './encrypted-name';
import { encryptedPrivateKeyring } from './encrypted-private-keyring';
import { exists } from './exists';
import { isPasswordProtected } from './is-password-protected';
import { isPersonal } from './is-personal';
import { isPublic } from './is-public';
import { mainPageId } from './main-page-id';
import { permanentDeletionDate } from './permanent-deletion-date';
import { publicKeyring } from './public-keyring';
import { userId } from './user-id';

export const group = validateDataHash({
  table: 'groups',
  idColumns: ['id'],

  get: async ({ suffix: groupId, columns, executor }) => {
    const q = (executor as any).selectFrom('groups').where('id', '=', groupId);
    return (columns?.length
      ? q.select(columns as any)
      : q.selectAll()
    ).executeTakeFirst();
  },
  set: async ({ suffix: groupId, model, executor }) =>
    (executor as any)
      .updateTable('groups')
      .set(model)
      .where('id', '=', groupId)
      .executeTakeFirst(),

  fields: {
    'access-keyring': accessKeyring,
    'encrypted-content-keyring': encryptedContentKeyring,
    'encrypted-name': encryptedName,
    'encrypted-private-keyring': encryptedPrivateKeyring,
    exists: exists,
    'is-password-protected': isPasswordProtected,
    'is-personal': isPersonal,
    'is-public': isPublic,
    'main-page-id': mainPageId,
    'permanent-deletion-date': permanentDeletionDate,
    'public-keyring': publicKeyring,
    'user-id': userId,
    'are-join-requests-allowed': areJoinRequestsAllowed,
  },
}) as DataHash<GroupRow, any>;
