<template>
  <v-navigation-drawer
    :model-value="uiStore().leftSidebarExpanded"
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

    <CurrentPath />

    <RecentPages />

    <FavoritePages />

    <SelectedPages />
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
