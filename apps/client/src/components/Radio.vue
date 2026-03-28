<template>
  <v-radio-group
    class="radio"
    :model-value="modelValue"
    density="compact"
    hide-details
    @update:model-value="$emit('update:model-value', $event)"
  >
    <v-radio
      :label="label"
      :value="val"
      :disabled="disable"
    />
  </v-radio-group>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  modelValue?: string | number | null;
  val?: string | number | null;
  disable?: boolean;
}>();
</script>

<style scoped>
.radio {
  flex: none;

  margin-left: -10px;
  margin-top: -10px;
  margin-bottom: -10px;
}
</style>
