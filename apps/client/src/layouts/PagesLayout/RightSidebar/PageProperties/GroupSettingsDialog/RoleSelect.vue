<template>
  <v-select
    :items="options"
    item-title="name"
    item-value="id"
    variant="filled"
    density="compact"
    :return-object="false"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #selection>
      <template v-if="modelValue">
        {{ rolesMap()[modelValue].name }}
      </template>
      <template v-else>(Select a role)</template>
    </template>

    <template #item="{ item, props }">
      <v-list-item
        v-bind="props"
        :title="item.name"
        :subtitle="item.description"
        style="max-width: 220px"
      />
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { type GroupRoleID, rolesMap } from '@deeplib/misc';

defineProps<{
  modelValue: GroupRoleID | null;
  options: Array<{ id: GroupRoleID; name: string; description: string }>;
}>();

defineEmits<{
  'update:modelValue': [value: GroupRoleID | null];
}>();
</script>
