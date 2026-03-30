<template>
  <div class="display-navigation-btns">
    <DisplayBtn
      icon="mdi-arrow-up"
      size="17px"
      :btn-size="28"
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
      size="17px"
      :btn-size="28"
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
      size="16px"
      :btn-size="28"
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
      size="16px"
      :btn-size="28"
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
      size="16px"
      :btn-size="28"
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

  left: calc(var(--v-layout-left, 0px) + #{$sp-3});
  top: 79px;

  display: flex;
  flex-direction: column;
}
</style>
