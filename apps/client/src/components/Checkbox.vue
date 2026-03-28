<template>
  <v-checkbox
    class="checkbox"
    :model-value="modelValue"
    :density="dense ? 'compact' : undefined"
    :color="color ?? 'primary'"
    :disabled="disable"
    hide-details
    :label="slots.default ? undefined : label"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <template
      v-if="slots.default"
      #label
    >
      <span class="checkbox__label">
        <span v-if="label">{{ label }}</span>
        <slot />
      </span>
    </template>
  </v-checkbox>
</template>

<script setup lang="ts">
interface Props {
  modelValue: any;
  label?: string;
  dense?: boolean;
  color?: string;
  /** Forwarded as Vuetify `disabled`. */
  disable?: boolean;
}

defineProps<Props>();

const slots = useSlots();
</script>

<style scoped>
.checkbox {
  flex: 1;
  margin-left: -8px;
}

.checkbox__label {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}
</style>
