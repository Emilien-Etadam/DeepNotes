<template>
  <div class="section-root">
    <div class="section-header">
      <v-avatar
        size="32"
        style="margin-top: -1px; margin-left: -8px"
      >
        <v-icon
          icon="mdi-history"
          size="20"
        />
      </v-avatar>

      <span class="section-title">Recent pages</span>

    <v-btn
      icon
      variant="text"
      size="small"
      style="
        position: absolute;
        right: 4px;
        width: 32px;
        height: 32px;
        min-height: 0;
      "
    >
      <v-icon icon="mdi-dots-vertical" />
      <v-menu
        activator="parent"
        :close-on-content-click="true"
      >
        <v-list density="compact">
          <v-list-item
            prepend-icon="mdi-close"
            title="Clear recent pages"
            :disabled="recentPageIds.length === 0"
            link
            @click="clearRecentPages"
          />
        </v-list>
      </v-menu>
    </v-btn>
    </div>

    <div class="section-list">
    <v-list-item
      v-if="recentPageIds.length === 0"
      title="No recent pages."
      style="color: rgba(255, 255, 255, 0.7); font-size: 13.5px"
    />

    <div
      v-for="pageId in recentPageIds"
      :key="pageId"
      class="recent-page"
    >
      <PageItem
        icon
        :page-id="pageId"
        :active="pageId === internals.pages.react.pageId"
        prefer="absolute"
        style="padding-right: 8px"
      >
        <template #append>
          <PagePopupOptions :page-id="pageId" />
        </template>
      </PageItem>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRealtimeContext } from 'src/code/areas/realtime/context';
import { asyncDialog, handleError } from 'src/code/utils/misc';
import PagePopupOptions from 'src/components/PagePopupOptions.vue';

const realtimeCtx = useRealtimeContext();

const recentPageIds = computed(() =>
  internals.pages.react.recentPageIds.filter((pageId) =>
    realtimeCtx.hget('page', pageId, 'exists'),
  ),
);

async function clearRecentPages() {
  try {
    await asyncDialog({
      title: 'Clear recent pages',
      message: 'Are you sure you want to clear recent pages?',

      focus: 'cancel',

      cancel: { label: 'No', flat: true, color: 'primary' },
      ok: { label: 'Yes', flat: true, color: 'negative' },
    });

    await trpcClient.users.pages.clearRecentPages.mutate();

    internals.pages.recentPageIdsKeepOverride = true;
    internals.pages.react.recentPageIdsOverride = [];
  } catch (error) {
    handleError(error);
  }
}
</script>

<style scoped lang="scss">
.section-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background-color: #141414;
}

.section-header {
  min-height: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  position: relative;
}

.section-title {
  margin-left: -2px;
  text-align: left;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 600;
}

.section-list {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
