import type { PageModel } from '@deeplib/db';
import type { DataField } from '@stdlib/data';

import { userHasPermission } from '../../roles';
import type { DataPrefix } from '..';

type EncryptedTitleType = 'absolute' | 'relative';

const encryptedTitleColumnByType: Record<EncryptedTitleType, keyof PageModel> = {
  absolute: 'encrypted_absolute_title',
  relative: 'encrypted_relative_title',
};

export const createEncryptedTitleField = (
  type: EncryptedTitleType,
): DataField<PageModel> => ({
  notifyUpdates: true,

  userGettable: async ({ userId, suffix: pageId, dataAbstraction }) =>
    await userHasPermission(
      dataAbstraction,
      userId,
      await dataAbstraction.hget('page', pageId, 'group-id'),
      'viewGroupPages',
    ),
  userSettable: async ({ userId, suffix: pageId, dataAbstraction }) => {
    const groupId = await dataAbstraction.hget<DataPrefix>(
      'page',
      pageId,
      'group-id',
    );

    return await userHasPermission(
      dataAbstraction,
      userId,
      groupId,
      'editGroupPages',
    );
  },

  columns: [encryptedTitleColumnByType[type]],
});
