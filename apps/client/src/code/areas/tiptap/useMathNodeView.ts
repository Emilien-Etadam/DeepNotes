import type { NodeViewProps } from '@tiptap/vue-3';
import DOMPurify from 'dompurify';
import katex from 'katex';
import { computed, ref, watch } from 'vue';

export function useMathNodeView(props: NodeViewProps, displayMode: boolean) {
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

    return DOMPurify.sanitize(
      katex.renderToString(props.node.attrs.input, {
        throwOnError: false,
        strict: false,
        displayMode,
        output: 'html',
      }),
    );
  });

  return { showFormulaEditor, renderedFormula };
}
