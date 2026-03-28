<template>
  <v-list-item
    link
    :active="currentTab === name"
    active-class="bg-grey-darken-4 text-grey-lighten-4"
    :prepend-icon="icon"
    :title="name"
    @click="$emit('set-tab', name)"
  />
</template>

<script setup lang="ts">
defineProps<{
  name: string;
  icon: string;
  currentTab: string;
}>();
</script>
