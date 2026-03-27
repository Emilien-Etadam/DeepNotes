<template>
  <q-toolbar
    style="
      padding: 0;
      background-color: #141414;
      min-height: 0;
      overflow: hidden;
    "
  >
    <DeepBtn
      flat
      style="width: 100%; height: 32px; min-height: 0; border-radius: 0"
      no-caps
      @click="negateProp(uiStore(), 'selectedPagesExpanded')"
    >
      <div style="width: 100%; height: 0; display: flex; align-items: center">
        <q-avatar style="margin-top: -1px; margin-left: -8px">
          <q-icon
            name="mdi-selection-multiple"
            size="20px"
          />
        </q-avatar>

        <q-toolbar-title
          style="
            margin-left: -2px;
            text-align: left;
            color: rgba(255, 255, 255, 0.85);
            font-size: 13.5px;
          "
        >
          Selected pages
        </q-toolbar-title>
      </div>
    </DeepBtn>

    <q-btn
      icon="mdi-menu"
      style="
        position: absolute;
        right: 4px;
        width: 32px;
        height: 32px;
        min-height: 0;
      "
    >
      <q-menu auto-close>
        <q-list>
          <q-item
            clickable
            @click="movePages"
            :disable="pageSelectionStore().selectedPages.size === 0"
          >
            <q-item-section avatar>
              <q-icon name="mdi-file-move" />
            </q-item-section>

            <q-item-section>
              <q-item-label>Move selection</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            @click="deletePages"
            :disable="pageSelectionStore().selectedPages.size === 0"
          >
            <q-item-section avatar>
              <q-icon name="mdi-trash-can" />
            </q-item-section>

            <q-item-section>
              <q-item-label>Delete selection</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            clickable
            @click="pageSelectionStore().selectedPages.clear()"
            :disable="pageSelectionStore().selectedPages.size === 0"
          >
            <q-item-section avatar>
              <q-icon name="mdi-selection-remove" />
            </q-item-section>

            <q-item-section>
              <q-item-label>Clear selection</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </q-toolbar>

  <q-list
    :id="`${'selectedPages'}List`"
    style="height: 0; overflow-x: hidden; overflow-y: auto"
    :style="{
      flex: uiStore().selectedPagesExpanded
        ? uiStore().selectedPagesWeight
        : '0',
    }"
  >
    <q-item v-if="selectedPageIds.length === 0">
      <q-item-section>
        <q-item-label
          style="color: rgba(255, 255, 255, 0.7); font-size: 13.5px"
        >
          No pages selected.
        </q-item-label>
      </q-item-section>
    </q-item>

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
        <q-item-section side>
          <PagePopupOptions :page-id="pageId" />
        </q-item-section>
      </PageItem>
    </div>
  </q-list>
</template>

<script setup lang="ts">
import { negateProp } from '@stdlib/misc';
import { useRealtimeContext } from 'src/code/areas/realtime/context';
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
