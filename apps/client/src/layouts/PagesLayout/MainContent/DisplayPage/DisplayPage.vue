<template>
  <div
    class="display-page"
    :class="{ 'readonly-page': page.react.readOnly }"
    :data-page-id="page.id"
  >
    <DisplayScreens />

    <DOMDisplay
      :region="page"
      class="display-overlay"
      style="text-align: center"
      :data-page-id="page.id"
    />

    <LoadingOverlay v-if="page.react.loading || page.react.status == null" />
  </div>
</template>

<script setup lang="ts">
import { DataLayer } from '@stdlib/crypto';
import { useRealtimeContext } from 'src/code/areas/realtime/context';
import { groupContentKeyrings } from 'src/code/pages/computed/group-content-keyrings';
import { pageGroupIds } from 'src/code/pages/computed/page-group-id';
import { pageKeyrings } from 'src/code/pages/computed/page-keyrings';
import type { Page } from 'src/code/pages/page/page';

import DisplayScreens from './DisplayScreens/DisplayScreens.vue';
import DOMDisplay from './DisplayScreens/DisplayWorld/DOMDisplay.vue';

const props = defineProps<{
  page: Page;
}>();

provide('page', props.page);

const componentLogger = mainLogger.sub('DisplayPage').sub(props.page.id);

const realtimeCtx = useRealtimeContext();

function getPageWatchDeps(pageId: string, groupId: string | null) {
  const pageIsDeleted = !!realtimeCtx.hget(
    'page',
    pageId,
    'permanent-deletion-date',
  );
  const pageIsPermanentlyDeleted = pageIsDeleted
    ? new Date() > realtimeCtx.hget('page', pageId, 'permanent-deletion-date')
    : false;

  const groupIsDeleted =
    groupId == null
      ? false
      : !!realtimeCtx.hget('group', groupId, 'permanent-deletion-date');
  const groupIsPermanentlyDeleted =
    groupId == null || groupIsDeleted === false
      ? false
      : new Date() >
        realtimeCtx.hget('group', groupId, 'permanent-deletion-date');

  const groupIsPublic =
    groupId == null ? false : realtimeCtx.hget('group', groupId, 'is-public');
  const groupJoinRequestRejected =
    groupId == null || authStore().userId == null
      ? false
      : realtimeCtx.hget(
          'group-join-request',
          `${groupId}:${authStore().userId}`,
          'rejected',
        );
  const groupJoinInvitationExists =
    groupId == null || authStore().userId == null
      ? false
      : !!realtimeCtx.hget(
          'group-join-invitation',
          `${groupId}:${authStore().userId}`,
          'exists',
        );
  const groupMemberRole =
    groupId == null || authStore().userId == null
      ? null
      : realtimeCtx.hget(
          'group-member',
          `${groupId}:${authStore().userId}`,
          'role',
        );
  const groupContentKeyring =
    groupId == null ? null : groupContentKeyrings()(groupId).get();
  const pageKeyring =
    groupId == null ? null : pageKeyrings()(`${groupId}:${pageId}`).get();

  return {
    groupId,
    pageIsDeleted,
    pageIsPermanentlyDeleted,
    groupIsDeleted,
    groupIsPermanentlyDeleted,
    groupIsPublic,
    groupJoinRequestRejected,
    groupJoinInvitationExists,
    groupMemberRole,
    groupContentKeyring,
    pageKeyring,
  };
}

function applyPageStatusFromDeps(
  page: Page,
  deps: ReturnType<typeof getPageWatchDeps>,
) {
  if (
    deps.groupId == null ||
    deps.pageIsPermanentlyDeleted ||
    deps.groupIsPermanentlyDeleted
  ) {
    page.setStatus('page-nonexistent');
    return;
  }
  if (deps.groupIsDeleted) {
    page.setStatus('group-deleted');
    return;
  }
  if (deps.pageIsDeleted) {
    page.setStatus('page-deleted');
    return;
  }
  if (deps.groupJoinRequestRejected) {
    page.setStatus('rejected');
    return;
  }
  if (deps.groupJoinInvitationExists) {
    page.setStatus('invited');
    return;
  }
  if (!deps.groupIsPublic && deps.groupMemberRole == null) {
    page.setStatus('unauthorized');
    return;
  }
  if (deps.groupContentKeyring?.topLayer === DataLayer.Symmetric) {
    page.setStatus('password');
    return;
  }
  if (deps.pageKeyring?.topLayer === DataLayer.Raw) {
    page
      .finishSetup()
      .catch((err) => componentLogger.error('finishSetup failed:', err));
  }
}

watchEffect(() => {
  // Subscribe to required values

  componentLogger.info('Subscribing to required values');

  const groupId = pageGroupIds()(props.page.id).get();
  const deps = getPageWatchDeps(props.page.id, groupId);

  // Skip on page keyring change

  realtimeCtx.hget('page', props.page.id, 'encrypted-symmetric-keyring');

  componentLogger.info('Changed values: %o', realtimeCtx.changed);

  if (
    realtimeCtx.changed.size === 1 &&
    realtimeCtx.changed.has(`page:${props.page.id}>encrypted-symmetric-keyring`)
  ) {
    return;
  }

  props.page.setStatus(undefined, true);

  props.page.collab.websocket.disconnect();

  componentLogger.info('Checking if all required values arrived');

  if (realtimeCtx.loading) {
    componentLogger.info('Missing required values: %o', realtimeCtx.pending);
    return;
  }

  componentLogger.info("Checking if page doesn't exist");

  applyPageStatusFromDeps(props.page, deps);
});
</script>

<style lang="scss" scoped>
.display-page {
  position: absolute;

  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  isolation: isolate;

  :deep() {
    a {
      text-decoration: none;

      color: unset;

      outline: none;
    }

    * {
      touch-action: none;
    }
  }
}
</style>
