import type { DataHash } from '@stdlib/data';
import { validateDataHash } from '@stdlib/data/src/universal';
import type { UserRow } from '@deeplib/db';

import { customerId } from './customer-id';
import { demo } from './demo';
import { email } from './email';
import { encryptedDefaultArrow } from './encrypted-default-arrow';
import { encryptedDefaultNote } from './encrypted-default-note';
import { encryptedName } from './encrypted-name';
import { favoritePageIds } from './favorite-page-ids';
import { lastNotificationRead } from './last-notification-read';
import { newUser } from './new';
import { numFreePages } from './num-free-pages';
import { personalGroupId } from './personal-group-id';
import { plan } from './plan';
import { publicKeyring } from './public-keyring';
import { recentGroupIds } from './recent-group-ids';
import { recentPageIds } from './recent-page-ids';
import { startingPageId } from './starting-page-id';
import { subscriptionId } from './subscription-id';
import { twoFactorAuthEnabled } from './two-factor-auth-enabled';

export const user = validateDataHash({
  table: 'users',
  idColumns: ['id'],

  get: async ({ suffix: userId, columns, executor }) => {
    const q = (executor as any).selectFrom('users').where('id', '=', userId);
    return (columns?.length
      ? q.select(columns as any)
      : q.selectAll()
    ).executeTakeFirst();
  },
  set: async ({ suffix: userId, model, executor }) =>
    (executor as any)
      .updateTable('users')
      .set(model)
      .where('id', '=', userId)
      .executeTakeFirst(),

  fields: {
    'customer-id': customerId,
    demo: demo,
    email: email,
    'encrypted-default-arrow': encryptedDefaultArrow,
    'encrypted-default-note': encryptedDefaultNote,
    'encrypted-name': encryptedName,
    'favorite-page-ids': favoritePageIds,
    'last-notification-read': lastNotificationRead,
    'personal-group-id': personalGroupId,
    new: newUser,
    'num-free-pages': numFreePages,
    plan: plan,
    'public-keyring': publicKeyring,
    'recent-group-ids': recentGroupIds,
    'recent-page-ids': recentPageIds,
    'starting-page-id': startingPageId,
    'subscription-id': subscriptionId,
    'two-factor-auth-enabled': twoFactorAuthEnabled,
  },
}) as DataHash<UserRow, any>;
