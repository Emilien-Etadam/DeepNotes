import { hget } from '@deeplib/data';
import { canChangeRole } from '@deeplib/misc';
import { isNanoID, objFromEntries } from '@stdlib/misc';
import { TRPCError } from '@trpc/server';
import type Fastify from 'fastify';
import { type InferProcedureInput, type InferProcedureOpts, authProcedure } from 'src/trpc/helpers';
import { getGroupMembers, GroupRoleEnum } from 'src/utils/groups';
import { type NotificationsResponse, notificationsRequestSchema, notifyUsers } from 'src/utils/notifications';
import { createWebsocketEndpoint } from 'src/utils/websocket-endpoints';
import { z } from 'zod';

const baseProcedureStep1 = authProcedure.input(
  z.object({
    groupId: z.string().refine(isNanoID),

    patientId: z.string().refine(isNanoID),
    requestedRole: GroupRoleEnum,
  }),
);
export const changeUserRoleProcedureStep1 =
  baseProcedureStep1.mutation(changeUserRoleStep1);

const baseProcedureStep2 = authProcedure.input(notificationsRequestSchema);
export const changeUserRoleProcedureStep2 =
  baseProcedureStep2.mutation(changeUserRoleStep2);

export function registerGroupsChangeUserRole(
  fastify: ReturnType<typeof Fastify>,
) {
  createWebsocketEndpoint<InferProcedureInput<typeof baseProcedureStep1>>({
    fastify,
    url: '/trpc/groups.changeUserRole',

    async lockCommunication({ ctx, input, performCommunication }) {
      await ctx.usingLocks(
        [
          [`user-lock:${ctx.userId}`],
          ...(input.patientId !== ctx.userId
            ? [[`user-lock:${input.patientId}`]]
            : []),
          [`group-lock:${input.groupId}`],
        ],
        performCommunication,
      );
    },

    procedures: [
      [changeUserRoleProcedureStep1, changeUserRoleStep1],
      [changeUserRoleProcedureStep2, changeUserRoleStep2],
    ],
  });
}

export async function changeUserRoleStep1({
  ctx,
  input,
}: InferProcedureOpts<
  typeof baseProcedureStep1
>): Promise<NotificationsResponse> {
  return await ctx.dataAbstraction.transaction(async (dtrx) => {
    // Check sufficient permissions

    const [agentRole, patientRole] = await ctx.dataAbstraction.mhget([
      hget('group-member', `${input.groupId}:${ctx.userId}`, 'role'),
      hget('group-member', `${input.groupId}:${input.patientId}`, 'role'),
    ]);

    if (!canChangeRole(agentRole, patientRole, input.requestedRole)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions.',
      });
    }

    // Check if there is at least one owner left

    const row = await dtrx.trx!
      .selectFrom('group_members')
      .where('group_id', '=', input.groupId)
      .where('role', '=', 'owner')
      .select((eb) => eb.fn.countAll().as('count'))
      .executeTakeFirst();
    const ownerCount = Number(row?.count ?? 0);

    if (
      patientRole === 'owner' &&
      input.requestedRole !== 'owner' &&
      ownerCount <= 1
    ) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You cannot remove all group owners.',
      });
    }

    await ctx.dataAbstraction.patch(
      'group-member',
      `${input.groupId}:${input.patientId}`,
      { role: input.requestedRole },
      { dtrx },
    );

    return {
      notificationRecipients: objFromEntries(
        (await getGroupMembers(input.groupId)).map(
          ({ userId, publicKeyring }) => [userId, { publicKeyring }],
        ),
      ),
    };
  });
}

export async function changeUserRoleStep2({
  input,
}: InferProcedureOpts<typeof baseProcedureStep2>) {
  await notifyUsers(
    input.notifications.map(({ recipients, encryptedContent }) => ({
      type: 'group-member-role-changed',

      recipients,
      encryptedContent,
    })),
  );
}
