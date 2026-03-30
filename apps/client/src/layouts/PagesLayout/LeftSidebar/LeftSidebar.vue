<template>
  <v-navigation-drawer
    :model-value="uiStore().leftSidebarExpanded"
    app
    location="start"
    :width="uiStore().leftSidebarWidth"
    style="display: flex; flex-direction: column"
    class="left-sidebar-drawer"
    @update:model-value="(v: boolean) => (uiStore().leftSidebarExpanded = v)"
  >
    <div
      class="resize-handle"
      @pointerdown="resizeLeftSidebar"
      @dblclick="() => uiStore().resetLeftSidebarWidth()"
    ></div>

    <div class="sections-container">
      <div class="section-panel">
        <CurrentPath />
      </div>
      <v-divider style="border-color: rgba(255, 255, 255, 0.15)" />

      <div class="section-panel">
        <RecentPages />
      </div>
      <v-divider style="border-color: rgba(255, 255, 255, 0.15)" />

      <div class="section-panel">
        <FavoritePages />
      </div>
      <v-divider style="border-color: rgba(255, 255, 255, 0.15)" />

      <div class="section-panel">
        <SelectedPages />
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { listenPointerEvents } from '@stdlib/misc';

import CurrentPath from './CurrentPath.vue';
import FavoritePages from './FavoritePages.vue';
import RecentPages from './RecentPages.vue';
import SelectedPages from './SelectedPages.vue';

function resizeLeftSidebar(event: PointerEvent) {
  listenPointerEvents(event, {
    move(event) {
      uiStore().leftSidebarWidth = event.clientX;
    },
  });
}
</script>

<style scoped lang="scss">
.left-sidebar-drawer {
  background-color: $bg-sidebar;

  border-right: 1px solid $border-subtle !important;
}

.left-sidebar-drawer :deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.sections-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.section-panel {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  right: -10px;
  left: calc(100% + 1px);
  cursor: ew-resize;
  z-index: 2147483647;

  opacity: 0;
  background-color: white;

  transition: opacity 0.2s;
}
.resize-handle:hover {
  opacity: 0.4;
}
</style>
