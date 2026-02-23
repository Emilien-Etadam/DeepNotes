<template>
  <DeepBtn
    v-bind="$attrs"
    :style="{
      'min-width': `${btnSize}px`,
      'min-height': `${btnSize + 2}px`,

      width: `${btnSize}px`,
      height: `${btnSize + 2}px`,
    }"
    :icon="icon"
    color="grey-9"
    dense
    class="display-btn"
  >
    <slot></slot>

    <q-tooltip
      v-if="tooltip != null"
      anchor="top middle"
      self="bottom middle"
      transition-show="jump-down"
      transition-hide="jump-up"
    >
      {{ tooltip }}
    </q-tooltip>
  </DeepBtn>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
interface Props {
  icon: string;
  tooltip?: string;
  btnSize?: number;
}

withDefaults(defineProps<Props>(), {
  btnSize: 36,
});
</script>

<style scoped lang="scss">
.display-btn {
  padding: 0;

  pointer-events: auto;
}
</style>
