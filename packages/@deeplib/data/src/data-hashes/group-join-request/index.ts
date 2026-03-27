import type { DataHash } from '@stdlib/data';
import { validateDataHash } from '@stdlib/data/src/universal';
import { splitStr } from '@stdlib/misc';
import type { GroupJoinRequestRow } from '@deeplib/db';

import { encryptedName } from './encrypted-name';
import { encryptedNameForUser } from './encrypted-name-for-user';
import { exists } from './exists';
import { rejected } from './rejected';
import { createGroupJoinDataHash } from '../group-join-common';

export const groupJoinRequest: DataHash<GroupJoinRequestRow, any> = createGroupJoinDataHash<GroupJoinRequestRow>({
  entityType: 'request',
  validateDataHash,
  splitStr,
  fields: {
    'encrypted-name-for-user': encryptedNameForUser,
    'encrypted-name': encryptedName,
    exists: exists,
    rejected: rejected,
  },
});
