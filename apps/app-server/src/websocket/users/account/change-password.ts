import type Fastify from 'fastify';
import { type InferProcedureInput, type InferProcedureOpts, authProcedure } from 'src/trpc/helpers';
import { invalidateAllSessions } from 'src/utils/sessions';
import { createWebsocketEndpoint } from 'src/utils/websocket-endpoints';
import {
  buildAccountUpdateStep2Patch,
  getAccountUpdateStep1Data,
} from './account-update-common';
import { z } from 'zod';

const baseProcedureStep1 = authProcedure.input(
  z.object({
    oldLoginHash: z.instanceof(Uint8Array),
  }),
);
export const changePasswordProcedureStep1 =
  baseProcedureStep1.mutation(changePasswordStep1);

const baseProcedureStep2 = authProcedure.input(
  z.object({
    newLoginHash: z.instanceof(Uint8Array),

    newEncryptedPrivateKeyring: z.instanceof(Uint8Array),
    newEncryptedSymmetricKeyring: z.instanceof(Uint8Array),
  }),
);
export const changePasswordProcedureStep2 =
  baseProcedureStep2.mutation(changePasswordStep2);

export function registerUsersChangePassword(
  fastify: ReturnType<typeof Fastify>,
) {
  createWebsocketEndpoint<InferProcedureInput<typeof baseProcedureStep1>>({
    fastify,
    url: '/trpc/users.account.changePassword',

    async lockCommunication({ ctx, performCommunication }) {
      await ctx.usingLocks([[`user-lock:${ctx.userId}`]], performCommunication);
    },

    procedures: [
      [changePasswordProcedureStep1, changePasswordStep1],
      [changePasswordProcedureStep2, changePasswordStep2],
    ],
  });
}

export async function changePasswordStep1({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedureStep1>) {
  return await getAccountUpdateStep1Data({
    userId: ctx.userId,
    oldLoginHash: input.oldLoginHash,
    assertCorrectUserPassword: ctx.assertCorrectUserPassword,
    assertNonDemoAccount: ctx.assertNonDemoAccount,
  });
}

export async function changePasswordStep2({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedureStep2>) {
  return await ctx.dataAbstraction.transaction(async (dtrx) => {
    await ctx.dataAbstraction.patch(
      'user',
      ctx.userId,
      buildAccountUpdateStep2Patch({ userId: ctx.userId, input }),
      { dtrx },
    );

    await invalidateAllSessions(ctx.userId, { dtrx });
  });
}
