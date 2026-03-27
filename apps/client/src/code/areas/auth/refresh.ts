import {
  base64ToBytes,
  base64ToBytesSafe,
  bytesToBase64,
} from '@stdlib/base64';
import {
  createKeyring,
  createPrivateKeyring,
  createSymmetricKeyring,
  type SymmetricKey,
  wrapKeyPair,
  wrapSymmetricKey,
} from '@stdlib/crypto';

import { redirectIfNecessary } from '../../routing';
import { trpcClient } from '../../trpc';
import { logout } from './logout';
import {
  areClientTokensExpiring,
  isClientTokenValid,
  storeClientTokenExpirations,
} from './tokens';

const moduleLogger = mainLogger.sub('auth/refresh.client.ts');

export async function tryRefreshTokens(): Promise<void> {
  moduleLogger.info('Trying to refresh tokens');

  if (!authStore().loggedIn) {
    moduleLogger.info(
      'authStore().loggedIn is false, skipping refresh request',
    );
    return;
  }

  // Logout if a requirement is not met

  if (
    !isClientTokenValid('refresh') ||
    internals.storage.getItem('encryptedPrivateKeyring') == null ||
    internals.storage.getItem('encryptedSymmetricKeyring') == null
  ) {
    moduleLogger.info('Requirements not met, logging out');
    await logout();
    return;
  }

  // Skip refresh if unnecessary

  if (
    internals.keyPair != null &&
    internals.symmetricKeyring != null &&
    !areClientTokensExpiring()
  ) {
    moduleLogger.info('Tokens are not expiring, skipping refresh request');
    return;
  }

  // Try to refresh tokens

  try {
    let oldSessionKey: SymmetricKey;
    let newSessionKey: SymmetricKey;

    if (authStore().oldSessionKey && authStore().newSessionKey) {
      moduleLogger.info(
        'Tokens already refreshed on server, skipping refresh request',
      );

      oldSessionKey = wrapSymmetricKey(
        base64ToBytes(authStore().oldSessionKey),
      );
      newSessionKey = wrapSymmetricKey(
        base64ToBytes(authStore().newSessionKey),
      );
    } else {
      moduleLogger.info('Sending refresh request');

      const response = await trpcClient.sessions.refresh.mutate(undefined);

      oldSessionKey = wrapSymmetricKey(response.oldSessionKey);
      newSessionKey = wrapSymmetricKey(response.newSessionKey);
    }

    // Reencrypt keys

    moduleLogger.info('Reencrypting keys');

    const personalGroupId = internals.storage.getItem('personalGroupId');
    const publicKeyringBase64 = internals.storage.getItem('publicKeyring');
    const encryptedPrivateKeyringBase64 = internals.storage.getItem(
      'encryptedPrivateKeyring',
    );
    const encryptedSymmetricKeyringBase64 = internals.storage.getItem(
      'encryptedSymmetricKeyring',
    );

    if (
      personalGroupId == null ||
      publicKeyringBase64 == null ||
      encryptedPrivateKeyringBase64 == null ||
      encryptedSymmetricKeyringBase64 == null
    ) {
      throw new Error('Missing required local keyring values.');
    }

    internals.personalGroupId = personalGroupId;

    const publicKeyring = createKeyring(base64ToBytesSafe(publicKeyringBase64));

    const privateKeyring = createPrivateKeyring(
      base64ToBytes(encryptedPrivateKeyringBase64),
    ).unwrapSymmetric(oldSessionKey, {
      associatedData: {
        context: 'SessionUserPrivateKeyring',
        userId: authStore().userId,
      },
    });

    internals.keyPair = wrapKeyPair(publicKeyring, privateKeyring);

    internals.symmetricKeyring = createSymmetricKeyring(
      base64ToBytes(encryptedSymmetricKeyringBase64),
    ).unwrapSymmetric(oldSessionKey, {
      associatedData: {
        context: 'SessionUserSymmetricKeyring',
        userId: authStore().userId,
      },
    });

    // Update storage

    internals.storage.setItem(
      'encryptedPrivateKeyring',
      bytesToBase64(
        privateKeyring.wrapSymmetric(newSessionKey, {
          associatedData: {
            context: 'SessionUserPrivateKeyring',
            userId: authStore().userId,
          },
        }).wrappedValue,
      ),
    );

    internals.storage.setItem(
      'encryptedSymmetricKeyring',
      bytesToBase64(
        internals.symmetricKeyring.wrapSymmetric(newSessionKey, {
          associatedData: {
            context: 'SessionUserSymmetricKeyring',
            userId: authStore().userId,
          },
        }).wrappedValue,
      ),
    );

    // Finish refreshing tokens

    authStore().loggedIn = true;

    authStore().oldSessionKey = '';
    authStore().newSessionKey = '';

    storeClientTokenExpirations();

    moduleLogger.info('Tokens refreshed successfully');

    await redirectIfNecessary({
      router: router(),
      route: route().value,
      auth: authStore(),
    });
  } catch (error) {
    if (authStore().oldSessionKey && authStore().newSessionKey) {
      moduleLogger.info('Failed refreshing tokens server session keys.');
      moduleLogger.info('Retrying without server session keys.');

      authStore().oldSessionKey = '';
      authStore().newSessionKey = '';

      await tryRefreshTokens();

      return;
    }

    moduleLogger.error('Failed to refresh tokens');
    moduleLogger.error(error);

    await logout();
  }
}
