<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="onUpdateOpen"
    :max-width="dialogMaxWidth"
    :persistent="persistent"
    @after-leave="onAfterLeave"
  >
    <v-card :style="cardStyle">
      <v-card-title>
        <slot name="header" />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <slot name="body" />
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <slot name="footer" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    cardStyle?: string | Record<string, string>;
    persistent?: boolean;
    maxWidth?: string | number;
  }>(),
  {
    persistent: true,
    maxWidth: 500,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  ok: [payload?: unknown];
  cancel: [];
  hide: [];
}>();

const internalOpen = ref(false);

const isControlled = computed(() => props.modelValue !== undefined);

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
  emit('ok', payload);
  isOpen.value = false;
}

function onDialogCancel() {
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
