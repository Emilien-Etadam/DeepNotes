import { isNanoID } from '@stdlib/misc';
import { once, pull } from 'lodash';
import { type InferProcedureOpts, authProcedure } from 'src/trpc/helpers';
import { z } from 'zod';
import { db } from 'src/data/knex';

const baseProcedure = authProcedure.input(
  z.object({
    sourcePageId: z.string().refine(isNanoID),
    targetPageId: z.string().refine(isNanoID),
  }),
);

export const deleteProcedure = once(() => baseProcedure.mutation(delete_));

export async function delete_({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedure>) {
  // Check if user has sufficient permissions

  const targetGroupId = await ctx.dataAbstraction.hget(
    'page',
    input.targetPageId,
    'group-id',
  );

  await ctx.assertSufficientGroupPermissions({
    userId: ctx.userId,
    groupId: targetGroupId,
    permission: 'editGroupPages',
  });

  // Delete page link

  await db
    .deleteFrom('page_links')
    .where('source_page_id', '=', input.sourcePageId)
    .where('target_page_id', '=', input.targetPageId)
    .execute();

  // Update cache

  const pageBacklinks: string[] = await ctx.dataAbstraction.hget(
    'page-backlinks',
    input.targetPageId,
    'list',
  );

  pull(pageBacklinks, input.sourcePageId);

  await ctx.dataAbstraction.hmset('page-backlinks', input.targetPageId, {
    list: pageBacklinks,
  });
}
