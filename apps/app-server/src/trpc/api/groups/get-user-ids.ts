import { isNanoID } from '@stdlib/misc';
import { once } from 'lodash';
import { type InferProcedureOpts, authProcedure } from 'src/trpc/helpers';
import { z } from 'zod';
import { db } from 'src/data/knex';

const baseProcedure = authProcedure.input(
  z.object({
    groupId: z.string().refine(isNanoID),
  }),
);

export const getUserIdsProcedure = once(() => baseProcedure.query(getUserIds));

export async function getUserIds({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedure>) {
  // Check if user has sufficient permissions

  await ctx.assertSufficientGroupPermissions({
    userId: ctx.userId,
    groupId: input.groupId,
    permission: 'viewGroupMembers',
  });

  // Get group user IDs

  const groupUsers = await db
    .selectFrom('group_members')
    .where('group_id', '=', input.groupId)
    .select('user_id')
    .union(
      db
        .selectFrom('group_join_requests')
        .where('group_id', '=', input.groupId)
        .select('user_id'),
    )
    .union(
      db
        .selectFrom('group_join_invitations')
        .where('group_id', '=', input.groupId)
        .select('user_id'),
    )
    .execute();

  return groupUsers.map((groupUser) => groupUser.user_id);
}
