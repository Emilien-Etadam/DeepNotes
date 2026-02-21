<template>
  <div
    style="
      position: absolute;

      bottom: 12px;
      right: 14px;

      text-align: right;

      pointer-events: none;

      font-size: 12px;
    "
  >
    <div
      v-if="page.selection.react.elems.length > 0"
      class="selection-count"
    >
      {{ page.selection.react.elems.length }}
      item{{ pluralS(page.selection.react.elems.length) }} selected
    </div>

    <div
      v-if="page.react.status === 'success' && page.react.readOnly"
      style="margin-top: 3px"
    >
      Read-only page{{ subscriptionExpired ? ' (Subscription expired)' : '' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { pluralS } from '@stdlib/misc';

const page = computed(() => internals.pages.react.page);

const subscriptionExpired = computed(() => false);
</script>

<style scoped lang="scss">
@use 'sass:color';

.selection-count {
  color: color.adjust(#006dd2, $lightness: 23%);
}
</style>
