import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function patchMultiple(
  executor: Kysely<any>,
  table: string,
  columns: string[],
  types: string[],
  values: any[][],
  where: string,
  set: string,
) {
  if (values.length === 0) {
    return;
  }

  const built =
    sql`UPDATE ${sql.raw(table)} SET ${sql.raw(set)} FROM (VALUES ${sql.join(
      values.map((row) =>
        sql`(${sql.join(
          row.map((v, i) => sql`${v}::${sql.raw(types[i])}`),
          sql`, `,
        )})`,
      ),
      sql`, `,
    )}) AS values (${sql.raw(columns.join(', '))}) WHERE ${sql.raw(where)}`;

  await built.execute(executor);
}
