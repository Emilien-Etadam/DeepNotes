<template>
  <div
    v-if="internals.pages.react.tableContextMenu"
    ref="menuRootRef"
    class="table-context-menu"
    :style="{
      left: `${internals.pages.react.tableContextMenuPos.x}px`,
      top: `${internals.pages.react.tableContextMenuPos.y}px`,
      position: 'fixed',
      zIndex: 9999,
    }"
  >
    <div
      class="ctx-group"
      @mouseenter="openSub = 'column'"
      @mouseleave="openSub = null"
    >
      <div class="ctx-item">
        <v-icon
          size="small"
          icon="mdi-table-column"
        />
        <span class="ctx-item__label">Column</span>
        <v-icon
          class="ctx-item__chevron"
          size="small"
          icon="mdi-chevron-right"
        />
      </div>
      <div
        v-show="openSub === 'column'"
        class="ctx-submenu"
      >
        <div
          class="ctx-item"
          @click="formatWithClose((chain) => chain.addColumnBefore())"
        >
          <v-icon
            size="small"
            icon="mdi-table-column-plus-before"
          />
          <span class="ctx-item__label">Insert column before</span>
        </div>
        <div
          class="ctx-item"
          @click="formatWithClose((chain) => chain.addColumnAfter())"
        >
          <v-icon
            size="small"
            icon="mdi-table-column-plus-after"
          />
          <span class="ctx-item__label">Insert column after</span>
        </div>
        <div
          class="ctx-item"
          @click="formatWithClose((chain) => chain.deleteColumn())"
        >
          <v-icon
            size="small"
            icon="mdi-table-column-remove"
          />
          <span class="ctx-item__label">Remove column</span>
        </div>
      </div>
    </div>

    <div
      class="ctx-group"
      @mouseenter="openSub = 'row'"
      @mouseleave="openSub = null"
    >
      <div class="ctx-item">
        <v-icon
          size="small"
          icon="mdi-table-row"
        />
        <span class="ctx-item__label">Row</span>
        <v-icon
          class="ctx-item__chevron"
          size="small"
          icon="mdi-chevron-right"
        />
      </div>
      <div
        v-show="openSub === 'row'"
        class="ctx-submenu"
      >
        <div
          class="ctx-item"
          @click="formatWithClose((chain) => chain.addRowBefore())"
        >
          <v-icon
            size="small"
            icon="mdi-table-row-plus-before"
          />
          <span class="ctx-item__label">Insert row before</span>
        </div>
        <div
          class="ctx-item"
          @click="formatWithClose((chain) => chain.addRowAfter())"
        >
          <v-icon
            size="small"
            icon="mdi-table-row-plus-after"
          />
          <span class="ctx-item__label">Insert row after</span>
        </div>
        <div
          class="ctx-item"
          @click="formatWithClose((chain) => chain.deleteRow())"
        >
          <v-icon
            size="small"
            icon="mdi-table-row-remove"
          />
          <span class="ctx-item__label">Remove row</span>
        </div>
      </div>
    </div>

    <div
      class="ctx-group"
      @mouseenter="openSub = 'cells'"
      @mouseleave="openSub = null"
    >
      <div class="ctx-item">
        <v-icon
          size="small"
          icon="mdi-table-merge-cells"
        />
        <span class="ctx-item__label">Cells</span>
        <v-icon
          class="ctx-item__chevron"
          size="small"
          icon="mdi-chevron-right"
        />
      </div>
      <div
        v-show="openSub === 'cells'"
        class="ctx-submenu"
      >
        <div
          class="ctx-item"
          @click="formatWithClose((chain) => chain.mergeCells())"
        >
          <v-icon
            size="small"
            icon="mdi-table-merge-cells"
          />
          <span class="ctx-item__label">Merge cells</span>
        </div>
        <div
          class="ctx-item"
          @click="formatWithClose((chain) => chain.splitCell())"
        >
          <v-icon
            size="small"
            icon="mdi-table-split-cell"
          />
          <span class="ctx-item__label">Split cell</span>
        </div>
      </div>
    </div>

    <div
      class="ctx-item"
      @click="formatWithClose((chain) => chain.deleteTable())"
    >
      <v-icon
        size="small"
        icon="mdi-table-large-remove"
      />
      <span class="ctx-item__label">Remove table</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChainedCommands } from '@tiptap/vue-3';
import { onClickOutside } from '@vueuse/core';

const page = computed(() => internals.pages.react.page);

const openSub = ref<string | null>(null);
const menuRootRef = ref<HTMLElement | null>(null);

function close() {
  internals.pages.react.tableContextMenu = false;
  openSub.value = null;
}

function format(func: (chain: ChainedCommands) => ChainedCommands) {
  func(page.value.editing.react.editor!.chain().focus()).run();
}

function formatWithClose(func: (chain: ChainedCommands) => ChainedCommands) {
  format(func);
  close();
}

onClickOutside(menuRootRef, () => {
  if (internals.pages.react.tableContextMenu) {
    close();
  }
});

watch(
  () => internals.pages.react.tableContextMenu,
  (open) => {
    if (open) {
      openSub.value = null;
    }
  },
);
</script>

<style scoped lang="scss">
.table-context-menu {
  background: #1e1e1e;
  border-radius: 4px;
  padding: 4px 0;
  min-width: 200px;
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.06);
}

.ctx-group {
  position: relative;
}

.ctx-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
}

.ctx-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.ctx-item__label {
  flex: 1;
  min-width: 0;
}

.ctx-item__chevron {
  margin-left: auto;
  flex-shrink: 0;
  opacity: 0.7;
}

.ctx-submenu {
  position: absolute;
  left: 100%;
  top: 0;
  margin-left: 2px;
  min-width: 220px;
  padding: 4px 0;
  background: #1e1e1e;
  border-radius: 4px;
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.06);
}
</style>
