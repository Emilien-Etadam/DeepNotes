import type { DataHash } from '@stdlib/data';

type GroupJoinEntityType = 'invitation' | 'request';

type CreateGroupJoinDataHashInput<TRow> = {
  entityType: GroupJoinEntityType;
  fields: Record<string, unknown>;
  validateDataHash: (options: any) => unknown;
  splitStr: (value: string, separator: string, limit: number) => string[];
};

const TABLE_BY_ENTITY_TYPE: Record<GroupJoinEntityType, string> = {
  invitation: 'group_join_invitations',
  request: 'group_join_requests',
};

export function createGroupJoinDataHash<TRow>({
  entityType,
  fields,
  validateDataHash,
  splitStr,
}: CreateGroupJoinDataHashInput<TRow>) {
  const table = TABLE_BY_ENTITY_TYPE[entityType];

  return validateDataHash({
    table,
    idColumns: ['group_id', 'user_id'],

    get: async ({ suffix, columns, executor }: any) => {
      const [group_id, user_id] = splitStr(suffix, ':', 2);
      const q = executor
        .selectFrom(table)
        .where('group_id', '=', group_id)
        .where('user_id', '=', user_id);
      return (columns?.length ? q.select(columns) : q.selectAll()).executeTakeFirst();
    },
    set: async ({ suffix, model, executor }: any) => {
      const [group_id, user_id] = splitStr(suffix, ':', 2);
      return executor
        .updateTable(table)
        .set(model)
        .where('group_id', '=', group_id)
        .where('user_id', '=', user_id)
        .executeTakeFirst();
    },

    fields,
  }) as DataHash<TRow, any>;
}
