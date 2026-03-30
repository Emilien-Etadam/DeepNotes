<template>
  <div style="display: contents">
    <v-dialog
      :model-value="isOpen"
      @update:model-value="onUpdateOpen"
      :max-width="dialogMaxWidth"
      :persistent="persistent"
      @after-leave="onAfterLeave"
    >
      <v-card :style="mergedCardStyle">
        <v-card-title style="flex: none">
          <slot name="header" />
        </v-card-title>

        <v-divider />

        <v-card-text
          style="
            flex: 1;
            overflow: auto;
            padding: 0;
            display: flex;
            flex-direction: column;
            min-height: 0;
          "
        >
          <slot name="body" />
        </v-card-text>

        <v-divider />

        <v-card-actions style="flex: none">
          <slot name="footer" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useDialogStore } from 'src/stores/dialog-store';

const programmaticLayerId = inject<number | null>(
  'programmaticDialogLayerId',
  null,
);

const dialogStore = useDialogStore();

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    cardStyle?: string | Record<string, string>;
    persistent?: boolean;
    maxWidth?: string | number;
    /**
     * When true, automatically calls `show()` on mount.
     * Used by `ProgrammaticDialogLayer` to open programmatic dialogs reliably.
     */
    autoOpen?: boolean;
  }>(),
  {
    persistent: true,
    maxWidth: 500,
    autoOpen: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  ok: [payload?: unknown];
  cancel: [];
  hide: [];
}>();

// Init early so `v-dialog` can mount/render immediately when auto-open is requested.
const internalOpen = ref(!!props.autoOpen);

const isControlled = computed(() => props.autoOpen ? false : props.modelValue !== undefined);

const isOpen = computed({
  get: () => (isControlled.value ? props.modelValue! : internalOpen.value),
  set: (v: boolean) => {
    if (isControlled.value) {
      emit('update:modelValue', v);
    } else {
      internalOpen.value = v;
    }
  },
});

const dialogMaxWidth = computed(() => props.maxWidth);

const mergedCardStyle = computed(() => {
  const baseStyle: Record<string, string> = {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flexShrink: '0',
  };

  if (props.cardStyle == null || typeof props.cardStyle === 'string') {
    // We keep raw string styles as-is and only auto-infer minHeight for object styles.
    return props.cardStyle == null ? baseStyle : [baseStyle, props.cardStyle];
  }

  const merged: Record<string, string> = {
    ...baseStyle,
    ...(props.cardStyle as Record<string, string>),
  };

  if (merged.height != null && merged.minHeight == null) {
    merged.minHeight = merged.height;
  }

  return merged;
});

function onUpdateOpen(v: boolean) {
  isOpen.value = v;
}

function onAfterLeave() {
  emit('hide');
}

function show() {
  isOpen.value = true;
}

function hide() {
  isOpen.value = false;
}

function ok(payload?: unknown) {
  onDialogOK(payload);
}

function cancel() {
  onDialogCancel();
}

function onDialogOK(payload?: unknown) {
  if (programmaticLayerId != null) {
    dialogStore.resolveLayerOk(programmaticLayerId, payload);
  }
  emit('ok', payload);
  isOpen.value = false;
}

function onDialogCancel() {
  if (programmaticLayerId != null) {
    dialogStore.resolveLayerCancel(programmaticLayerId);
  }
  emit('cancel');
  isOpen.value = false;
}

function onDialogHide() {
  emit('hide');
}

defineExpose({
  show,
  hide,
  ok,
  cancel,
  onDialogOK,
  onDialogCancel,
  onDialogHide,
});
</script>
