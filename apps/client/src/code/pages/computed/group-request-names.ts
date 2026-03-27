import { createGroupMemberNames } from './group-member-names-factory';

export const groupRequestNames = createGroupMemberNames({
  dataKey: 'group-join-request',
  entityType: 'request',
});
