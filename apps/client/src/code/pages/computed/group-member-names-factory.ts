import { bytesToText, splitStr } from '@stdlib/misc';
import { createSmartComputedDict } from '@stdlib/vue';
import { once } from 'lodash';

import { groupPrivateKeyrings } from './group-private-keyrings';

type GroupMemberNameStatus = 'unknown' | 'encrypted' | 'success';

type GroupMemberNameValue = {
  text: string;
  status: GroupMemberNameStatus;
};

type GroupMemberEntityType = 'invitation' | 'request';

type GroupMemberNamesFactoryConfig = {
  dataKey: 'group-join-invitation' | 'group-join-request';
  entityType: GroupMemberEntityType;
};

const _getLogger = mainLogger.sub('groupMemberNames.get');
const _setLogger = mainLogger.sub('groupMemberNames.set');

function decryptSelfName(
  entityType: GroupMemberEntityType,
  encryptedName: Uint8Array,
  groupId: string,
  userId: string,
) {
  if (entityType === 'invitation') {
    return bytesToText(
      internals.keyPair.decrypt(encryptedName, { padding: true }),
    );
  }

  return bytesToText(
    internals.symmetricKeyring.decrypt(encryptedName, {
      padding: true,
      associatedData: {
        context: 'GroupJoinRequestUserNameForUser',
        groupId,
        userId,
      },
    }),
  );
}

export function createGroupMemberNames(config: GroupMemberNamesFactoryConfig) {
  return once(() =>
    createSmartComputedDict<string, GroupMemberNameValue>({
      get: async (key) => {
        if (key == null) {
          _getLogger.info('No valid key');

          return { text: '[Unknown user]', status: 'unknown' };
        }

        const [groupId, userId] = splitStr(key, ':', 2);

        const isSelf = userId === authStore().userId;

        const [groupPrivateKeyring, encryptedName] = await Promise.all([
          groupPrivateKeyrings()(groupId).getAsync(),

          internals.realtime.globalCtx.hgetAsync(
            config.dataKey,
            key,
            isSelf ? 'encrypted-name-for-user' : 'encrypted-name',
          ),
        ]);

        if (encryptedName == null) {
          _getLogger.info(`${key}: No encrypted display name`);

          return { text: '[Unknown user]', status: 'unknown' };
        }

        if (groupId == null) {
          mainLogger.info(`${key}: No group ID found`);

          return { text: '[Encrypted name]', status: 'encrypted' };
        }

        try {
          let result;

          if (isSelf) {
            result = decryptSelfName(
              config.entityType,
              encryptedName,
              groupId,
              userId,
            );
          } else {
            if (groupPrivateKeyring == null) {
              _getLogger.info(`${key}: No group private key found`);

              return { text: '[Encrypted name]', status: 'encrypted' };
            }

            result = bytesToText(
              groupPrivateKeyring.decrypt(encryptedName, { padding: true }),
            );
          }

          _getLogger.info(`${key}: ${result}`);

          return { text: result, status: 'success' };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown decryption error';
          _getLogger.info(
            `${key}: Failed to decrypt page title (${errorMessage})`,
          );

          return { text: '[Encrypted name]', status: 'success' };
        }
      },

      initialValue: { text: '[Unknown user]', status: 'unknown' },
    }),
  );
}
