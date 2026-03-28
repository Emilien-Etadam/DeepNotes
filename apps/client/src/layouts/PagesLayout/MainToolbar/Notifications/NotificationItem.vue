<template>
  <v-list-item link>
    <slot></slot>

    <Gap style="height: 6px" />

    <div style="font-size: 12px; color: rgba(255, 255, 255, 0.5)">
      {{
        relativeTimeStr(
          new Date(notification.dateTime).getTime() - Date.now(),
        )
      }}
    </div>
  </v-list-item>
</template>

<script setup lang="ts">
import type { DeepNotesNotification } from '@deeplib/misc';
import { relativeTimeStr } from '@stdlib/misc';

defineProps<{
  notification: DeepNotesNotification;
}>();
</script>

<style scoped>
.v-list-item {
  margin: 8px;

  border-radius: 4px;

  padding: 12px 14px;

  background-color: #2a2a2a;
}
</style>
