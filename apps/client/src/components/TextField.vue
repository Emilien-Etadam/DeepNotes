<template>
  <v-text-field
    class="text-field"
    :class="{ 'text-field--muted-label': labelColor === 'grey-5' }"
    :model-value="modelValue"
    variant="filled"
    color="primary"
    bg-color="grey-darken-4"
    dark
    :density="dense ? 'compact' : undefined"
    :maxlength="maxlength"
    :type="type"
    :readonly="readonly"
    :autofocus="autofocus"
    :placeholder="placeholder"
    :disabled="disable"
    :hide-details="hideDetails"
    :title="title"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template #label>
      <slot name="label">
        {{ label }}
      </slot>
    </template>
    <template
      v-if="copyBtn"
      #append-inner
    >
      <CopyBtn :text="String(modelValue)" />
    </template>
  </v-text-field>
</template>

<script setup lang="ts">
interface Props {
  modelValue: any;
  label?: string;
  labelColor?: string;
  maxlength?: number;
  type?: string;
  copyBtn?: boolean;
  readonly?: boolean;
  dense?: boolean;
  /** Vuetify `hide-details` to reduce reserved vertical space under the input. */
  hideDetails?: boolean;
  autofocus?: boolean;
  /** Forwarded as Vuetify `disabled`. */
  disable?: boolean;
  placeholder?: string;
  title?: string;
  /** Legacy `filled`; field is always filled variant — prop ignored, declared so it is not forwarded as DOM attr. */
  filled?: boolean;
}

const props = defineProps<Props>();

const inputTextColor = computed(() =>
  props.readonly ? '#d8d8d8' : 'rgba(255,255,255,0.92)',
);
</script>

<style scoped lang="scss">
.text-field :deep(.v-field__input) {
  color: v-bind(inputTextColor);
}

.text-field--muted-label :deep(.v-label) {
  color: #9e9e9e;
}

.text-field :deep() {
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
}
</style>
