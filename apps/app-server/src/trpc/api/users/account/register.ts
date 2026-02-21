import { sendMail } from '@deeplib/mail';
import { w3cEmailRegex } from '@stdlib/misc';
import { TRPCError } from '@trpc/server';
import { once } from 'lodash';
import { type InferProcedureOpts, publicProcedure } from 'src/trpc/helpers';
import { hasAnyUser, userRegistrationSchema } from 'src/utils/users';
import { z } from 'zod';

const baseProcedure = publicProcedure.input(
  z
    .object({
      email: z
        .string()
        .regex(w3cEmailRegex)
        .transform((email) => email.toLowerCase()),
      loginHash: z.instanceof(Uint8Array),
    })
    .merge(userRegistrationSchema()),
);

export const registerProcedure = once(() => baseProcedure.mutation(register));

export async function register({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedure>) {
  const anyUser = await hasAnyUser();
  throw new TRPCError({
    message: anyUser
      ? 'Registration is disabled. Contact your administrator.'
      : 'Use the setup page to create the first account.',
    code: 'FORBIDDEN',
  });
}

export async function sendRegistrationEmail(input: {
  email: string;
  emailVerificationCode: string | null;
}) {
  await sendMail({
    from: {
      name: 'DeepNotes',
      email: 'account@deepnotes.app',
    },
    to: [input.email],
    subject: 'Complete your registration',
    html: `
      Visit the following link to verify your email address:<br/>
      <a href="https://deepnotes.app/verify-email/${input.emailVerificationCode}">https://deepnotes.app/verify-email/${input.emailVerificationCode}</a><br/>
      The link above expires in 1 hour.
    `,
  });
}
