<template>
  <div>
    <slot></slot>
    <div
      v-if="!disable"
      ref="sentinel"
      style="height: 1px"
    />
    <div
      v-if="isLoading"
      style="display: flex; justify-content: center; padding: 16px"
    >
      <v-progress-circular indeterminate />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core';

const props = defineProps<{
  disable?: boolean;
}>();

const emit = defineEmits<{
  load: [index: number, done: (stop?: boolean) => void];
}>();

const sentinel = ref<HTMLElement | null>(null);
const isLoading = ref(false);
const loadIndex = ref(1);
const stopped = ref(false);

const { stop: stopObserving } = useIntersectionObserver(
  sentinel,
  ([entry]) => {
    if (!entry?.isIntersecting) {
      return;
    }
    checkStillVisible();
  },
  { threshold: 0 },
);

function doneCallback(noMore?: boolean) {
  isLoading.value = false;
  if (noMore) {
    stopped.value = true;
    stopObserving();
    return;
  }
  loadIndex.value += 1;
  nextTick(() => checkStillVisible());
}

function checkStillVisible() {
  if (props.disable || stopped.value || isLoading.value) {
    return;
  }
  const el = sentinel.value;
  if (el == null) {
    return;
  }
  const rect = el.getBoundingClientRect();
  const vw = globalThis.innerWidth ?? 0;
  const vh = globalThis.innerHeight ?? 0;
  const visible =
    rect.top < vh && rect.bottom > 0 && rect.left < vw && rect.right > 0;
  if (!visible) {
    return;
  }
  isLoading.value = true;
  emit('load', loadIndex.value, doneCallback);
}
</script>
