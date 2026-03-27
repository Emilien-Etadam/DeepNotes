import {
  createPrivateKeyring,
  createSymmetricKeyring,
  encodePasswordHash,
  getPasswordHashValues,
} from '@stdlib/crypto';
import type { UserRow } from '@deeplib/db';
import { TRPCError } from '@trpc/server';
import { db } from 'src/data/knex';
import {
  TARGET_MEM_LIMIT,
  TARGET_OPS_LIMIT,
  decryptUserRehashedLoginHash,
  derivePasswordValues,
  encryptUserRehashedLoginHash,
} from 'src/utils/crypto';

const step1BaseUserColumns = [
  'encrypted_rehashed_login_hash',
  'encrypted_symmetric_keyring',
  'encrypted_private_keyring',
] as const;

type Step1BaseUser = {
  encrypted_rehashed_login_hash: Uint8Array;
  encrypted_symmetric_keyring: Uint8Array;
  encrypted_private_keyring: Uint8Array;
};

type Step1ExtraUserColumns = readonly (keyof UserRow)[];

type Step1Options<TExtra extends Step1ExtraUserColumns> = {
  userId: string;
  oldLoginHash: Uint8Array;
  assertCorrectUserPassword: (args: {
    userId: string;
    loginHash: Uint8Array;
  }) => Promise<void>;
  assertNonDemoAccount: (args: { userId: string }) => Promise<void>;
  extraUserColumns?: TExtra;
  validateUser?: (user: Step1BaseUser & Record<TExtra[number], unknown>) => void;
};

export async function getAccountUpdateStep1Data<TExtra extends Step1ExtraUserColumns>(
  options: Step1Options<TExtra>,
) {
  const {
    userId,
    oldLoginHash,
    assertCorrectUserPassword,
    assertNonDemoAccount,
    extraUserColumns = [] as unknown as TExtra,
    validateUser,
  } = options;

  await assertCorrectUserPassword({
    userId,
    loginHash: oldLoginHash,
  });
  await assertNonDemoAccount({ userId });

  const user = (await db
    .selectFrom('users')
    .where('id', '=', userId)
    .select([...step1BaseUserColumns, ...extraUserColumns])
    .executeTakeFirst()) as (Step1BaseUser & Record<TExtra[number], unknown>) | undefined;

  if (user == null) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'User not found.',
    });
  }

  validateUser?.(user);

  const passwordHashValues = getPasswordHashValues(
    decryptUserRehashedLoginHash(user.encrypted_rehashed_login_hash),
  );
  const passwordValues = derivePasswordValues({
    password: oldLoginHash,
    salt: passwordHashValues.saltBytes,
  });

  return {
    encryptedPrivateKeyring: createPrivateKeyring(
      user.encrypted_private_keyring,
    ).unwrapSymmetric(passwordValues.key, {
      associatedData: {
        context: 'UserEncryptedPrivateKeyring',
        userId,
      },
    }).wrappedValue,
    encryptedSymmetricKeyring: createSymmetricKeyring(
      user.encrypted_symmetric_keyring,
    ).unwrapSymmetric(passwordValues.key, {
      associatedData: {
        context: 'UserEncryptedSymmetricKeyring',
        userId,
      },
    }).wrappedValue,
  };
}

type Step2Input = {
  newLoginHash: Uint8Array;
  newEncryptedPrivateKeyring: Uint8Array;
  newEncryptedSymmetricKeyring: Uint8Array;
};

export function buildAccountUpdateStep2Patch({
  userId,
  input,
}: {
  userId: string;
  input: Step2Input;
}) {
  const passwordValues = derivePasswordValues({
    password: input.newLoginHash,
  });

  return {
    encrypted_rehashed_login_hash: encryptUserRehashedLoginHash(
      encodePasswordHash(
        passwordValues.hash,
        passwordValues.salt,
        TARGET_OPS_LIMIT,
        TARGET_MEM_LIMIT / 1048576,
      ),
    ),
    encrypted_private_keyring: createPrivateKeyring(
      input.newEncryptedPrivateKeyring,
    ).wrapSymmetric(passwordValues.key, {
      associatedData: {
        context: 'UserEncryptedPrivateKeyring',
        userId,
      },
    }).wrappedValue,
    encrypted_symmetric_keyring: createSymmetricKeyring(
      input.newEncryptedSymmetricKeyring,
    ).wrapSymmetric(passwordValues.key, {
      associatedData: {
        context: 'UserEncryptedSymmetricKeyring',
        userId,
      },
    }).wrappedValue,
  };
}
