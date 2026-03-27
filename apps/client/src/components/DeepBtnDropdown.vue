<template>
  <q-btn-dropdown
    :loading="loading"
    v-bind="{
      ...$attrs,

      onClick: (...args) => onClick(args, $attrs),
    }"
  >
    <slot></slot>

    <template #label>
      <slot name="label"></slot>
    </template>
  </q-btn-dropdown>
</template>

<script lang="ts">
import type { QBtnDropdownProps } from 'quasar';

import type { DeepBtnBaseProps } from './useDeepBtnBase';

export default {
  inheritAttrs: false,
};

export interface DeepBtnProps extends QBtnDropdownProps, DeepBtnBaseProps {}
</script>

<script setup lang="ts">
import { useDeepBtnBase } from './useDeepBtnBase';

const props = defineProps<DeepBtnProps>();

const { loading, onClick } = useDeepBtnBase(props);
</script>
