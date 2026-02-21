import type { DeepNotesNotificationType } from '@deeplib/misc';
import { once } from 'lodash';
import { type InferProcedureOpts, authProcedure } from 'src/trpc/helpers';
import { z } from 'zod';
import { db } from 'src/data/knex';

const baseProcedure = authProcedure.input(
  z
    .object({
      lastNotificationId: z.number().optional(),
    })
    .optional(),
);

export const loadProcedure = once(() => baseProcedure.query(load));

export async function load({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedure>) {
  const [notifications, lastNotificationRead] = await Promise.all([
    _loadNotifications({
      userId: ctx.userId,
      lastNotificationId: input?.lastNotificationId,
    }),

    ...(input?.lastNotificationId == null
      ? [ctx.dataAbstraction.hget('user', ctx.userId, 'last-notification-read')]
      : []),
  ]);

  return {
    ...notifications,

    lastNotificationRead,
  };
}

async function _loadNotifications(input: {
  userId: string;
  lastNotificationId?: number;
}) {
  let query = db
    .selectFrom('users_notifications')
    .innerJoin(
      'notifications',
      'notifications.id',
      'users_notifications.notification_id',
    )
    .where('users_notifications.user_id', '=', input.userId)
    .select([
      'notifications.id as id',
      'notifications.type as type',
      'users_notifications.encrypted_symmetric_key as encrypted_symmetric_key',
      'notifications.encrypted_content as encrypted_content',
      'notifications.datetime as datetime',
    ]);

  if (input.lastNotificationId != null) {
    query = query.where(
      'users_notifications.notification_id',
      '<',
      input.lastNotificationId,
    );
  }

  const notifications = await query
    .orderBy('users_notifications.notification_id', 'desc')
    .limit(21)
    .execute();

  const hasMore = notifications.length > 20;
  const items = hasMore ? notifications.slice(0, 20) : notifications;

  return {
    items: items.map((n) => ({
      id: Number(n.id),
      type: n.type as DeepNotesNotificationType,
      encryptedSymmetricKey: n.encrypted_symmetric_key,
      encryptedContent: n.encrypted_content,
      dateTime: n.datetime,
    })),
    hasMore,
  };
}
