<template>
  <a
    :href="appPageUrl(pageId)"
    @click.prevent.stop
  >
    <v-list-item
      v-bind="$attrs"
      :data-page-id="pageId"
      link
      active-class="bg-grey-darken-4"
      @click="
        internals.pages.goToPage(pageId, {
          openInNewTab: isCtrlDown($event as MouseEvent),
        })
      "
    >
      <PageItemContent
        :icon="icon"
        :page-id="pageId"
        :prefer="prefer"
      />

      <slot></slot>

      <template
        v-if="$slots.append"
        #append
      >
        <slot name="append"></slot>
      </template>
    </v-list-item>
  </a>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { appPageUrl } from 'src/code/utils/app-url';
import { isCtrlDown } from 'src/code/utils/misc';

defineProps<{
  icon: boolean;
  pageId: string;
  prefer: 'relative' | 'absolute';
}>();
</script>
