import type { Generated, Selectable } from 'kysely';

/** Legacy: plan column kept for DB compatibility, no longer used for access control */
type Plan = 'basic' | 'pro';

/** GroupRoleID from @deeplib/misc */
type GroupRoleID = 'owner' | 'admin' | 'moderator' | 'member' | 'viewer';

/** PageSnapshotType from @deeplib/misc */
type PageSnapshotType = 'periodic' | 'manual' | 'pre-restore';

/** bytea columns: node-pg returns Buffer */
type Bytea = Buffer;

export interface Database {
  users: UsersTable;
  groups: GroupsTable;
  pages: PagesTable;
  group_members: GroupMembersTable;
  group_join_invitations: GroupJoinInvitationsTable;
  group_join_requests: GroupJoinRequestsTable;
  notifications: NotificationsTable;
  users_notifications: UsersNotificationsTable;
  page_links: PageLinksTable;
  page_snapshots: PageSnapshotsTable;
  page_updates: PageUpdatesTable;
  users_pages: UsersPagesTable;
  sessions: SessionsTable;
  devices: DevicesTable;
}

export interface UsersTable {
  id: string;
  encrypted_email: Bytea;
  email_hash: Bytea;
  email_verified: boolean;
  encrypted_rehashed_login_hash: Bytea;
  encrypted_new_email: Bytea | null;
  email_verification_code: string | null;
  email_verification_expiration_date: Date | null;
  two_factor_auth_enabled: boolean;
  encrypted_authenticator_secret: Bytea | null;
  encrypted_recovery_codes: Bytea | null;
  personal_group_id: string;
  public_keyring: Bytea;
  encrypted_private_keyring: Bytea;
  encrypted_symmetric_keyring: Bytea;
  encrypted_name: Bytea;
  encrypted_default_note: Bytea;
  encrypted_default_arrow: Bytea;
  starting_page_id: string;
  recent_page_ids: string[];
  recent_group_ids: string[];
  favorite_page_ids: string[];
  customer_id: string | null;
  plan: Plan;
  subscription_id: string | null;
  last_notification_read: number | null;
  num_free_pages: number;
  demo: boolean;
  creation_date: Date;
  new: boolean;
}

export interface GroupsTable {
  id: string;
  encrypted_name: Bytea;
  main_page_id: string;
  user_id: string | null;
  encrypted_rehashed_password_hash: Bytea | null;
  access_keyring: Bytea | null;
  encrypted_content_keyring: Bytea;
  public_keyring: Bytea;
  encrypted_private_keyring: Bytea;
  permanent_deletion_date: Date | null;
  are_join_requests_allowed: boolean;
}

export interface PagesTable {
  id: string;
  encrypted_relative_title: Bytea;
  encrypted_absolute_title: Bytea;
  group_id: string;
  creation_date: Date;
  last_activity_date: Date;
  encrypted_symmetric_keyring: Bytea;
  free: boolean;
  next_snapshot_date: Date;
  next_snapshot_update_index: number;
  next_key_rotation_date: Date;
  permanent_deletion_date: Date | null;
}

export interface GroupMembersTable {
  group_id: string;
  user_id: string;
  role: GroupRoleID;
  encrypted_access_keyring: Bytea | null;
  encrypted_internal_keyring: Bytea;
  encrypted_name: Bytea | null;
  last_activity_date: Date;
}

export interface GroupJoinInvitationsTable {
  group_id: string;
  user_id: string;
  inviter_id: string;
  role: GroupRoleID;
  encrypted_access_keyring: Bytea | null;
  encrypted_internal_keyring: Bytea;
  encrypted_name: Bytea;
  encrypted_name_for_user: Bytea;
  creation_date: Date;
}

export interface GroupJoinRequestsTable {
  group_id: string;
  user_id: string;
  encrypted_name: Bytea;
  encrypted_name_for_user: Bytea;
  rejected: boolean;
  creation_date: Date;
}

export interface NotificationsTable {
  id: Generated<number>;
  type: string;
  encrypted_content: Bytea;
  datetime: Date;
}

export interface UsersNotificationsTable {
  user_id: string;
  notification_id: number;
  encrypted_symmetric_key: Bytea;
}

export interface PageLinksTable {
  target_page_id: string;
  source_page_id: string;
  last_activity_date: Date;
}

export interface PageSnapshotsTable {
  id: string;
  page_id: string;
  creation_date: Date;
  author_id: string;
  encrypted_symmetric_key: Bytea;
  encrypted_data: Bytea;
  type: PageSnapshotType;
}

export interface PageUpdatesTable {
  page_id: string;
  index: number;
  encrypted_data: Bytea;
}

export interface UsersPagesTable {
  user_id: string;
  page_id: string;
  last_parent_id: string | null;
}

export interface SessionsTable {
  id: string;
  user_id: string;
  device_id: string;
  encryption_key: Bytea;
  refresh_code: string;
  invalidated: boolean;
  creation_date: Date;
  last_refresh_date: Date;
  expiration_date: Date;
}

export interface DevicesTable {
  id: string;
  user_id: string;
  hash: Bytea;
  trusted: boolean;
}

// Selectable row types (for use as model types)
export type UserRow = Selectable<UsersTable>;
export type GroupRow = Selectable<GroupsTable>;
export type PageRow = Selectable<PagesTable>;
export type GroupMemberRow = Selectable<GroupMembersTable>;
export type GroupJoinInvitationRow = Selectable<GroupJoinInvitationsTable>;
export type GroupJoinRequestRow = Selectable<GroupJoinRequestsTable>;
export type NotificationRow = Selectable<NotificationsTable>;
export type UserNotificationRow = Selectable<UsersNotificationsTable>;
export type PageLinkRow = Selectable<PageLinksTable>;
export type PageSnapshotRow = Selectable<PageSnapshotsTable>;
export type PageUpdateRow = Selectable<PageUpdatesTable>;
export type UserPageRow = Selectable<UsersPagesTable>;
export type SessionRow = Selectable<SessionsTable>;
export type DeviceRow = Selectable<DevicesTable>;
