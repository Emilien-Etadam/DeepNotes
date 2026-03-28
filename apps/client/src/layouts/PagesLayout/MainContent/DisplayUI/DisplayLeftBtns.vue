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
      <v-tooltip
        activator="parent"
        location="end"
      >
        Go backward
      </v-tooltip>
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
      <v-tooltip
        activator="parent"
        location="end"
      >
        Go forward
      </v-tooltip>
    </DisplayBtn>

    <Gap style="height: 16px" />

    <DisplayBtn
      icon="mdi-camera-outline"
      size="11px"
      :btn-size="34"
      @click="appDialog({ component: TakeScreenshotDialog })"
    >
      <v-tooltip
        activator="parent"
        location="end"
      >
        Take screenshot
      </v-tooltip>
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
      <v-tooltip
        activator="parent"
        location="end"
      >
        Find and replace
      </v-tooltip>
    </DisplayBtn>

    <Gap style="height: 16px" />

    <DisplayBtn
      icon="mdi-export-variant"
      size="11px"
      :btn-size="34"
      @click="exportCurrentPage()"
    >
      <v-tooltip
        activator="parent"
        location="end"
      >
        Export for AI
      </v-tooltip>
    </DisplayBtn>
  </div>
</template>

<script setup lang="ts">
import { exportPageToMarkdown } from 'src/code/pages/export/export-markdown';

import TakeScreenshotDialog from '../../MainToolbar/TakeScreenshotDialog.vue';
import ExportMarkdownDialog from './ExportMarkdownDialog.vue';

const page = computed(() => internals.pages.react.page);

function exportCurrentPage() {
  const currentPage = internals.pages.react.page;
  if (!currentPage) return;
  const markdown = exportPageToMarkdown(currentPage);
  appDialog({
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
