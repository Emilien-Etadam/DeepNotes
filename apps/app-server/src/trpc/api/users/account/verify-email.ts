import { isNanoID } from '@stdlib/misc';
import { TRPCError } from '@trpc/server';
import { once } from 'lodash';
import { sql } from 'kysely';
import { type InferProcedureOpts, publicProcedure } from 'src/trpc/helpers';
import { z } from 'zod';
import { db } from 'src/data/knex';

const baseProcedure = publicProcedure.input(
  z.object({
    emailVerificationCode: z.string().refine(isNanoID),
  }),
);

export const verifyEmailProcedure = once(() =>
  baseProcedure.mutation(verifyEmail),
);

export async function verifyEmail({
  input,
}: InferProcedureOpts<typeof baseProcedure>) {
  const result = await db
    .updateTable('users')
    .set({
      encrypted_email: sql`encrypted_new_email`,
      encrypted_new_email: null,
      email_verified: true,
      email_verification_code: null,
      email_verification_expiration_date: null,
    })
    .where('email_verified', '=', false)
    .where('email_verification_code', '=', input.emailVerificationCode)
    .where('email_verification_expiration_date', '>', new Date())
    .execute();
  const numUpdated = Number((result as { numUpdatedRows?: bigint }).numUpdatedRows ?? 0);
  if (numUpdated !== 1) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid email verification code.',
    });
  }
}
