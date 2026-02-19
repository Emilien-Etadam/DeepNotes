<template>
  <q-page class="login-page">
    <ResponsiveContainer style="padding: 120px 32px">
      <q-form
        class="login-form"
        style="margin: 0px auto; max-width: 270px"
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
          autocomplete="username"
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
          autocomplete="new-password"
        />

        <Gap style="height: 12px" />

        <PasswordField
          label="Repeat password"
          v-model="repeatPassword"
          autocomplete="new-password"
        />

        <Gap style="height: 28px" />

        <DeepBtn
          label="Create admin account"
          type="submit"
          color="primary"
          style="width: 100%; font-size: 16px; padding: 14px 0px"
          delay
          @click.prevent="createAdmin()"
        />
      </q-form>
    </ResponsiveContainer>
  </q-page>
</template>

<script setup lang="ts">
import { maxNameLength } from '@deeplib/misc';
import { maxEmailLength, w3cEmailRegex } from '@stdlib/misc';
import { getRegistrationValues } from 'src/code/areas/auth/register';
import { deriveUserValues } from 'src/code/crypto';
import { handleError } from 'src/code/utils/misc';
import { zxcvbn } from 'src/code/utils/zxcvbn';

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
    const zxcvbnResult = zxcvbn(password.value);
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
  color: rgba(255, 255, 255, 0.92);

  .login-form,
  .login-form > div {
    color: rgba(255, 255, 255, 0.92);
  }

  /* Labels et champs Quasar */
  :deep(.q-field__label),
  :deep(.q-field__native),
  :deep(.q-field__input),
  :deep(.q-field__control),
  :deep(.q-field .q-field__label) {
    color: rgba(255, 255, 255, 0.92) !important;
  }
  :deep(input),
  :deep(.q-field__native) {
    color: rgba(255, 255, 255, 0.92) !important;
  }
  :deep(input::placeholder) {
    color: rgba(255, 255, 255, 0.5);
  }

  :deep(.q-field--filled .q-field__control::before) {
    background: rgba(255, 255, 255, 0.12);
  }

  :deep(.q-field--filled:hover .q-field__control::before) {
    background: rgba(255, 255, 255, 0.2);
  }

  :deep(.q-field--filled.q-field--focused .q-field__control::before) {
    background: rgba(255, 255, 255, 0.25);
  }

  /* Bouton et son texte visibles */
  :deep(.q-btn) {
    color: #fff !important;
    background: var(--q-primary) !important;
  }
  :deep(.q-btn__content),
  :deep(.q-btn .q-focus-helper + span) {
    color: #fff !important;
  }

  .setup-title {
    color: rgba(255, 255, 255, 0.92) !important;
  }
}
</style>
