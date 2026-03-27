import { isNanoID } from '@stdlib/misc';
import type Fastify from 'fastify';
import { TRPCError } from '@trpc/server';
import { type InferProcedureInput, type InferProcedureOpts, authProcedure } from 'src/trpc/helpers';
import { getGroupKeyRotationValues, groupKeyRotationSchema, rotateGroupKeys } from 'src/utils/group-key-rotation';
import { createWebsocketEndpoint } from 'src/utils/websocket-endpoints';
import { z } from 'zod';

const baseProcedureStep1 = authProcedure.input(
  z.object({
    groupId: z.string().refine(isNanoID),
  }),
);
export const rotateKeysProcedureStep1 =
  baseProcedureStep1.mutation(rotateKeysStep1);

const baseProcedureStep2 = authProcedure.input(groupKeyRotationSchema);
export const rotateKeysProcedureStep2 =
  baseProcedureStep2.mutation(rotateKeysStep2);

const pendingGroupIdBySession = new Map<string, string>();

export function registerGroupsRotateKeys(fastify: ReturnType<typeof Fastify>) {
  createWebsocketEndpoint<InferProcedureInput<typeof baseProcedureStep1>>({
    fastify,
    url: '/trpc/groups.rotateKeys',

    async lockCommunication({ ctx, input, performCommunication }) {
      await ctx.usingLocks(
        [[`user-lock:${ctx.userId}`], [`group-lock:${input.groupId}`]],
        performCommunication,
      );
    },

    procedures: [
      [rotateKeysProcedureStep1, rotateKeysStep1],
      [rotateKeysProcedureStep2, rotateKeysStep2],
    ],
  });
}

export async function rotateKeysStep1({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedureStep1>) {
  pendingGroupIdBySession.set(ctx.sessionId, input.groupId);

  // Check sufficient permissions

  await ctx.assertSufficientGroupPermissions({
    userId: ctx.userId,
    groupId: input.groupId,
    permission: 'manageLowerRanks',
  });

  return await getGroupKeyRotationValues(input.groupId, ctx.userId);
}

export async function rotateKeysStep2({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedureStep2>) {
  const groupId = pendingGroupIdBySession.get(ctx.sessionId);

  if (groupId == null) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Missing groupId from step 1.',
    });
  }

  return await ctx.dataAbstraction.transaction(async (dtrx) => {
    try {
      return await rotateGroupKeys({
        ...input,
        groupId,
        dtrx,
      });
    } finally {
      pendingGroupIdBySession.delete(ctx.sessionId);
    }
  });
}
