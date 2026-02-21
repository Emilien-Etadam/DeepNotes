<template>
  <button
    type="button"
    :disabled="disable"
    class="toolbar-btn"
    :style="{
      'min-width': round ? undefined : (btnSize ?? '28px'),
      height: btnSize ?? '28px',
      width: btnSize ?? '28px',
      'border-radius': round ? '50%' : '4px',
    }"
    @mousedown.prevent
  >
    <q-icon
      :size="iconSize ?? '19px'"
      :name="icon"
    />

    <slot></slot>

    <q-tooltip
      v-if="tooltip != null"
      anchor="bottom middle"
      self="top middle"
      :offset="[10, 10]"
      style="text-align: center"
    >
      <div
        v-for="(line, index) in tooltip.split('\n')"
        :key="index"
      >
        {{ line }}
      </div>
    </q-tooltip>
  </button>
</template>

<script setup lang="ts">
interface Props {
  icon: string;
  tooltip?: string;
  iconSize?: string;
  btnSize?: string;
  round?: boolean;
  disable?: boolean;
}

defineProps<Props>();
</script>

<style scoped>
.toolbar-btn {
  padding: 0;
  margin: 4px 0px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 1;
}
.toolbar-btn:disabled {
  cursor: default;
  opacity: 0.3;
}
.toolbar-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}
</style>
