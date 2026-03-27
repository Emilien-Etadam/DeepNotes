import { userHasPermission } from '@deeplib/data';
import type { GroupRolePermission } from '@deeplib/misc';
import type { DataTransaction } from '@stdlib/data';
import { TRPCError } from '@trpc/server';
import sodium from 'libsodium-wrappers-sumo';
import { once } from 'lodash';
import { z } from 'zod';

import { dataAbstraction } from '../data/data-abstraction';
import { db } from '../data/knex';
import {
  computePasswordHash,
  decryptGroupRehashedPasswordHash,
  encryptGroupRehashedPasswordHash,
} from '../utils/crypto';

export const GroupRoleEnum = z.enum([
  'owner',
  'admin',
  'moderator',
  'member',
  'viewer',
]);

export const groupCreationSchema = once(() =>
  z.object({
    groupEncryptedName: z.instanceof(Uint8Array),
    groupPasswordHash: z.instanceof(Uint8Array).optional(),
    groupIsPublic: z.boolean(),

    groupAccessKeyring: z.instanceof(Uint8Array),
    groupEncryptedInternalKeyring: z.instanceof(Uint8Array),
    groupEncryptedContentKeyring: z.instanceof(Uint8Array),

    groupPublicKeyring: z.instanceof(Uint8Array),
    groupEncryptedPrivateKeyring: z.instanceof(Uint8Array),

    groupOwnerEncryptedName: z.instanceof(Uint8Array),
  }),
);
export type GroupCreationSchema = z.infer<
  ReturnType<typeof groupCreationSchema>
>;

export async function createGroup(
  input: {
    userId: string;

    groupId: string;
    groupMainPageId: string;
    groupIsPersonal: boolean;

    dtrx?: DataTransaction;
  } & GroupCreationSchema,
) {
  await (await dataAbstraction()).insert(
    'group',
    input.groupId,
    {
      id: input.groupId,

      encrypted_name: input.groupEncryptedName ?? new Uint8Array(),

      main_page_id: input.groupMainPageId,

      encrypted_rehashed_password_hash:
        input.groupPasswordHash == null
          ? undefined
          : encryptGroupRehashedPasswordHash(
              computePasswordHash(input.groupPasswordHash) as unknown as string,
            ),

      access_keyring: input.groupIsPublic
        ? input.groupAccessKeyring
        : undefined,
      encrypted_content_keyring: input.groupEncryptedContentKeyring,

      user_id: input.groupIsPersonal ? input.userId : undefined,

      public_keyring: input.groupPublicKeyring,
      encrypted_private_keyring: input.groupEncryptedPrivateKeyring,
    },
    { dtrx: input.dtrx },
  );

  await (await dataAbstraction()).insert(
    'group-member',
    `${input.groupId}:${input.userId}`,
    {
      group_id: input.groupId,
      user_id: input.userId,

      role: 'owner',

      encrypted_access_keyring: input.groupIsPublic
        ? undefined
        : input.groupAccessKeyring,
      encrypted_internal_keyring: input.groupEncryptedInternalKeyring,

      encrypted_name: input.groupOwnerEncryptedName ?? new Uint8Array(),
    },
    { dtrx: input.dtrx },
  );
}

export async function assertCorrectGroupPassword(input: {
  groupId: string;
  groupPasswordHash: Uint8Array;
}) {
  const group = await db
    .selectFrom('groups')
    .where('id', '=', input.groupId)
    .select('encrypted_rehashed_password_hash')
    .executeTakeFirst();

  if (group == null) {
    throw new TRPCError({
      message: 'Group not found.',
      code: 'NOT_FOUND',
    });
  }

  if (group.encrypted_rehashed_password_hash == null) {
    throw new TRPCError({
      message: 'This group is not password protected.',
      code: 'BAD_REQUEST',
    });
  }

  if (
    !sodium.crypto_pwhash_str_verify(
      decryptGroupRehashedPasswordHash(group.encrypted_rehashed_password_hash),
      input.groupPasswordHash,
    )
  ) {
    throw new TRPCError({
      message: 'Group password is incorrect.',
      code: 'BAD_REQUEST',
    });
  }
}

export async function getGroupManagers(
  groupId: string,
  extraUserIds?: string[],
): Promise<{ userId: string; publicKeyring: Uint8Array }[]> {
  let query = db
    .selectFrom('group_members')
    .leftJoin('users', 'users.id', 'group_members.user_id')
    .where('group_id', '=', groupId)
    .where((eb) =>
      (extraUserIds?.length ?? 0) > 0
        ? eb.or([
            eb('group_members.role', 'in', ['owner', 'admin', 'moderator']),
            eb('users.id', 'in', extraUserIds!),
          ])
        : eb('group_members.role', 'in', ['owner', 'admin', 'moderator']),
    );
  const rows = await query
    .select(['users.id as id', 'users.public_keyring as public_keyring'])
    .execute();
  return rows
    .filter((r) => r.id != null && r.public_keyring != null)
    .map((r) => ({ userId: r.id!, publicKeyring: r.public_keyring! }));
}

export async function getGroupMembers(
  groupId: string,
  extraUserIds?: string[],
): Promise<{ userId: string; publicKeyring: Uint8Array }[]> {
  const query = db
    .selectFrom('group_members')
    .leftJoin('users', 'users.id', 'group_members.user_id')
    .where((eb) =>
      (extraUserIds?.length ?? 0) > 0
        ? eb.or([
            eb('group_members.group_id', '=', groupId),
            eb('users.id', 'in', extraUserIds!),
          ])
        : eb('group_members.group_id', '=', groupId),
    );
  const rows = await query
    .select(['users.id as id', 'users.public_keyring as public_keyring'])
    .execute();
  return rows
    .filter((r) => r.id != null && r.public_keyring != null)
    .map((r) => ({ userId: r.id!, publicKeyring: r.public_keyring! }));
}

export async function assertSufficientGroupPermissions(input: {
  userId: string;
  groupId: string;
  permission: GroupRolePermission;
}) {
  if (
    !(await userHasPermission(
      (await dataAbstraction()),
      input.userId,
      input.groupId,
      input.permission,
    ))
  ) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Insufficient permissions.',
    });
  }
}
