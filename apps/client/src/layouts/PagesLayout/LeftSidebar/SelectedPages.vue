<template>
  <div class="section-root">
    <div class="section-header">
      <v-avatar
        size="32"
        style="margin-top: -1px; margin-left: -8px"
      >
        <v-icon
          icon="mdi-selection-multiple"
          size="20"
        />
      </v-avatar>

      <span class="section-title">Selected pages</span>

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
            prepend-icon="mdi-file-move"
            title="Move selection"
            :disabled="pageSelectionStore().selectedPages.size === 0"
            link
            @click="movePages"
          />

          <v-list-item
            prepend-icon="mdi-trash-can"
            title="Delete selection"
            :disabled="pageSelectionStore().selectedPages.size === 0"
            link
            @click="deletePages"
          />

          <v-list-item
            prepend-icon="mdi-selection-remove"
            title="Clear selection"
            :disabled="pageSelectionStore().selectedPages.size === 0"
            link
            @click="pageSelectionStore().selectedPages.clear()"
          />
        </v-list>
      </v-menu>
    </v-btn>
    </div>

    <div class="section-list">
    <v-list-item
      v-if="selectedPageIds.length === 0"
      title="No pages selected."
      style="color: rgba(255, 255, 255, 0.7); font-size: 13.5px"
    />

    <div
      v-for="pageId in selectedPageIds"
      :key="pageId"
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
import PagePopupOptions from 'src/components/PagePopupOptions.vue';
import { pageSelectionStore } from 'src/stores/page-selection';

import { usePageList } from '../usePageList';

const realtimeCtx = useRealtimeContext();

const selectedPageIds = computed(() =>
  Array.from(pageSelectionStore().selectedPages).filter((pageId) =>
    realtimeCtx.hget('page', pageId, 'exists'),
  ),
);

const { movePages, deletePages } = usePageList({
  getSelectedPageIds: () => selectedPageIds.value,
  getGroupId: () => internals.pages.react.page.react.groupId,
});
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

.selected-page {
  position: relative;

  > .remove-btn {
    position: absolute;

    top: 50%;
    right: -6px;

    transform: translate(-50%, -50%);

    min-width: 30px;
    min-height: 30px;
    width: 30px;
    height: 30px;

    opacity: 0;
    transition: opacity 0.2s;
  }
}

.selected-page:hover > .remove-btn {
  opacity: 1;
}
</style>
