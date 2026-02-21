import type { DataHash } from '@stdlib/data';
import { validateDataHash } from '@stdlib/data/src/universal';
import { splitStr } from '@stdlib/misc';
import type { GroupJoinInvitationRow } from '@deeplib/db';

import { encryptedName } from './encrypted-name';
import { encryptedNameForUser } from './encrypted-name-for-user';
import { exists } from './exists';
import { role } from './role';

export const groupJoinInvitation = validateDataHash({
  table: 'group_join_invitations',
  idColumns: ['group_id', 'user_id'],

  get: async ({ suffix, columns, executor }) => {
    const [group_id, user_id] = splitStr(suffix, ':', 2);
    const q = (executor as any)
      .selectFrom('group_join_invitations')
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
      .updateTable('group_join_invitations')
      .set(model)
      .where('group_id', '=', group_id)
      .where('user_id', '=', user_id)
      .executeTakeFirst();
  },

  fields: {
    'encrypted-name-for-user': encryptedNameForUser,
    'encrypted-name': encryptedName,
    exists: exists,
    role: role,
  },
}) as DataHash<GroupJoinInvitationRow, any>;
