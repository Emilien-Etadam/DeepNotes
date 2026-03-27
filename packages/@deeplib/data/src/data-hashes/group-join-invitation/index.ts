import type { DataHash } from '@stdlib/data';
import { validateDataHash } from '@stdlib/data/src/universal';
import { splitStr } from '@stdlib/misc';
import type { GroupJoinInvitationRow } from '@deeplib/db';

import { encryptedName } from './encrypted-name';
import { encryptedNameForUser } from './encrypted-name-for-user';
import { exists } from './exists';
import { role } from './role';
import { createGroupJoinDataHash } from '../group-join-common';

export const groupJoinInvitation: DataHash<GroupJoinInvitationRow, any> = createGroupJoinDataHash<GroupJoinInvitationRow>({
  entityType: 'invitation',
  validateDataHash,
  splitStr,
  fields: {
    'encrypted-name-for-user': encryptedNameForUser,
    'encrypted-name': encryptedName,
    exists: exists,
    role: role,
  },
});
