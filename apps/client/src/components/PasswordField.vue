<template>
  <div class="password-field-wrap">
    <v-text-field
      class="password-field"
      :class="{ 'password-field--muted-label': labelColor === 'grey-5' }"
      v-bind="$attrs"
      :model-value="modelValue"
      variant="filled"
      color="primary"
      bg-color="grey-darken-4"
      dark
      :type="showPassword ? 'text' : 'password'"
      :autocomplete="autocomplete"
      :label="label"
      :density="dense ? 'compact' : undefined"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template #append-inner>
        <v-icon
          :icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          style="cursor: pointer"
          @click="showPassword = !showPassword"
        />
      </template>
    </v-text-field>
    <slot></slot>
  </div>
</template>

<script lang="ts">
export interface PasswordFieldProps {
  modelValue: string;
  autocomplete?: 'current-password' | 'new-password';
  label?: string;
  labelColor?: string;
  dense?: boolean;
}
</script>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

withDefaults(defineProps<PasswordFieldProps>(), {
  autocomplete: 'current-password',
});

const showPassword = ref(false);
</script>

<style scoped lang="scss">
.password-field--muted-label :deep(.v-label) {
  color: #9e9e9e;
}

.password-field-wrap {
  position: relative;
}
</style>
