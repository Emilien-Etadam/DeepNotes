<template>
  <q-btn
    v-bind="{
      ...props,
      ...$attrs,
      onClick: (...args) => onClick(args, { ...props, ...$attrs }),
    }"
    :loading="loading"
  >
    <slot></slot>
  </q-btn>
</template>

<script lang="ts">
import type { QBtnProps } from 'quasar';

import type { DeepBtnBaseProps } from './useDeepBtnBase';

export default {
  inheritAttrs: false,
};

export interface DeepBtnProps extends QBtnProps, DeepBtnBaseProps {}
</script>

<script setup lang="ts">
import { useDeepBtnBase } from './useDeepBtnBase';

const props = defineProps<DeepBtnProps>();

const { loading, onClick } = useDeepBtnBase(props);
</script>

<style scoped lang="scss">
.q-btn:not(.q-btn--round) {
  border-radius: $radius-md;
}

.q-btn.bg-secondary {
  background-color: transparent !important;

  border: 1px solid $border-subtle;
}

.q-btn.bg-negative {
  background-color: transparent !important;

  border: 1px solid rgb(110, 54, 48);

  color: $color-error !important;
}
</style>

<style>
.q-btn {
  text-transform: none;
}
</style>
