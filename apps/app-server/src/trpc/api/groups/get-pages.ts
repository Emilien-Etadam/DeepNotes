import { isNanoID } from '@stdlib/misc';
import { once } from 'lodash';
import { type InferProcedureOpts, optionalAuthProcedure } from 'src/trpc/helpers';
import { z } from 'zod';
import { db } from 'src/data/knex';

const baseProcedure = optionalAuthProcedure.input(
  z.object({
    groupId: z.string().refine(isNanoID),

    lastPageId: z.string().refine(isNanoID).optional(),
  }),
);

export const getPagesProcedure = once(() => baseProcedure.query(getPages));

export async function getPages({
  ctx,
  input,
}: InferProcedureOpts<typeof baseProcedure>) {
  await ctx.assertSufficientGroupPermissions({
    userId: ctx.userId,
    groupId: input.groupId,
    permission: 'viewGroupPages',
  });

  let query = db
    .selectFrom('pages')
    .where('group_id', '=', input.groupId)
    .select('id');

  if (input.lastPageId != null) {
    const lastDate = await db
      .selectFrom('pages')
      .where('id', '=', input.lastPageId)
      .select('last_activity_date')
      .executeTakeFirst();
    if (lastDate?.last_activity_date != null) {
      query = query.where(
        'last_activity_date',
        '<',
        lastDate.last_activity_date,
      );
    }
  }

  const pages = await query
    .orderBy('last_activity_date', 'desc')
    .limit(21)
    .execute();

  const hasMore = pages.length > 20;
  const pageIds = hasMore ? pages.slice(0, 20).map((p) => p.id) : pages.map((p) => p.id);

  return { pageIds, hasMore };
}
