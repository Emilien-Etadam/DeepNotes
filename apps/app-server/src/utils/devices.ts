import type { DeviceRow } from '@deeplib/db';
import type { DataTransaction } from '@stdlib/data';
import { nanoid } from 'nanoid';
import { db } from 'src/data/knex';
import { getDeviceHash } from 'src/utils/crypto';

export async function getUserDevice(input: {
  ip: string;
  userAgent: string;
  userId: string;

  dtrx?: DataTransaction;
}) {
  const deviceHash = getDeviceHash({
    ip: input.ip,
    userAgent: input.userAgent,
    userId: input.userId,
  });

  const executor = (input.dtrx?.trx ?? db) as any;

  let device = await executor
    .selectFrom('devices')
    .where('user_id', '=', input.userId)
    .where('hash', '=', deviceHash)
    .selectAll()
    .executeTakeFirst();

  if (device == null) {
    const inserted = await executor
      .insertInto('devices')
      .values({
        id: nanoid(),
        user_id: input.userId,
        hash: deviceHash,
        trusted: false,
      } as any)
      .returningAll()
      .executeTakeFirst();
    if (inserted == null) throw new Error('Insert device failed');
    device = inserted;
  }

  return device as DeviceRow;
}
