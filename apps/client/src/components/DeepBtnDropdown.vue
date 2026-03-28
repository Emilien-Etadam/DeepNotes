<template>
  <div class="d-inline-block">
    <v-btn
      v-bind="btnAttrs"
      :loading="loading"
      @click="(e: MouseEvent) => onClick([e], { ...props, ...attrs })"
    >
      <slot name="label" />
      <v-icon
        v-if="!$slots.label"
        end
        icon="mdi-menu-down"
      />
      <v-menu activator="parent">
        <slot />
      </v-menu>
    </v-btn>
  </div>
</template>

<script lang="ts">
import type { DeepBtnBaseProps } from './useDeepBtnBase';

export default {
  inheritAttrs: false,
};

export interface DeepBtnDropdownProps extends DeepBtnBaseProps {}
</script>

<script setup lang="ts">
import { useDeepBtnBase } from './useDeepBtnBase';

const props = defineProps<DeepBtnDropdownProps>();
const attrs = useAttrs();

const { loading, onClick } = useDeepBtnBase(props);

const btnAttrs = computed(() => {
  const merged = { ...props, ...attrs } as Record<string, unknown>;
  const {
    delay: _delay,
    flat,
    outline,
    dense,
    round,
    noCaps: _noCaps,
    disable,
    onClick: _onClick,
    ...rest
  } = merged;

  const out: Record<string, unknown> = { ...rest };

  if (flat) {
    out.variant = 'text';
  } else if (outline) {
    out.variant = 'outlined';
  }

  if (dense) {
    out.density = 'compact';
  }

  if (disable) {
    out.disabled = true;
  }

  if (round) {
    out.rounded = 'circle';
  }

  if (out.color === 'positive') {
    out.color = 'success';
  } else if (out.color === 'negative') {
    out.color = 'error';
  }

  if (out.size === 'sm') {
    out.size = 'small';
  }

  return out;
});
</script>

<style scoped lang="scss">
.v-btn:not(.v-btn--icon) {
  border-radius: $radius-md;
}

.v-btn.bg-secondary {
  background-color: transparent !important;

  border: 1px solid $border-subtle;
}

.v-btn.bg-negative {
  background-color: transparent !important;

  border: 1px solid rgb(110, 54, 48);

  color: $color-error !important;
}
</style>

<style>
.v-btn {
  text-transform: none;
}
</style>
