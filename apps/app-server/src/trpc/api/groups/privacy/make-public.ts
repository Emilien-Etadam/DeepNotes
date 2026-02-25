import { isNanoID } from '@stdlib/misc';
import { checkRedlockSignalAborted } from '@stdlib/redlock';
import { TRPCError } from '@trpc/server';
import { once } from 'lodash';
import { type InferProcedureOpts, authProcedure } from 'src/trpc/helpers';
import { z } from 'zod';

const baseProcedure = authProcedure.input(
  z.object({
    groupId: z.string().refine(isNanoID),

    accessKeyring: z.instanceof(Uint8Array),
  }),
);

export const makePublicProcedure = once(() =>
  baseProcedure.mutation(makePublic),
);

export async function makePublic({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedure>) {
  return await ctx.usingLocks(
    [[`user-lock:${ctx.userId}`], [`group-lock:${input.groupId}`]],
    async (signals) => {
      return await ctx.dataAbstraction.transaction(async (dtrx) => {
        // Check if user has sufficient permissions

        await ctx.assertSufficientGroupPermissions({
          userId: ctx.userId,
          groupId: input.groupId,
          permission: 'editGroupSettings',
        });

        // Check if group is already public

        if (
          await ctx.dataAbstraction.hget('group', input.groupId, 'is-public')
        ) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Group is already public.',
          });
        }

        await Promise.all([
          // Set group access keyring

          ctx.dataAbstraction.patch(
            'group',
            input.groupId,
            { access_keyring: input.accessKeyring },
            { dtrx },
          ),

          // Clear group member access keyrings

          ...(
            await dtrx.trx!
              .selectFrom('group_members')
              .where('group_id', '=', input.groupId)
              .select('user_id')
              .execute()
          ).map((groupMember) =>
            ctx.dataAbstraction.patch(
              'group-member',
              `${input.groupId}:${groupMember.user_id}`,
              { encrypted_access_keyring: null },
              { dtrx },
            ),
          ),

          // Clear group join invitation access keyrings

          ...(
            await dtrx.trx!
              .selectFrom('group_join_invitations')
              .where('group_id', '=', input.groupId)
              .select('user_id')
              .execute()
          ).map((groupJoinInvitation) =>
            ctx.dataAbstraction.patch(
              'group-join-invitation',
              `${input.groupId}:${groupJoinInvitation.user_id}`,
              { encrypted_access_keyring: null },
              { dtrx },
            ),
          ),
        ]);

        checkRedlockSignalAborted(signals);
      });
    },
  );
}
