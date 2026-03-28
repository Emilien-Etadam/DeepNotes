<template>
  <div
    style="
      padding: 0;
      background-color: #141414;
      min-height: 0;
      overflow: hidden;
      display: flex;
      align-items: center;
      position: relative;
    "
  >
    <DeepBtn
      flat
      style="width: 100%; height: 32px; min-height: 0; border-radius: 0"
      no-caps
      @click="negateProp(uiStore(), 'selectedPagesExpanded')"
    >
      <div style="width: 100%; height: 0; display: flex; align-items: center">
        <v-avatar
          size="32"
          style="margin-top: -1px; margin-left: -8px"
        >
          <v-icon
            icon="mdi-selection-multiple"
            size="20"
          />
        </v-avatar>

        <span
          style="
            margin-left: -2px;
            text-align: left;
            color: rgba(255, 255, 255, 0.85);
            font-size: 13.5px;
          "
        >
          Selected pages
        </span>
      </div>
    </DeepBtn>

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
      <v-icon icon="mdi-menu" />
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

  <div
    :id="`${'selectedPages'}List`"
    style="height: 0; overflow-x: hidden; overflow-y: auto"
    :style="{
      flex: uiStore().selectedPagesExpanded
        ? uiStore().selectedPagesWeight
        : '0',
    }"
  >
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
</template>

<script setup lang="ts">
import { negateProp } from '@stdlib/misc';
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
