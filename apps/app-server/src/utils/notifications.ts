import type {
  DeepNotesNotification,
  DeepNotesNotificationType,
} from '@deeplib/misc';
import { objEntries } from '@stdlib/misc';
import { pack } from 'msgpackr';
import { dataAbstraction } from 'src/data/data-abstraction';
import { getRedis } from 'src/data/redis';
import { z } from 'zod';

export const notificationRequestSchema = z.object({
  recipients: z.record(
    z.object({ encryptedSymmetricKey: z.instanceof(Uint8Array) }),
  ),

  encryptedContent: z.instanceof(Uint8Array),
});
export const notificationsRequestSchema = z.object({
  notifications: notificationRequestSchema.array(),
});

export const notificationsResponseSchema = z.object({
  notificationRecipients: z.record(
    z.object({
      publicKeyring: z.instanceof(Uint8Array),
    }),
  ),
});
export type NotificationsResponse = z.infer<typeof notificationsResponseSchema>;

export async function notifyUsers(
  notifications: {
    type: DeepNotesNotificationType;

    recipients: Record<string, { encryptedSymmetricKey: Uint8Array }>;

    encryptedContent: Uint8Array;
  }[],
) {
  await (await dataAbstraction()).transaction(async (dtrx) => {
    const trx = dtrx.trx!;
    const dateTime = new Date();

    await Promise.all(
      notifications.map(async ({ recipients, type, encryptedContent }) => {
        const row = await trx
          .insertInto('notifications')
          .values({
            type,
            encrypted_content: encryptedContent,
            datetime: dateTime,
          } as any)
          .returning('id')
          .executeTakeFirstOrThrow();
        const notificationId = Number(row.id);

        await Promise.all(
          objEntries(recipients).map(
            async ([userId, { encryptedSymmetricKey }]) => {
              await trx
                .insertInto('users_notifications')
                .values({
                  user_id: userId,
                  notification_id: notificationId,
                  encrypted_symmetric_key: encryptedSymmetricKey,
                } as any)
                .execute();

              await getRedis().publish(
                `user-notification:${userId}`,
                pack({
                  id: notificationId,

                  type,

                  encryptedSymmetricKey: encryptedSymmetricKey,
                  encryptedContent: encryptedContent,

                  dateTime,
                } as DeepNotesNotification),
              );
            },
          ),
        );
      }),
    );
  });
}
