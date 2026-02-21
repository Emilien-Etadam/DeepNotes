import { decryptUserEmail } from '@deeplib/data';
import { checkRedlockSignalAborted } from '@stdlib/redlock';
import { TRPCError } from '@trpc/server';
import { once } from 'lodash';
import { sql } from 'kysely';
import { type InferProcedureOpts, authProcedure } from 'src/trpc/helpers';
import { clearCookies } from 'src/utils/cookies';
import { z } from 'zod';

const baseProcedure = authProcedure.input(
  z.object({
    loginHash: z.instanceof(Uint8Array),
  }),
);

export const deleteProcedure = once(() => baseProcedure.mutation(delete_));

export async function delete_({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedure>) {
  return await ctx.usingLocks(
    [[`user-lock:${ctx.userId}`]],
    async (signals) => {
      return await ctx.dataAbstraction.transaction(async (dtrx) => {
        // Assert correct password

        await ctx.assertCorrectUserPassword({
          userId: ctx.userId,
          loginHash: input.loginHash,
        });

        // Check if any group has more than one member

        const trx = dtrx.trx!;
        const memberships = await trx
          .selectFrom('group_members')
          .where('user_id', '=', ctx.userId)
          .select([
            'group_id',
            sql<number>`(SELECT count(*)::int FROM group_members gm2 WHERE gm2.group_id = group_members.group_id)`.as(
              'member_count',
            ),
            sql<number>`(SELECT count(*)::int FROM group_members gm3 WHERE gm3.group_id = group_members.group_id AND gm3.role = 'owner')`.as(
              'owner_count',
            ),
          ])
          .execute();

        if (
          memberships.some(
            (count) =>
              count.member_count > 1 && count.owner_count <= 1,
          )
        ) {
          throw new TRPCError({
            message:
              'Some groups would be left without an owner. Transfer ownership before deleting your account.',
            code: 'BAD_REQUEST',
          });
        }

        const idsOfGroupsToDelete = memberships
          .filter((membership) => membership.member_count <= 1)
          .map((membership) => membership.group_id);

        // Get all user data

        const [
          groupPageIds,
          invitations,
          requests,
          visitedPageIds,
          sessions,
          user,
        ] = await Promise.all([
          trx
            .selectFrom('pages')
            .where('group_id', 'in', idsOfGroupsToDelete)
            .select('id')
            .execute(),

          trx
            .selectFrom('group_join_invitations')
            .where('user_id', '=', ctx.userId)
            .select('group_id')
            .execute(),
          trx
            .selectFrom('group_join_requests')
            .where('user_id', '=', ctx.userId)
            .select('group_id')
            .execute(),

          trx
            .selectFrom('users_pages')
            .where('user_id', '=', ctx.userId)
            .select('page_id')
            .execute(),

          trx
            .selectFrom('sessions')
            .where('user_id', '=', ctx.userId)
            .where('invalidated', '=', false)
            .select('id')
            .execute(),

          trx
            .selectFrom('users')
            .where('id', '=', ctx.userId)
            .select(['encrypted_email', 'personal_group_id', 'customer_id'])
            .executeTakeFirst(),
        ]);

        if (user == null) {
          throw new TRPCError({
            message: 'User not found',
            code: 'NOT_FOUND',
          });
        }

        // Delete all user data

        await Promise.all([
          ...groupPageIds.map((page) =>
            ctx.dataAbstraction.delete('page', page.id, {
              dtrx,
              cacheOnly: true,
            }),
          ),

          ...invitations.map((invitation) =>
            ctx.dataAbstraction.delete(
              'group-join-invitation',
              `${invitation.group_id}:${ctx.userId}`,
              { dtrx, cacheOnly: true },
            ),
          ),
          ...requests.map((request) =>
            ctx.dataAbstraction.delete(
              'group-join-request',
              `${request.group_id}:${ctx.userId}`,
              { dtrx, cacheOnly: true },
            ),
          ),
          ...memberships.map((member) =>
            ctx.dataAbstraction.delete(
              'group-member',
              `${member.group_id}:${ctx.userId}`,
              { dtrx, cacheOnly: true },
            ),
          ),

          ...idsOfGroupsToDelete.map((groupId) =>
            ctx.dataAbstraction.delete('group', groupId, {
              dtrx,
            }),
          ),

          ...visitedPageIds.map((page) =>
            ctx.dataAbstraction.delete(
              'user-page',
              `${ctx.userId}:${page.page_id}`,
              {
                dtrx,
                cacheOnly: true,
              },
            ),
          ),

          ...sessions.map((session) =>
            ctx.dataAbstraction.patch(
              'session',
              session.id,
              { invalidated: true },
              { dtrx, cacheOnly: true },
            ),
          ),

          ...(user.customer_id == null
            ? []
            : [
                ctx.dataAbstraction.delete('customer', user.customer_id, {
                  dtrx,
                  cacheOnly: true,
                }),
              ]),

          ctx.dataAbstraction.delete(
            'email',
            decryptUserEmail(user.encrypted_email),
            {
              dtrx,
              cacheOnly: true,
            },
          ),

          ctx.dataAbstraction.delete('user', ctx.userId, { dtrx }),
        ]);

        checkRedlockSignalAborted(signals);

        // Clear cookies

        clearCookies(ctx.res);
      });
    },
  );
}
