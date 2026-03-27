<template>
  <q-select
    :options="options"
    option-label="name"
    option-value="id"
    filled
    emit-value
    map-options
    dense
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #selected>
      <template v-if="modelValue">
        {{ rolesMap()[modelValue].name }}
      </template>
      <template v-else>(Select a role)</template>
    </template>

    <template #option="scope">
      <q-item
        v-bind="scope.itemProps"
        style="max-width: 220px"
      >
        <q-item-section>
          <q-item-label>{{ scope.opt.name }}</q-item-label>
          <q-item-label caption>{{ scope.opt.description }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
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
