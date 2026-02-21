import { checkRedlockSignalAborted } from '@stdlib/redlock';
import { once } from 'lodash';
import { type InferProcedureOpts, authProcedure } from 'src/trpc/helpers';
import { db } from 'src/data/knex';

const baseProcedure = authProcedure;

export const markAsReadProcedure = once(() =>
  baseProcedure.mutation(markAsRead),
);

export async function markAsRead({
  ctx,
}: InferProcedureOpts<typeof baseProcedure>) {
  return await ctx.usingLocks(
    [[`user-lock:${ctx.userId}`]],
    async (signals) => {
      const row = await db
        .selectFrom('users_notifications')
        .where('user_id', '=', ctx.userId)
        .select('notification_id')
        .orderBy('notification_id', 'desc')
        .executeTakeFirst();
      const lastNotificationId = Number.parseInt(
        String(row?.notification_id ?? 0),
        10,
      );

      checkRedlockSignalAborted(signals);

      // Update last notification read

      await ctx.dataAbstraction.patch('user', ctx.userId, {
        last_notification_read: lastNotificationId,
      });
    },
  );
}
