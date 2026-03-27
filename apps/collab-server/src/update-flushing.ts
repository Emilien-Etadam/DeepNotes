import { base64ToBytes } from '@stdlib/base64';
import { mainLogger, namedPromises } from '@stdlib/misc';
import { throttle } from 'lodash';
import { unpack } from 'msgpackr';

import { db } from './data/knex';
import { getRedis } from './data/redis';
import { flushPageUpdateBuffer } from './data/redis/flush-page-update-buffer';

const moduleLogger = mainLogger.sub('update-flushing.ts');

export const updateBufferPageIdsSet = new Set<string>();

export const flushPageUpdatesThrottled = throttle(
  async () => {
    try {
      // Load buffered page updates

      const updateBufferPageIdsArray = Array.from(updateBufferPageIdsSet);
      updateBufferPageIdsSet.clear();

      const msgpackUpdateBuffers = await namedPromises(
        updateBufferPageIdsArray,
        updateBufferPageIdsArray.map((pageId) =>
          getRedis().lrangeBuffer(`page-update-buffer:{${pageId}}`, 0, -1),
        ),
      );

      // Prepare page updates

      const pageUpdateModels: Array<{
        page_id: string;
        index: number;
        encrypted_data: Buffer;
      }> = [];
      const pageUpdateIndexes: Record<string, number> = {};

      for (const [pageId, msgpackPageUpdates] of Object.entries(
        msgpackUpdateBuffers,
      )) {
        for (const msgpackPageUpdate of msgpackPageUpdates) {
          const [updateIndex, encryptedDataBase64] = unpack(
            msgpackPageUpdate,
          ) as [number, string];

          pageUpdateModels.push({
            page_id: pageId,
            index: updateIndex,
            encrypted_data: Buffer.from(base64ToBytes(encryptedDataBase64)),
          });

          pageUpdateIndexes[pageId] = updateIndex;
        }
      }

      if (pageUpdateModels.length === 0) {
        return;
      }

      // Insert page updates into database

      for (const row of pageUpdateModels) {
        await db
          .insertInto('page_updates')
          .values(row)
          .onConflict((oc) => oc.columns(['page_id', 'index']).doNothing())
          .execute();
      }

      // Trim page update buffers

      await Promise.allSettled(
        updateBufferPageIdsArray.map((pageId) =>
          flushPageUpdateBuffer(pageId, pageUpdateIndexes[pageId]),
        ),
      );

      moduleLogger.info(`Flushed ${pageUpdateModels.length} updates`);
    } catch (error) {
      moduleLogger.error('Page update flushing error: %o', error);
    }
  },
  5000,
  { leading: false },
);
