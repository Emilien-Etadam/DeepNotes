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
      @click="negateProp(uiStore(), 'favoritePagesExpanded')"
    >
      <div style="width: 100%; height: 0; display: flex; align-items: center">
        <v-avatar
          size="32"
          style="margin-top: -1px; margin-left: -8px"
        >
          <v-icon
            icon="mdi-star"
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
          Favorite pages
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
            prepend-icon="mdi-close"
            title="Clear favorite pages"
            :disabled="favoritePageIds.length === 0"
            link
            @click="clearfavoritePages"
          />
        </v-list>
      </v-menu>
    </v-btn>
  </div>

  <div
    :id="`${sectionName}List`"
    ref="listRef"
    style="height: 0; overflow-x: hidden; overflow-y: auto"
    :style="{
      flex: uiStore().favoritePagesExpanded
        ? uiStore().favoritePagesWeight
        : '0',
    }"
  >
    <v-list-item
      v-if="favoritePageIds.length === 0"
      title="No favorite pages."
      style="color: rgba(255, 255, 255, 0.7); font-size: 13.5px"
    />

    <div
      v-for="pageId in favoritePageIds"
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

  <div
    style="position: relative"
    v-if="
      uiStore()[`${sectionName}Expanded`] &&
      leftSidebarSectionNames.reduce((acc, section, index) => {
        if (index > sectionIndex) {
          acc ||= uiStore()[`${section}Expanded`] ? true : false;
        }

        return acc;
      }, false)
    "
  >
    <div
      class="resize-handle"
      @pointerdown="resizeHandlePointerDown"
      @dblclick="resizeHandleDoubleClick"
    ></div>
  </div>

  <v-divider style="border-color: rgba(255, 255, 255, 0.15)" />
</template>

<script setup lang="ts">
import { listenPointerEvents, map, negateProp } from '@stdlib/misc';
import { useRealtimeContext } from 'src/code/areas/realtime/context';
import { asyncDialog, handleError } from 'src/code/utils/misc';
import PagePopupOptions from 'src/components/PagePopupOptions.vue';
import {
  leftSidebarSectionIndexes,
  type LeftSidebarSectionName,
  leftSidebarSectionNames,
} from 'src/stores/ui';
import type { ComponentPublicInstance } from 'vue';

const realtimeCtx = useRealtimeContext();

const favoritePageIds = computed(() =>
  internals.pages.react.favoritePageIds.filter((pageId) =>
    realtimeCtx.hget('page', pageId, 'exists'),
  ),
);

const listRef = ref<ComponentPublicInstance>();

const sectionName = 'favoritePages';
const sectionIndex = leftSidebarSectionIndexes[sectionName];

function resizeHandlePointerDown(downEvent: PointerEvent) {
  listenPointerEvents(downEvent, {
    move(moveEvent) {
      const clientRect = document
        .querySelector(`#${sectionName}List`)!
        .getBoundingClientRect();

      const othersHeight =
        uiStore().height -
        clientRect.height -
        32 * leftSidebarSectionNames.length -
        2;

      const othersWeight = leftSidebarSectionNames.reduce((acc, section) => {
        if (section !== sectionName) {
          acc += uiStore()[`${section}Expanded`]
            ? uiStore()[`${section}Weight`]
            : 0;
        }

        return acc;
      }, 0);

      const myNewHeight = moveEvent.clientY - clientRect.y;

      const myNewWeight = map(myNewHeight, 0, othersHeight, 0, othersWeight);

      const nextExpandedSection = leftSidebarSectionNames.reduce(
        (acc, section, index) => {
          if (index > sectionIndex) {
            acc ||= uiStore()[`${section}Expanded`] ? section : null;
          }

          return acc;
        },
        null as LeftSidebarSectionName | null,
      )!;

      uiStore()[`${nextExpandedSection}Weight`] -=
        myNewWeight - uiStore()[`${sectionName}Weight`];
      uiStore()[`${sectionName}Weight`] = myNewWeight;

      uiStore().normalizeWeights();
    },
  });
}

async function clearfavoritePages() {
  try {
    await asyncDialog({
      title: 'Clear favorite pages',
      message: 'Are you sure you want to clear favorite pages?',

      focus: 'cancel',

      cancel: { label: 'No', flat: true, color: 'primary' },
      ok: { label: 'Yes', flat: true, color: 'negative' },
    });

    await trpcClient.users.pages.clearFavoritePages.mutate();

    internals.pages.favoritePageIdsKeepOverride = true;
    internals.pages.react.favoritePageIdsOverride = [];
  } catch (error) {
    handleError(error);
  }
}

function resizeHandleDoubleClick() {
  const avgWeight =
    (uiStore()[`${sectionName}Weight`] +
      uiStore()[`${leftSidebarSectionNames[sectionIndex + 1]}Weight`]) /
    2;

  uiStore()[`${sectionName}Weight`] = avgWeight;
  uiStore()[`${leftSidebarSectionNames[sectionIndex + 1]}Weight`] = avgWeight;
}
</script>

<style scoped lang="scss">
.resize-handle {
  position: absolute;
  left: 0;
  top: -6px;
  right: 0;
  bottom: -6px;
  cursor: ns-resize;
  z-index: 2147483647;

  opacity: 0;
  background-color: white;

  transition: opacity 0.2s;
}
.resize-handle:hover {
  opacity: 0.4;
}
</style>
