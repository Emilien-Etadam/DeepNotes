<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useDialogStore } from 'src/stores/dialog-store';

import ProgrammaticDialogLayer from './ProgrammaticDialogLayer.vue';

const dialogStore = useDialogStore();
const { confirmOpen, confirmOpts, promptModel, componentLayers } =
  storeToRefs(dialogStore);

const okBtnRef = ref<{ $el?: HTMLElement } | null>(null);
const cancelBtnRef = ref<{ $el?: HTMLElement } | null>(null);

watch(
  () => confirmOpen.value,
  async (open) => {
    if (!open) {
      return;
    }
    await nextTick();
    const focus = confirmOpts.value?.focus;
    if (focus === 'cancel') {
      cancelBtnRef.value?.$el?.focus?.();
    } else if (focus === 'ok' || focus == null) {
      okBtnRef.value?.$el?.focus?.();
    }
  },
);

function cardStyle() {
  return confirmOpts.value?.style;
}

function showCancel() {
  const c = confirmOpts.value?.cancel;
  return c !== false;
}

function cancelLabel() {
  const c = confirmOpts.value?.cancel;
  if (typeof c === 'object' && c?.label != null) {
    return c.label;
  }
  return 'Cancel';
}

function okLabel() {
  const o = confirmOpts.value?.ok;
  if (typeof o === 'object' && o?.label != null) {
    return o.label;
  }
  return 'OK';
}

function onConfirmDialogModel(v: boolean) {
  if (!v) {
    dialogStore.confirmCancel();
  }
}
</script>

<template>
  <v-dialog
    :model-value="confirmOpen"
    max-width="560"
    :persistent="true"
    @update:model-value="onConfirmDialogModel"
  >
    <v-card
      v-if="confirmOpts"
      :style="cardStyle()"
    >
      <v-card-title v-if="confirmOpts.title">
        {{ confirmOpts.title }}
      </v-card-title>

      <v-divider v-if="confirmOpts.title" />

      <v-card-text>
        <div
          v-if="confirmOpts.html"
          v-html="confirmOpts.message"
        />
        <div v-else>
          {{ confirmOpts.message }}
        </div>

        <v-text-field
          v-if="confirmOpts.prompt != null"
          v-model="promptModel"
          class="mt-4"
          :type="confirmOpts.prompt.type === 'url' ? 'url' : 'text'"
          :variant="confirmOpts.prompt.filled ? 'filled' : 'outlined'"
          density="compact"
          hide-details
          @keyup.enter="dialogStore.confirmOk()"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <DeepBtn
          v-if="showCancel()"
          ref="cancelBtnRef"
          flat
          :color="
            typeof confirmOpts.cancel === 'object'
              ? (confirmOpts.cancel.color ?? 'primary')
              : 'primary'
          "
          :label="cancelLabel()"
          @click="dialogStore.confirmCancel()"
        />
        <DeepBtn
          ref="okBtnRef"
          flat
          :color="
            typeof confirmOpts.ok === 'object'
              ? (confirmOpts.ok.color ?? 'primary')
              : (confirmOpts.color ?? 'primary')
          "
          :label="okLabel()"
          @click="dialogStore.confirmOk()"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <template
    v-for="(layer, idx) in componentLayers"
    :key="layer.id"
  >
    <div
      v-if="idx === componentLayers.length - 1"
      class="programmatic-dialog-layer"
    >
      <ProgrammaticDialogLayer
        :layer-id="layer.id"
        :dialog-component="layer.component"
        :dialog-props="layer.props"
      />
    </div>
  </template>
</template>
