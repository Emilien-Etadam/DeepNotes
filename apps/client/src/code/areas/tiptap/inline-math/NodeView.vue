<template>
  <NodeViewWrapper as="span">
    <span
      class="inline-math"
      contentEditable="false"
      draggable="true"
      data-drag-handle
      v-html="renderedFormula"
      :class="{
        selected: editor.isEditable && selected,
      }"
    ></span>

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
import katex from 'katex';

type Props = NodeViewProps;

const props = defineProps<Props>();

const showFormulaEditor = ref(false);

watch(showFormulaEditor, () => {
  if (!props.editor.isEditable) {
    showFormulaEditor.value = false;
  }
});

const renderedFormula = computed(() => {
  if (!props.node.attrs.input) {
    return '[Enter formula]';
  }

  return katex.renderToString(props.node.attrs.input, {
    throwOnError: false,
    strict: false,
    displayMode: false,
    output: 'html',
  });
});
</script>

<style scoped lang="scss">
.inline-math {
  border-radius: $radius-sm;

  text-align: center;
  font-style: italic;
  font-size: 15px;

  transition: background-color 0.1s ease-in-out;
}

.inline-math,
.inline-math :deep(*) {
  user-select: none !important;
}

:deep(.q-field__native),
:deep(.q-field__input) {
  color: $text-primary;
}
</style>

<style lang="scss">
.text-editor.editing .inline-math:hover {
  cursor: pointer;

  background-color: $bg-hover-light;
}
.text-editor.editing .inline-math.selected {
  background-color: rgba(0, 109, 210, 0.2);
}
</style>
