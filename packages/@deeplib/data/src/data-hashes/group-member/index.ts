import type { DataHash } from '@stdlib/data';
import { validateDataHash } from '@stdlib/data/src/universal';
import { splitStr } from '@stdlib/misc';
import type { GroupMemberRow } from '@deeplib/db';

import { encryptedAccessKeyring } from './encrypted-access-keyring';
import { encryptedInternalKeyring } from './encrypted-internal-keyring';
import { encryptedName } from './encrypted-name';
import { exists } from './exists';
import { role } from './role';

export const groupMember = validateDataHash({
  table: 'group_members',
  idColumns: ['group_id', 'user_id'],

  get: async ({ suffix, columns, executor }) => {
    const [group_id, user_id] = splitStr(suffix, ':', 2);
    const q = (executor as any)
      .selectFrom('group_members')
      .where('group_id', '=', group_id)
      .where('user_id', '=', user_id);
    return (columns?.length
      ? q.select(columns as any)
      : q.selectAll()
    ).executeTakeFirst();
  },
  set: async ({ suffix, model, executor }) => {
    const [group_id, user_id] = splitStr(suffix, ':', 2);
    return (executor as any)
      .updateTable('group_members')
      .set(model)
      .where('group_id', '=', group_id)
      .where('user_id', '=', user_id)
      .executeTakeFirst();
  },

  fields: {
    'encrypted-name': encryptedName,
    'encrypted-access-keyring': encryptedAccessKeyring,
    'encrypted-internal-keyring': encryptedInternalKeyring,
    exists: exists,
    role: role,
  },
}) as DataHash<GroupMemberRow, any>;
