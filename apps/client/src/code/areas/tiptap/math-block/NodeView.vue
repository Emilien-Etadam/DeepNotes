<template>
  <NodeViewWrapper>
    <div
      class="math-block"
      contentEditable="false"
      draggable="true"
      data-drag-handle
      v-html="renderedFormula"
      :class="{
        selected: editor.isEditable && selected,
      }"
    ></div>

    <q-menu
      v-model="showFormulaEditor"
      anchor="bottom middle"
      self="top middle"
      :offset="[0, 8]"
      :transition-duration="200"
    >
      <div style="background-color: rgb(29, 29, 29); padding: 8px">
        <q-input
          :model-value="node.attrs.input"
          @update:model-value="(value) => updateAttributes({ input: value })"
          type="textarea"
          filled
          dense
          input-style="resize: none"
          autogrow
          autofocus
          placeholder="E = mc^2"
        />
      </div>
    </q-menu>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { type NodeViewProps, NodeViewWrapper } from '@tiptap/vue-3';

import { useMathNodeView } from '../useMathNodeView';

type Props = NodeViewProps;

const props = defineProps<Props>();
const { showFormulaEditor, renderedFormula } = useMathNodeView(props, true);
</script>

<style scoped lang="scss">
.math-block {
  border-radius: $radius-sm;

  padding: 1px 12px;

  text-align: center;
  font-style: italic;
  font-size: 16px;

  transition: background-color 0.1s ease-in-out;
}

.math-block,
.math-block :deep(*) {
  user-select: none !important;
}

:deep(.q-field__native),
:deep(.q-field__input) {
  color: $text-primary;
}
</style>

<style lang="scss">
.text-editor.editing .math-block:hover {
  cursor: pointer;

  background-color: $bg-hover-light;
}
.text-editor.editing .math-block.selected {
  background-color: rgba(0, 109, 210, 0.2);
}
</style>
