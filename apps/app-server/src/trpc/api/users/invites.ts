import { hashUserEmail } from '@deeplib/data';
import { w3cEmailRegex } from '@stdlib/misc';
import { TRPCError } from '@trpc/server';
import { once } from 'lodash';
import { authProcedure, publicProcedure } from 'src/trpc/helpers';
import { db } from 'src/data/knex';
import { derivePasswordValues } from 'src/utils/crypto';
import {
  createInvite as createInviteStorage,
  getInvite,
  isAdmin,
  consumeInvite,
} from 'src/utils/invites';
import { trpc } from 'src/trpc/server';
import { registerUser, userRegistrationSchema } from 'src/utils/users';
import { z } from 'zod';

function maskEmail(email: string): string {
  const at = email.indexOf('@');
  if (at <= 0) return '***';
  const local = email.slice(0, at);
  const domain = email.slice(at);
  if (local.length <= 2) return local[0] + '***' + domain;
  return local.slice(0, 2) + '***' + domain;
}

const createInviteInput = z.object({
  email: z
    .string()
    .regex(w3cEmailRegex)
    .transform((e) => e.toLowerCase()),
});

const getInviteInput = z.object({ token: z.string().min(1) });

const completeRegistrationWithInviteInput = z
  .object({
    token: z.string().min(1),
    email: z
      .string()
      .regex(w3cEmailRegex)
      .transform((e) => e.toLowerCase()),
    loginHash: z.instanceof(Uint8Array),
  })
  .merge(userRegistrationSchema());

export const getAdminStatusProcedure = once(() =>
  authProcedure.query(async ({ ctx }) => {
    return { isAdmin: await isAdmin(ctx.userId) };
  }),
);

export const createInviteProcedure = once(() =>
  authProcedure.input(createInviteInput).mutation(async ({ ctx, input }) => {
    if (!(await isAdmin(ctx.userId))) {
      throw new TRPCError({
        message: 'Only the admin can create invitations.',
        code: 'FORBIDDEN',
      });
    }

    const existing = await db
      .selectFrom('users')
      .where('email_hash', '=', Buffer.from(hashUserEmail(input.email)))
      .select('id')
      .executeTakeFirst();

    if (existing != null) {
      throw new TRPCError({
        message: 'A user with this email already exists.',
        code: 'CONFLICT',
      });
    }

    const { token, expiresAt } = await createInviteStorage({
      email: input.email,
      createdByUserId: ctx.userId,
    });

    return {
      token,
      expiresAt: expiresAt.toISOString(),
      /** Client should build link as e.g. /accept-invite/{token} or #/accept-invite/{token} */
    };
  }),
);

export const getInviteProcedure = once(() =>
  publicProcedure.input(getInviteInput).query(async ({ input }) => {
    const invite = await getInvite(input.token);
    if (invite == null) {
      return { valid: false, expired: false, emailMasked: null };
    }
    const expired = new Date(invite.expiresAt) <= new Date();
    return {
      valid: !expired,
      expired,
      emailMasked: maskEmail(invite.email),
      email: invite.email,
    };
  }),
);

export const completeRegistrationWithInviteProcedure = once(() =>
  publicProcedure
    .input(completeRegistrationWithInviteInput)
    .mutation(async ({ ctx, input }) => {
      const invite = await consumeInvite(input.token);
      if (invite == null) {
        throw new TRPCError({
          message: 'Invalid or expired invitation.',
          code: 'BAD_REQUEST',
        });
      }
      if (invite.email !== input.email) {
        throw new TRPCError({
          message: 'Email does not match the invitation.',
          code: 'BAD_REQUEST',
        });
      }

      const existing = await db
        .selectFrom('users')
        .where('email_hash', '=', Buffer.from(hashUserEmail(input.email)))
        .select('id')
        .executeTakeFirst();

      if (existing != null) {
        throw new TRPCError({
          message: 'A user with this email already exists.',
          code: 'CONFLICT',
        });
      }

      await registerUser({
        ...input,
        ip: ctx.req.ip,
        userAgent: ctx.req.headers['user-agent'] ?? '',
        skipEmailVerification: true,
        passwordValues: derivePasswordValues({ password: input.loginHash }),
      });
    }),
);

export const invitesRouter = trpc.router({
  getAdminStatus: getAdminStatusProcedure(),
  createInvite: createInviteProcedure(),
  getInvite: getInviteProcedure(),
  completeRegistrationWithInvite: completeRegistrationWithInviteProcedure(),
});
