<template>
  <DeepBtn
    icon="mdi-dots-vertical"
    round
    flat
    style="min-width: 0; min-height: 0; width: 32px; height: 32px"
    @click.stop
  >
    <v-menu
      v-bind="menuProps"
      activator="parent"
      :close-on-content-click="true"
      @update:model-value="onMenuModelValue"
    >
      <v-list density="compact">
        <v-list-item
          v-if="internals.pages.react.recentPageIds.includes(pageId)"
          link
          prepend-icon="mdi-trash-can"
          title="Remove from recent pages"
          @click="removeRecentPages([pageId])"
        />

        <v-list-item
          v-if="pageFavorited"
          link
          prepend-icon="mdi-star"
          title="Remove from favorite pages"
          @click="removeFavoritePages([pageId])"
        />
        <v-list-item
          v-else
          link
          prepend-icon="mdi-star"
          title="Add to favorite pages"
          @click="addFavoritePages([pageId])"
        />

        <v-list-item
          v-if="pageSelected"
          link
          prepend-icon="mdi-selection-multiple"
          title="Remove from selected pages"
          @click="deselectPage"
        />
        <v-list-item
          v-else
          link
          prepend-icon="mdi-selection-multiple"
          title="Add to selected pages"
          @click="selectPage"
        />

        <slot></slot>
      </v-list>
    </v-menu>
  </DeepBtn>
</template>

<script setup lang="ts">
import { addFavoritePages } from 'src/code/areas/api-interface/users/add-favorite-pages';
import { removeFavoritePages } from 'src/code/areas/api-interface/users/remove-favorite-pages';
import { removeRecentPages } from 'src/code/areas/api-interface/users/remove-recent-pages';
import { pageSelectionStore } from 'src/stores/page-selection';

import type { DeepBtnProps } from './DeepBtn.vue';

interface Props extends DeepBtnProps {
  pageId: string;

  menuProps?: Record<string, unknown>;
}

const props = defineProps<Props>();

const pageFavorited = ref(false);
const pageSelected = ref(false);

function beforeShow() {
  pageFavorited.value = internals.pages.react.favoritePageIds.includes(
    props.pageId,
  );
  pageSelected.value = pageSelectionStore().selectedPages.has(props.pageId);
}

function onMenuModelValue(open: boolean) {
  if (open) {
    beforeShow();
  }
}

function selectPage() {
  pageSelectionStore().selectedPages.add(props.pageId);

  showNotify({
    message: 'Page added to selection.',
    color: 'positive',
    timeout: 1000,
  });
}

function deselectPage() {
  pageSelectionStore().selectedPages.delete(props.pageId);

  showNotify({
    message: 'Page removed from selection.',
    color: 'negative',
    timeout: 1000,
  });
}
</script>
