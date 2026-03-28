<template>
  <PasswordField
    ref="passwordRef"
    v-bind="$attrs"
    :model-value="modelValue"
    :autocomplete="autocomplete"
    @update:model-value="$emit('update:modelValue', $event)"
    @focus="focused = true"
    @blur="focused = false"
  >
    <div
      v-if="modelValue !== '' || focused"
      style="
        position: absolute;
        left: -12px;
        bottom: 0;
        height: 2px;
        isolation: isolate;
      "
      :style="{
        width: `${((passwordStrength + 1) / 5) * passwordWidth}px`,
        'background-color':
          passwordStrength === 0
            ? '#f95e68'
            : passwordStrength === 1
              ? '#fb964d'
              : passwordStrength === 2
                ? '#fdd244'
                : passwordStrength === 3
                  ? '#b0dc53'
                  : '#35cc62',
      }"
    ></div>
  </PasswordField>

  <template v-if="modelValue !== '' || focused">
    <ul
      v-if="passwordWarning || passwordFeedback.length > 0"
      style="
        padding-left: 30px;
        margin-block-start: 10px;
        margin-block-end: 2px;
      "
    >
      <li
        v-if="passwordWarning"
        class="password-warning"
      >
        {{ passwordWarning }}
      </li>
      <li
        v-for="feedback in passwordFeedback"
        :key="feedback"
        class="password-feedback"
      >
        {{ feedback }}
      </li>
    </ul>
  </template>
</template>

<script setup lang="ts">
import { useResizeObserver } from 'src/code/utils/misc';
import { zxcvbnAsync } from 'src/code/utils/zxcvbn';
import type { ComponentPublicInstance } from 'vue';

import type { PasswordFieldProps } from './PasswordField.vue';

const props = defineProps<PasswordFieldProps>();

const focused = ref(false);

const passwordRef = ref<ComponentPublicInstance>();
const passwordWidth = ref(0);

useResizeObserver(
  () => passwordRef.value!.$el,
  (entry) => {
    passwordWidth.value = entry.contentRect.width;
  },
);

const passwordStrength = ref(0);
const passwordFeedback = ref<string[]>([]);
const passwordWarning = ref('');

watch(
  () => props.modelValue,
  async (value) => {
    const result = await zxcvbnAsync(value);
    if (props.modelValue === value) {
      passwordStrength.value = result.score;
      passwordFeedback.value = result.feedback.suggestions;
      passwordWarning.value = result.feedback.warning;
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.password-warning {
  color: $color-error;
}

.password-feedback {
  color: $text-disabled-alt;
}
</style>
