import { once } from 'lodash';
import { type InferProcedureOpts, authProcedure } from 'src/trpc/helpers';
import { db } from 'src/data/knex';

const baseProcedure = authProcedure;

export const getGroupIdsProcedure = once(() =>
  baseProcedure.query(getGroupIds),
);

export async function getGroupIds({
  ctx,
}: InferProcedureOpts<typeof baseProcedure>) {
  const rows = await db
    .selectFrom('group_members')
    .where('user_id', '=', ctx.userId)
    .select('group_id')
    .orderBy('last_activity_date', 'desc')
    .execute();
  return rows.map((row) => row.group_id);
}
