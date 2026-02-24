import { hashUserEmail } from '@deeplib/data';
import type { DeviceRow, UserRow } from '@deeplib/db';
import {
  createPrivateKeyring,
  createSymmetricKeyring,
  getPasswordHashValues,
} from '@stdlib/crypto';
import type { DataTransaction } from '@stdlib/data';
import { allAsyncProps, w3cEmailRegex } from '@stdlib/misc';
import { TRPCError } from '@trpc/server';
import type { Cluster, Redis } from 'ioredis';
import sodium from 'libsodium-wrappers-sumo';
import { once } from 'lodash';
import { nanoid } from 'nanoid';
import { authenticator } from 'otplib';
import { type InferProcedureOpts, publicProcedure } from 'src/trpc/helpers';
import {
  decryptRecoveryCodes,
  decryptUserAuthenticatorSecret,
  decryptUserRehashedLoginHash,
  derivePasswordValues,
  encryptRecoveryCodes,
  verifyRecoveryCode,
} from 'src/utils/crypto';
import { getUserDevice } from 'src/utils/devices';
import { generateSessionValues } from 'src/utils/sessions';
import { z } from 'zod';

import { db } from '../../../data/knex';
import { sendRegistrationEmail } from '../users/account/register';

const baseProcedure = publicProcedure.input(
  z.object({
    email: z
      .string()
      .regex(w3cEmailRegex)
      .or(z.string().refine((email) => email === 'demo'))
      .transform((email) =>
        (process.env.EMAIL_CASE_SENSITIVITY_EXCEPTIONS ?? '')
          .split(';')
          .includes(email)
          ? email
          : email.toLowerCase(),
      ),
    loginHash: z.instanceof(Uint8Array),
    rememberSession: z.boolean(),

    authenticatorToken: z.string().optional(),
    rememberDevice: z.boolean().optional(),

    recoveryCode: z
      .string()
      .regex(/^[a-f0-9]{32}$/)
      .optional(),
  }),
);

export const loginProcedure = once(() => baseProcedure.mutation(login));

export async function login({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedure>) {
  return await ctx.dataAbstraction.transaction(async (dtrx) => {
    // Check for excessive failed login attempts

    const failedLoginAttempts = await _checkFailedLoginAttempts({
      redis: ctx.redis,

      ip: ctx.req.ip,
      email: input.email,
    });

    if (failedLoginAttempts.excessive) {
      throw new TRPCError({
        message: `Too many failed login attempts. Try again in ${failedLoginAttempts.loginBlockTTL} minutes.`,
        code: 'TOO_MANY_REQUESTS',
      });
    }

    // Get user data

    const user = await db
      .selectFrom('users')
      .where('email_hash', '=', Buffer.from(hashUserEmail(input.email)))
      .where((eb) =>
        eb.or([
          eb('email_verified', '=', true),
          eb('email_verification_expiration_date', '>', new Date()),
        ] as any),
      )
      .select([
        'id',
        'email_verified',
        'email_verification_code',
        'encrypted_rehashed_login_hash',
        'public_keyring',
        'encrypted_private_keyring',
        'encrypted_symmetric_keyring',
        'two_factor_auth_enabled',
        'encrypted_authenticator_secret',
        'encrypted_recovery_codes',
        'personal_group_id',
      ])
      .executeTakeFirst();

    if (user == null) {
      await _incrementFailedLoginAttempts({
        redis: ctx.redis,

        ip: ctx.req.ip,
        email: input.email,
      });

      throw new TRPCError({
        message: 'Incorrect email or password.',
        code: 'UNAUTHORIZED',
      });
    }

    // Assert correct password

    const passwordHashValues = getPasswordHashValues(
      decryptUserRehashedLoginHash(user.encrypted_rehashed_login_hash),
    );

    const passwordValues = derivePasswordValues({
      password: input.loginHash,
      salt: passwordHashValues.saltBytes,
    });

    const passwordIsCorrect = sodium.memcmp(
      passwordValues.hash,
      passwordHashValues.hashBytes,
    );

    if (!passwordIsCorrect) {
      await _incrementFailedLoginAttempts({
        redis: ctx.redis,

        ip: ctx.req.ip,
        email: input.email,
      });

      throw new TRPCError({
        message: 'Incorrect email or password.',
        code: 'UNAUTHORIZED',
      });
    }

    // Check if email is verified

    if (!user.email_verified) {
      await sendRegistrationEmail({
        email: input.email,
        emailVerificationCode: user.email_verification_code,
      });

      throw new TRPCError({
        message: 'Email awaiting verification. New email sent.',
        code: 'UNAUTHORIZED',
      });
    }

    // Get user device

    const device = await getUserDevice({
      ip: ctx.req.ip,
      userAgent: ctx.req.headers['user-agent'] ?? '',
      userId: user.id,

      dtrx,
    });

    // Check two-factor authentication

    if (user!.two_factor_auth_enabled) {
      await _checkTwoFactorAuth({
        device,

        email: input.email,
        ip: ctx.req.ip,

        redis: ctx.redis,

        user: user as UserRow,

        authenticatorToken: input.authenticatorToken!,
        recoveryCode: input.recoveryCode!,
        rememberDevice: input.rememberDevice!,

        dtrx,
      });
    }

    // Generate session

    const sessionId = nanoid();

    const { sessionKey } = await generateSessionValues({
      sessionId,
      userId: user.id,
      deviceId: device.id,
      rememberSession: input.rememberSession,
      reply: ctx.res,
      dtrx,
    });

    // Return session values

    return {
      userId: user!.id,
      sessionId,

      sessionKey,

      personalGroupId: user!.personal_group_id,

      publicKeyring: new Uint8Array(user!.public_keyring),
      encryptedPrivateKeyring: new Uint8Array(
        createPrivateKeyring(user!.encrypted_private_keyring)
          .unwrapSymmetric(passwordValues.key, {
            associatedData: {
              context: 'UserEncryptedPrivateKeyring',
              userId: user!.id,
            },
          })
          .wrappedValue,
      ),
      encryptedSymmetricKeyring: new Uint8Array(
        createSymmetricKeyring(user!.encrypted_symmetric_keyring)
          .unwrapSymmetric(passwordValues.key, {
            associatedData: {
              context: 'UserEncryptedSymmetricKeyring',
              userId: user!.id,
            },
          })
          .wrappedValue,
      ),
    };
  });
}

async function _checkFailedLoginAttempts(input: {
  redis: Redis | Cluster;

  ip: string;
  email: string;
}) {
  const {
    emailFailedLoginAttemptsStr,
    emailFailedLoginAttemptsTTL,
    ipFailedLoginAttemptsStr,
    ipFailedLoginAttemptsTTL,
  } = await allAsyncProps({
    emailFailedLoginAttemptsStr:
      input.email === 'demo'
        ? Promise.resolve('0')
        : input.redis.get(`email-failed-login-attempts:${input.email}`),
    emailFailedLoginAttemptsTTL:
      input.email === 'demo'
        ? Promise.resolve(0)
        : input.redis.ttl(`email-failed-login-attempts:${input.email}`),

    ipFailedLoginAttemptsStr: input.redis.get(
      `ip-failed-login-attempts:${input.ip}`,
    ),
    ipFailedLoginAttemptsTTL: input.redis.ttl(
      `ip-failed-login-attempts:${input.ip}`,
    ),
  });

  const numFailedEmailLoginAttempts =
    Number.parseInt(emailFailedLoginAttemptsStr!) || 0;
  const numFailedIPLoginAttempts = Number.parseInt(ipFailedLoginAttemptsStr!) || 0;

  const excessive =
    Math.max(numFailedEmailLoginAttempts, numFailedIPLoginAttempts) >= 4;

  const loginBlockTTL = Math.ceil(
    Math.max(emailFailedLoginAttemptsTTL, ipFailedLoginAttemptsTTL) / 60,
  );

  return {
    excessive,

    loginBlockTTL,
  };
}

async function _incrementFailedLoginAttempts(input: {
  redis: Redis | Cluster;

  email: string;
  ip: string;
}) {
  await Promise.all([
    input.redis.incr(`email-failed-login-attempts:${input.email}`),
    input.redis.expire(`email-failed-login-attempts:${input.email}`, 15 * 60),

    input.redis.incr(`ip-failed-login-attempts:${input.ip}`),
    input.redis.expire(`ip-failed-login-attempts:${input.ip}`, 15 * 60),
  ]);
}

async function _checkTwoFactorAuth(
  input: {
    device: DeviceRow;

    authenticatorToken: string;
    recoveryCode: string;

    rememberDevice: boolean;

    user: UserRow;

    dtrx: DataTransaction;
  } & Parameters<typeof _incrementFailedLoginAttempts>[0],
) {
  if (input.device.trusted) {
    return;
  }

  if (input.authenticatorToken != null) {
    await _verifyAuthenticatorToken(input);
    return;
  }
  if (input.recoveryCode != null) {
    await _verifyRecoveryCode(input);
    return;
  }

  throw new TRPCError({
    message: 'Requires two-factor authentication.',
    code: 'UNAUTHORIZED',
  });
}

async function _verifyAuthenticatorToken(
  input: {
    device: DeviceRow;
    user: UserRow;
    rememberDevice: boolean;
    dtrx: DataTransaction;
  } & Parameters<typeof _incrementFailedLoginAttempts>[0] & {
      authenticatorToken: string;
    },
) {
  const valid = authenticator.check(
    input.authenticatorToken,
    decryptUserAuthenticatorSecret(input.user.encrypted_authenticator_secret!),
  );
  if (valid) {
    if (input.rememberDevice) {
      await input.dtrx.trx!
        .updateTable('devices')
        .set({ trusted: true })
        .where('id', '=', input.device.id)
        .execute();
    }
    return;
  }
  await _incrementFailedLoginAttempts({
    redis: input.redis,
    ip: input.ip,
    email: input.email,
  });
  throw new TRPCError({
    message: 'Invalid authenticator token.',
    code: 'UNAUTHORIZED',
  });
}

async function _verifyRecoveryCode(
  input: {
    user: UserRow;
    recoveryCode: string;
    dtrx: DataTransaction;
  } & Parameters<typeof _incrementFailedLoginAttempts>[0],
) {
  if (input.user.encrypted_recovery_codes == null) {
    await _incrementFailedLoginAttempts({
      redis: input.redis,
      ip: input.ip,
      email: input.email,
    });
    throw new TRPCError({
      message: 'Invalid recovery code.',
      code: 'UNAUTHORIZED',
    });
  }
  const recoveryCodes = decryptRecoveryCodes(input.user.encrypted_recovery_codes);
  for (let i = 0; i < recoveryCodes.length; i++) {
    if (verifyRecoveryCode(input.recoveryCode, recoveryCodes[i])) {
      recoveryCodes.splice(i, 1);
      await input.dtrx.trx!
        .updateTable('users')
        .set({
          encrypted_recovery_codes: encryptRecoveryCodes(recoveryCodes),
        } as any)
        .where('id', '=', input.user.id)
        .execute();
      return;
    }
  }
  await _incrementFailedLoginAttempts({
    redis: input.redis,
    ip: input.ip,
    email: input.email,
  });
  throw new TRPCError({
    message: 'Invalid recovery code.',
    code: 'UNAUTHORIZED',
  });
}
