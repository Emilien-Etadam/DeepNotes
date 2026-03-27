import { createGroupMemberNames } from './group-member-names-factory';

export const groupInvitationNames = createGroupMemberNames({
  dataKey: 'group-join-invitation',
  entityType: 'invitation',
});
