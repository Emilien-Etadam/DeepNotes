<template>
  <v-btn
    v-bind="vuetifyAttrs"
    :prepend-icon="prependIcon"
    :icon="iconOnly"
    :loading="isLoading"
    @click="handleClick"
  >
    <v-icon
      v-if="leadingIconInSlot"
      :start="!props.round"
    >
      {{ leadingIconInSlot }}
    </v-icon>
    <slot>{{ label }}</slot>
  </v-btn>
</template>

<script lang="ts">
import type { DeepBtnBaseProps } from './useDeepBtnBase';

export default {
  inheritAttrs: false,
};

/** Props forwarded to `v-btn` (Quasar `q-btn` compatibility). */
export interface DeepBtnProps extends DeepBtnBaseProps {
  label?: string;
  icon?: string | boolean;
  color?: string;
  flat?: boolean;
  outline?: boolean;
  round?: boolean;
  dense?: boolean;
  disable?: boolean;
  loading?: boolean;
  type?: string;
  to?: string | Record<string, unknown>;
  href?: string;
  target?: string;
  replace?: boolean;
  size?: string;
  title?: string;
  class?: unknown;
  style?: unknown;
}
</script>

<script setup lang="ts">
import { useDeepBtnBase } from './useDeepBtnBase';

const props = defineProps<DeepBtnProps>();
const attrs = useAttrs();
const slots = useSlots();

const { loading: internalLoading, onClick } = useDeepBtnBase(props);

const isLoading = computed(
  () => internalLoading.value || Boolean(props.loading),
);

const prependIcon = computed(() => {
  if (typeof props.icon !== 'string') {
    return undefined;
  }
  if (props.round) {
    return undefined;
  }
  if (!props.label) {
    return undefined;
  }
  return props.icon;
});

const iconOnly = computed(() => {
  if (typeof props.icon !== 'string') {
    return undefined;
  }
  if (props.label) {
    return undefined;
  }
  if (props.round && slots.default?.().length) {
    return undefined;
  }
  return props.icon;
});

const leadingIconInSlot = computed(() => {
  if (typeof props.icon !== 'string') {
    return undefined;
  }
  if (prependIcon.value != null || iconOnly.value != null) {
    return undefined;
  }
  if (!props.round) {
    return undefined;
  }
  return props.icon;
});

const vuetifyAttrs = computed(() => {
  const merged = { ...props, ...attrs } as Record<string, unknown>;
  const {
    delay: _delay,
    label: _label,
    icon: _icon,
    flat,
    outline,
    dense,
    round,
    disable,
    loading: _loading,
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

function handleClick(e: MouseEvent) {
  onClick([e], { ...props, ...attrs });
}
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
