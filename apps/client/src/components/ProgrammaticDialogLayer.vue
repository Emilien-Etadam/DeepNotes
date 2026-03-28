<script setup lang="ts">
import type { Component, ComponentPublicInstance } from 'vue';

import { applyProgrammaticDialogShow } from 'src/code/utils/dialog-autoshow';

const props = defineProps<{
  layerId: number;
  dialogComponent: Component;
  dialogProps?: Record<string, unknown>;
}>();

provide('programmaticDialogLayerId', props.layerId);

const innerRef = ref<ComponentPublicInstance | null>(null);

async function tryShow() {
  await nextTick();
  applyProgrammaticDialogShow(innerRef.value);
}

onMounted(() => {
  void tryShow();
});

watch(
  () => props.layerId,
  () => {
    void tryShow();
  },
);
</script>

<template>
  <component
    ref="innerRef"
    :is="props.dialogComponent"
    v-bind="props.dialogProps ?? {}"
  />
</template>
