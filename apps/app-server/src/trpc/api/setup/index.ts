import { hashUserEmail } from '@deeplib/data';
import { w3cEmailRegex } from '@stdlib/misc';
import { TRPCError } from '@trpc/server';
import { once } from 'lodash';
import { publicProcedure } from 'src/trpc/helpers';
import { trpc } from 'src/trpc/server';
import { derivePasswordValues } from 'src/utils/crypto';
import { setAdminUserId } from 'src/utils/invites';
import { hasAnyUser, registerUser, userRegistrationSchema } from 'src/utils/users';
import { z } from 'zod';
import { db } from 'src/data/knex';

const setupCreateFirstUserInput = z
  .object({
    email: z
      .string()
      .regex(w3cEmailRegex)
      .transform((email) => email.toLowerCase()),
    loginHash: z.instanceof(Uint8Array),
  })
  .merge(userRegistrationSchema());

const getSetupStatusProcedure = once(() =>
  publicProcedure.query(async () => {
    try {
      const anyUser = await hasAnyUser();
      return { needsSetup: !anyUser, error: null as string | null };
    } catch (err) {
      // Database or backend unavailable (e.g. PostgreSQL not running)
      return {
        needsSetup: false,
        error: 'unavailable',
      };
    }
  }),
);

const setupCreateFirstUserProcedure = once(() =>
  publicProcedure
    .input(setupCreateFirstUserInput)
    .mutation(async ({ ctx, input }) => {
      if (await hasAnyUser()) {
        throw new TRPCError({
          message: 'Setup already completed.',
          code: 'FORBIDDEN',
        });
      }

      const existing = await db
        .selectFrom('users')
        .where('email_hash', '=', Buffer.from(hashUserEmail(input.email)))
        .executeTakeFirst();

      if (existing != null) {
        throw new TRPCError({
          message: 'Email already in use.',
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

      await setAdminUserId(input.userId);
    }),
);

export const setupRouter = trpc.router({
  getSetupStatus: getSetupStatusProcedure(),
  setupCreateFirstUser: setupCreateFirstUserProcedure(),
});
