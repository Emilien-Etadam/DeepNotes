<template>
  <v-dialog
    :model-value="isOpen"
    @update:model-value="onUpdateOpen"
    max-width="400"
    :persistent="persistent"
    @after-leave="onAfterLeave"
  >
    <v-card :style="cardStyle">
      <v-card-title>Delete {{ subject }}</v-card-title>

      <v-divider />

      <v-card-text>
        Are you sure you want to delete
        {{ subject?.endsWith('s') ? 'these' : 'this' }}
        {{ subject?.toLowerCase() }}?

        <div style="margin-top: 12px">
          <Checkbox
            label="Delete permanently"
            v-model="deletePermanently"
          />
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="cancel"
        >
          No
        </v-btn>
        <v-btn
          color="error"
          variant="text"
          @click="ok"
        >
          Yes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
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
    subject?: string;
    cardStyle?: string;
    persistent?: boolean;
  }>(),
  {
    persistent: true,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  ok: [payload: { deletePermanently: boolean }];
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

const deletePermanently = ref(false);

function onUpdateOpen(v: boolean) {
  isOpen.value = v;
}

function onAfterLeave() {
  emit('hide');
}

function ok() {
  const payload = { deletePermanently: deletePermanently.value };
  if (programmaticLayerId != null) {
    dialogStore.resolveLayerOk(programmaticLayerId, payload);
  }
  emit('ok', payload);
  isOpen.value = false;
}

function cancel() {
  if (programmaticLayerId != null) {
    dialogStore.resolveLayerCancel(programmaticLayerId);
  }
  emit('cancel');
  isOpen.value = false;
}

defineExpose({
  show: () => {
    isOpen.value = true;
  },
  hide: () => {
    isOpen.value = false;
  },
  ok,
  cancel,
  onDialogOK: ok,
  onDialogCancel: cancel,
  onDialogHide: () => emit('hide'),
});
</script>
