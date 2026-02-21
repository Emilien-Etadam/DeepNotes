import type { DataTransaction } from '@stdlib/data';
import { addDays } from '@stdlib/misc';
import type { FastifyReply } from 'fastify';
import sodium from 'libsodium-wrappers-sumo';
import { nanoid } from 'nanoid';
import { dataAbstraction } from 'src/data/data-abstraction';
import { db } from 'src/data/knex';

import { setCookies } from '../utils/cookies';
import { generateTokens } from '../utils/jwt';

export async function generateSessionValues(input: {
  sessionId: string;
  userId: string;
  deviceId?: string;
  rememberSession: boolean;
  reply: FastifyReply;
  dtrx?: DataTransaction;
}) {
  // Generate session values

  const sessionKey = sodium.crypto_aead_xchacha20poly1305_ietf_keygen();
  const refreshCode = nanoid();

  const executor = (input.dtrx?.trx ?? db) as any;

  // Update session in database

  if (input.deviceId != null) {
    await executor
      .insertInto('sessions')
      .values({
        id: input.sessionId,
        user_id: input.userId,
        device_id: input.deviceId,
        encryption_key: sessionKey,
        refresh_code: refreshCode,
        expiration_date: addDays(new Date(), 7),
      } as any)
      .execute();
  } else {
    await (executor as any)
      .updateTable('sessions')
      .set({
        encryption_key: sessionKey,
        refresh_code: refreshCode,
        last_refresh_date: new Date(),
        expiration_date: addDays(new Date(), 7),
      } as any)
      .where('id', '=', input.sessionId)
      .execute();
  }

  // Generate tokens

  const tokens = generateTokens({
    userId: input.userId,
    sessionId: input.sessionId,
    refreshCode,
    rememberSession: input.rememberSession,
  });

  // Set cookies for client

  setCookies({
    reply: input.reply,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    rememberSession: input.rememberSession,
  });

  return {
    sessionId: input.sessionId,

    sessionKey,
    refreshCode,
  };
}

export async function invalidateAllSessions(
  userId: string,
  params?: { dtrx?: DataTransaction },
) {
  const sessions = await db
    .selectFrom('sessions')
    .where('user_id', '=', userId)
    .where('invalidated', '=', false)
    .select('id')
    .execute();

  const da = await dataAbstraction();
  await Promise.all(
    sessions.map((session) =>
      da.patch(
        'session',
        session.id,
        { invalidated: true },
        { dtrx: params?.dtrx },
      ),
    ),
  );
}
