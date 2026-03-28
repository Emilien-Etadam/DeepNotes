<template>
  <v-combobox
    :model-value="modelValue"
    variant="filled"
    :density="dense ? 'compact' : undefined"
    hide-details
    :return-object="false"
    :items="options ?? []"
    :item-title="itemTitleFromItem"
    item-value="value"
    :label="label"
    :disabled="disable"
    @update:model-value="$emit('update:model-value', $event)"
    @update:search="onSearch"
  >
    <template #item="{ item, props: listItemProps }">
      <v-list-item v-bind="listItemProps">
        <slot
          name="item"
          v-bind="{ opt: item, itemProps: listItemProps }"
        >
          <v-list-item-title>
            {{ item?.label }}
          </v-list-item-title>
        </slot>
      </v-list-item>
    </template>
  </v-combobox>
</template>

<script lang="ts">
export interface ComboboxOption {
  label?: string;
  value: string;
  [key: string]: unknown;
}

export interface ComboboxProps {
  modelValue: any;
  options?: ComboboxOption[];
  label?: string;
  disable?: boolean;
  dense?: boolean;
}
</script>

<script setup lang="ts">
const props = defineProps<ComboboxProps>();

const emit = defineEmits<{ 'update:model-value': [value: any] }>();

function itemTitleFromItem(item: unknown) {
  if (item != null && typeof item === 'object') {
    const o = item as ComboboxOption;
    if (o.label != null && o.label !== '') {
      return String(o.label);
    }
    if (o.value != null) {
      return String(o.value);
    }
  }
  return '';
}

function onSearch(value: string) {
  if (value !== props.modelValue) {
    emit('update:model-value', value);
  }
}
</script>
