<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useNotifyStore } from 'src/stores/notify-store';

const store = useNotifyStore();
const { items } = storeToRefs(store);

function snackbarColor(n: (typeof items.value)[0]) {
  return n.color ?? 'surface-variant';
}

function snackbarTimeout(n: (typeof items.value)[0]) {
  return n.timeoutMs <= 0 ? -1 : n.timeoutMs;
}
</script>

<template>
  <div class="global-notifications">
    <v-snackbar
      v-for="n in items"
      :key="n.id"
      :model-value="true"
      :color="snackbarColor(n)"
      :timeout="snackbarTimeout(n)"
      location="bottom right"
      multi-line
      @update:model-value="(v: boolean) => !v && store.remove(n.id)"
    >
      <div>
        <div
          v-if="n.html"
          v-html="n.message"
        />
        <div v-else>
          {{ n.message }}
        </div>
        <div
          v-if="n.caption"
          class="text-caption mt-1"
        >
          {{ n.caption }}
        </div>
      </div>
    </v-snackbar>
  </div>
</template>
