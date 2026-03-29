<template>
  <v-icon
    icon="mdi-content-copy"
    size="23"
    class="cursor-pointer"
    style="margin-right: -3px"
    @click="
      async () => {
        await setClipboardText(text);

        showNotify({
          message: 'Copied to clipboard.',
          type: 'positive',
        });
      }
    "
  >
    <v-tooltip
      activator="parent"
      location="top"
    >
      Copy
    </v-tooltip>
  </v-icon>
</template>

<script setup lang="ts">
import { setClipboardText } from 'src/code/utils/clipboard';
import { showNotify } from 'src/code/utils/notify';

defineProps<{
  text: string;
}>();
</script>
