<template>
  <div class="login-page">
    <ResponsiveContainer style="padding: 120px 32px">
      <form
        class="login-form"
        style="margin: 0px auto; max-width: 270px"
        @submit.prevent="createAdmin()"
      >
        <div
          class="setup-title"
          style="
            text-align: center;
            margin-bottom: 24px;
            font-size: 18px;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.92);
          "
        >
          Create admin account
        </div>

        <TextField
          label="Email"
          label-color="grey-5"
          v-model="email"
          :maxlength="maxEmailLength"
        />

        <Gap style="height: 12px" />

        <TextField
          label="Display name"
          label-color="grey-5"
          v-model="userName"
          :maxlength="maxNameLength"
        />

        <Gap style="height: 12px" />

        <PasswordField
          label="Password"
          v-model="password"
        />

        <Gap style="height: 12px" />

        <PasswordField
          label="Repeat password"
          v-model="repeatPassword"
        />

        <Gap style="height: 28px" />

        <DeepBtn
          label="Create admin account"
          type="submit"
          color="primary"
          style="width: 100%; font-size: 16px; padding: 14px 0px"
          delay
        />
      </form>
    </ResponsiveContainer>
  </div>
</template>

<script setup lang="ts">
import { maxNameLength } from '@deeplib/misc';
import { maxEmailLength, w3cEmailRegex } from '@stdlib/misc';
import { getRegistrationValues } from 'src/code/areas/auth/register';
import { deriveUserValues } from 'src/code/crypto';
import { handleError } from 'src/code/utils/misc';
import { zxcvbnAsync } from 'src/code/utils/zxcvbn';

useMeta(() => ({
  title: 'Setup - DeepNotes',
}));

const email = ref('');
const userName = ref('');
const password = ref('');
const repeatPassword = ref('');

async function createAdmin() {
  try {
    if (!w3cEmailRegex.test(email.value)) {
      throw new Error('Email is invalid.');
    }
    if (userName.value.trim() === '') {
      throw new Error('Display name cannot be empty.');
    }
    if (password.value !== repeatPassword.value) {
      throw new Error('Passwords do not match.');
    }
    const zxcvbnResult = await zxcvbnAsync(password.value);
    if (zxcvbnResult.score <= 0) {
      $quasar().notify({
        html: true,
        message: 'Password is too weak. Please use a stronger password.',
        type: 'negative',
      });
      return;
    }

    const derivedUserValues = await deriveUserValues({
      email: email.value,
      password: password.value,
    });

    const registrationValues = await getRegistrationValues({
      derivedUserValues,
      userName: userName.value.trim(),
    });

    await trpcClient.setup.setupCreateFirstUser.mutate({
      email: email.value,
      loginHash: derivedUserValues.loginHash,
      ...registrationValues,
    });

    $quasar().notify({
      message: 'Admin account created. You can now log in.',
      type: 'positive',
    });

    await router().push({ name: 'login' });
  } catch (error: unknown) {
    handleError(error);
  }
}
</script>

<style scoped lang="scss">
.login-page {
  color: $text-primary;

  .login-form,
  .login-form > div {
    color: $text-primary;
  }

  :deep(.v-field__label),
  :deep(.v-label),
  :deep(.v-field input),
  :deep(.v-field textarea) {
    color: $text-primary !important;
  }
  :deep(input::placeholder) {
    color: $text-placeholder;
  }

  :deep(.v-field--variant-filled .v-field__overlay) {
    opacity: 1;
    background: $bg-input-idle;
  }

  :deep(.v-input:hover .v-field--variant-filled .v-field__overlay) {
    background: $bg-input-hover;
  }

  :deep(.v-input--focused .v-field--variant-filled .v-field__overlay) {
    background: $bg-input-focus;
  }

  :deep(.v-btn) {
    color: inherit;
  }
  :deep(.v-btn.v-btn--color-primary) {
    color: #fff;
  }

  .setup-title {
    color: $text-primary !important;
  }
}
</style>
