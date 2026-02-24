import type { PageSnapshotInfo } from '@deeplib/misc';
import { isNanoID } from '@stdlib/misc';
import { checkRedlockSignalAborted } from '@stdlib/redlock';
import { once, remove } from 'lodash';
import { type InferProcedureOpts, authProcedure } from 'src/trpc/helpers';
import { z } from 'zod';

const baseProcedure = authProcedure.input(
  z.object({
    pageId: z.string().refine(isNanoID),

    snapshotId: z.string().refine(isNanoID),
  }),
);

export const deleteProcedure = once(() => baseProcedure.mutation(delete_));

async function deleteSnapshotWithGroupLock(
  ctx: InferProcedureOpts<typeof baseProcedure>['ctx'],
  groupId: string,
  input: InferProcedureOpts<typeof baseProcedure>['input'],
  signals: any,
) {
  return await ctx.usingLocks(
    [[`group-lock:${groupId}`]],
    async (signals) => {
      return await ctx.dataAbstraction.transaction(async (dtrx) => {
        await ctx.assertSufficientGroupPermissions({
          userId: ctx.userId,
          groupId: groupId,
          permission: 'editGroupPages',
        });

        const pageSnapshotInfos: PageSnapshotInfo[] =
          await ctx.dataAbstraction.hget(
            'page-snapshots',
            input.pageId,
            'infos',
          );

        await dtrx.trx!
          .deleteFrom('page_snapshots')
          .where('id', '=', input.snapshotId)
          .execute();

        remove(
          pageSnapshotInfos,
          (pageSnapshotInfo) => pageSnapshotInfo.id === input.snapshotId,
        );

        await ctx.dataAbstraction.hmset(
          'page-snapshots',
          input.pageId,
          { infos: pageSnapshotInfos },
          { dtrx },
        );

        checkRedlockSignalAborted(signals);
      });
    },
    signals,
  );
}

export async function delete_({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedure>) {
  return await ctx.usingLocks(
    [[`user-lock:${ctx.userId}`], [`page-lock:${input.pageId}`]],
    async (signals) => {
      const groupId = await ctx.dataAbstraction.hget(
        'page',
        input.pageId,
        'group-id',
      );

      return await deleteSnapshotWithGroupLock(ctx, groupId, input, signals);
    },
  );
}
