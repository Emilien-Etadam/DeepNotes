import {
  decryptUserEmail,
  encryptUserEmail,
  hashUserEmail,
} from '@deeplib/data';
import { TRPCError } from '@trpc/server';
import type Fastify from 'fastify';
import { type InferProcedureInput, type InferProcedureOpts, authProcedure } from 'src/trpc/helpers';
import { invalidateAllSessions } from 'src/utils/sessions';
import { createWebsocketEndpoint } from 'src/utils/websocket-endpoints';
import {
  buildAccountUpdateStep2Patch,
  getAccountUpdateStep1Data,
} from '../account-update-common';
import { z } from 'zod';

const baseProcedureStep1 = authProcedure.input(
  z.object({
    oldLoginHash: z.instanceof(Uint8Array),

    emailVerificationCode: z.string().regex(/^\d{6}$/),
  }),
);
export const finishProcedureStep1 =
  baseProcedureStep1.mutation(changeEmailStep1);

const baseProcedureStep2 = authProcedure.input(
  z.object({
    newLoginHash: z.instanceof(Uint8Array),

    newEncryptedPrivateKeyring: z.instanceof(Uint8Array),
    newEncryptedSymmetricKeyring: z.instanceof(Uint8Array),
  }),
);
export const finishProcedureStep2 =
  baseProcedureStep2.mutation(changeEmailStep2);

export function registerUsersChangeEmailFinish(
  fastify: ReturnType<typeof Fastify>,
) {
  createWebsocketEndpoint<InferProcedureInput<typeof baseProcedureStep1>>({
    fastify,
    url: '/trpc/users.account.emailChange.finish',

    async lockCommunication({ ctx, performCommunication }) {
      await ctx.usingLocks([[`user-lock:${ctx.userId}`]], performCommunication);
    },

    procedures: [
      [finishProcedureStep1, changeEmailStep1],
      [finishProcedureStep2, changeEmailStep2],
    ],
  });
}

export async function changeEmailStep1({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedureStep1>) {
  return await getAccountUpdateStep1Data({
    userId: ctx.userId,
    oldLoginHash: input.oldLoginHash,
    assertCorrectUserPassword: ctx.assertCorrectUserPassword,
    assertNonDemoAccount: ctx.assertNonDemoAccount,
    extraUserColumns: ['email_verification_code'] as const,
    validateUser(user) {
      if (user.email_verification_code !== input.emailVerificationCode) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid email verification code.',
        });
      }
    },
  });
}

export async function changeEmailStep2({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedureStep2>) {
  return await ctx.dataAbstraction.transaction(async (dtrx) => {
    const user = await dtrx.trx!
      .selectFrom('users')
      .where('id', '=', ctx.userId)
      .select(['encrypted_new_email', 'customer_id'])
      .executeTakeFirst();

    if (user == null) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'User not found.',
      });
    }

    if (user.encrypted_new_email == null) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No email change requested.',
      });
    }

    const newEmail = decryptUserEmail(user.encrypted_new_email);

    await Promise.all([
      ctx.dataAbstraction.patch(
        'user',
        ctx.userId,
        {
          encrypted_email: encryptUserEmail(newEmail),
          email_hash: hashUserEmail(newEmail),

          encrypted_new_email: null,
          email_verification_code: null,
          ...buildAccountUpdateStep2Patch({ userId: ctx.userId, input }),
        },
        { dtrx },
      ),

      invalidateAllSessions(ctx.userId, { dtrx }),
    ]);
  });
}
