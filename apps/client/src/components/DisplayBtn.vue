<template>
  <DeepBtn
    v-bind="btnAttrs"
    :style="{
      'min-width': `${btnSize}px`,
      'min-height': `${btnSize + 2}px`,

      width: `${btnSize}px`,
      height: `${btnSize + 2}px`,
    }"
    color="grey-9"
    dense
    class="display-btn"
  >
    <v-icon
      :icon="icon"
      :size="iconSize"
    />

    <slot></slot>

    <v-tooltip
      v-if="tooltip != null"
      activator="parent"
      location="top"
    >
      {{ tooltip }}
    </v-tooltip>
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

const attrs = useAttrs();

const iconSize = computed(() => {
  const size = attrs.size;
  if (typeof size === 'string') {
    return size;
  }
  if (typeof size === 'number') {
    return `${size}px`;
  }
  return '18px';
});

const btnAttrs = computed(() => {
  const {
    size: _size,
    ...rest
  } = attrs as Record<string, unknown>;
  return rest;
});
</script>

<style scoped lang="scss">
.display-btn {
  padding: 0;

  pointer-events: auto;
}
</style>
