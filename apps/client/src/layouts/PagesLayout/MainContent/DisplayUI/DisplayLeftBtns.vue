<template>
  <div class="display-navigation-btns">
    <DisplayBtn
      icon="mdi-arrow-up"
      size="12px"
      :btn-size="30"
      :disable="
        internals.pages.react.pageId === internals.pages.react.pathPageIds[0]
      "
      @click="internals.pages.goBackward()"
    >
      <q-tooltip
        anchor="center right"
        self="center left"
        transition-show="jump-right"
        transition-hide="jump-left"
      >
        Go backward
      </q-tooltip>
    </DisplayBtn>

    <Gap style="height: 6px" />

    <DisplayBtn
      icon="mdi-arrow-down"
      size="12px"
      :btn-size="30"
      :disable="
        internals.pages.react.pageId ===
        internals.pages.react.pathPageIds.at(-1)
      "
      @click="internals.pages.goForward()"
    >
      <q-tooltip
        anchor="center right"
        self="center left"
        transition-show="jump-right"
        transition-hide="jump-left"
      >
        Go forward
      </q-tooltip>
    </DisplayBtn>

    <Gap style="height: 16px" />

    <DisplayBtn
      icon="mdi-camera-outline"
      size="11px"
      :btn-size="34"
      @click="$q.dialog({ component: TakeScreenshotDialog })"
    >
      <q-tooltip
        anchor="center right"
        self="center left"
        transition-show="jump-right"
        transition-hide="jump-left"
      >
        Take screenshot
      </q-tooltip>
    </DisplayBtn>

    <Gap style="height: 16px" />

    <DisplayBtn
      icon="mdi-find-replace"
      size="11px"
      :btn-size="34"
      @click="
        () => {
          page.findAndReplace.react.active = !page.findAndReplace.react.active;
          page.findAndReplace.react.replace = true;
        }
      "
    >
      <q-tooltip
        anchor="center right"
        self="center left"
        transition-show="jump-right"
        transition-hide="jump-left"
      >
        Find and replace
      </q-tooltip>
    </DisplayBtn>

    <Gap style="height: 16px" />

    <DisplayBtn
      icon="mdi-export-variant"
      size="11px"
      :btn-size="34"
      @click="exportCurrentPage()"
    >
      <q-tooltip
        anchor="center right"
        self="center left"
        transition-show="jump-right"
        transition-hide="jump-left"
      >
        Export for AI
      </q-tooltip>
    </DisplayBtn>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { exportPageToMarkdown } from 'src/code/pages/export/export-markdown';

import TakeScreenshotDialog from '../../MainToolbar/TakeScreenshotDialog.vue';
import ExportMarkdownDialog from './ExportMarkdownDialog.vue';

const $q = useQuasar();
const page = computed(() => internals.pages.react.page);

function exportCurrentPage() {
  const currentPage = internals.pages.react.page;
  if (!currentPage) return;
  const markdown = exportPageToMarkdown(currentPage);
  $q.dialog({
    component: ExportMarkdownDialog,
    componentProps: { markdown },
  });
}
</script>

<style lang="scss" scoped>
.display-navigation-btns {
  pointer-events: auto;
  position: absolute;

  left: $sp-3;
  top: 55px;

  display: flex;
  flex-direction: column;
}
</style>
