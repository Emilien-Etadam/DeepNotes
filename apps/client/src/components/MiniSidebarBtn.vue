<template>
  <v-list-item
    link
    :active="active"
    :disabled="disable"
    v-bind="{
      ...$attrs,

      onClick: (...args) => onClick(args, $attrs),
    }"
  >
    <template #prepend>
      <v-progress-circular
        v-if="loading"
        indeterminate
        size="20"
        style="margin-left: 2px"
      />

      <v-icon
        v-else
        :icon="icon"
      />
    </template>

    <v-tooltip
      activator="parent"
      location="start"
      :offset="10"
      max-width="200px"
    >
      {{ tooltip }}
    </v-tooltip>

    <slot></slot>
  </v-list-item>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};

export interface MiniSidebarBtnProps {
  delay?: boolean;
  active?: boolean;
  icon: string;
  tooltip: string;
  disable?: boolean;
}
</script>

<script setup lang="ts">
import { sleep } from '@stdlib/misc';

const props = defineProps<MiniSidebarBtnProps>();

const loading = ref(false);

async function onClick(args: any[], attrs: any) {
  if (attrs.onClick == null) {
    return;
  }

  args[0].preventDefault();

  loading.value = true;

  if (props.delay) {
    await sleep(500);
  }

  try {
    await attrs.onClick(...args);
  } catch (error) {
    mainLogger.error(error);
  }

  loading.value = false;
}
</script>
