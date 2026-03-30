<script setup lang="ts">
import type { Component } from 'vue';

const props = defineProps<{
  layerId: number;
  dialogComponent: Component;
  dialogProps?: Record<string, unknown>;
}>();

provide("programmaticDialogLayerId", props.layerId);
</script>

<template>
  <component
    :is="props.dialogComponent"
    v-bind="props.dialogProps ?? {}"
    :auto-open="true"
  />
</template>
