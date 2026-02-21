import { isNanoID } from '@stdlib/misc';
import { checkRedlockSignalAborted } from '@stdlib/redlock';
import { once } from 'lodash';
import { type InferProcedureOpts, authProcedure } from 'src/trpc/helpers';
import { createGroup, groupCreationSchema } from 'src/utils/groups';
import { z } from 'zod';

const baseProcedure = authProcedure.input(
  z.object({
    parentPageId: z.string().refine(isNanoID),
    groupId: z.string().refine(isNanoID),
    pageId: z.string().refine(isNanoID),

    pageEncryptedSymmetricKeyring: z.instanceof(Uint8Array),
    pageEncryptedRelativeTitle: z.instanceof(Uint8Array),
    pageEncryptedAbsoluteTitle: z.instanceof(Uint8Array),

    groupCreation: groupCreationSchema().optional(),
  }),
);

export const createProcedure = once(() => baseProcedure.mutation(create));

export async function create({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedure>) {
  return await ctx.usingLocks(
    [[`user-lock:${ctx.userId}`], [`group-lock:${input.groupId}`]],
    async (signals) => {
      return await ctx.dataAbstraction.transaction(async (dtrx) => {
        // Check sufficient permissions

        if (input.groupCreation == null) {
          await ctx.assertSufficientGroupPermissions({
            userId: ctx.userId,
            groupId: input.groupId,
            permission: 'editGroupPages',
          });
        }

        const personalGroupId = await ctx.dataAbstraction.hget(
          'user',
          ctx.userId,
          'personal-group-id',
        );

        if (input.groupId !== personalGroupId || input.groupCreation != null) {
          await ctx.assertUserSubscribed({ userId: ctx.userId });
        }

        // Create group if requested

        if (input.groupCreation != null) {
          await createGroup({
            userId: ctx.userId,

            groupId: input.groupId,
            groupIsPersonal: false,
            groupMainPageId: input.pageId,

            ...input.groupCreation,

            dtrx,
          });
        }

        // Create page

        await Promise.all([
          ctx.dataAbstraction.insert(
            'page',
            input.pageId,
            {
              id: input.pageId,
              encrypted_symmetric_keyring: input.pageEncryptedSymmetricKeyring,
              encrypted_relative_title: input.pageEncryptedRelativeTitle,

              encrypted_absolute_title: input.pageEncryptedAbsoluteTitle,
              group_id: input.groupId,
              free: false,
            },
            { dtrx },
          ),

          ctx.dataAbstraction.insert(
            'user-page',
            `${ctx.userId}:${input.pageId}`,
            {
              user_id: ctx.userId,
              page_id: input.pageId,
              last_parent_id: input.parentPageId,
            },
            { dtrx },
          ),
        ]);

        checkRedlockSignalAborted(signals);

        return {
          pageId: input.pageId,
          numFreePages: 0,
        };
      });
    },
  );
}
