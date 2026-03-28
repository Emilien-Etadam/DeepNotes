<template>
  <div class="login-page">
    <ResponsiveContainer style="padding: 120px 32px">
      <div
        v-if="loading"
        style="margin: 0 auto; max-width: 270px; text-align: center"
      >
        Loading…
      </div>

      <div
        v-else-if="!valid"
        style="margin: 0 auto; max-width: 270px; text-align: center"
      >
        <template v-if="expired"> This invitation has expired. </template>
        <template v-else> Invalid invitation link. </template>
        <Gap style="height: 16px" />
        <DeepBtn
          label="Go to login"
          color="primary"
          :to="{ name: 'login' }"
        />
      </div>

      <form
        v-else
        class="login-form"
        style="margin: 0px auto; max-width: 270px"
        @submit.prevent="completeRegistration()"
      >
        <div
          style="
            text-align: center;
            margin-bottom: 24px;
            font-size: 18px;
            font-weight: 500;
          "
        >
          Set your password
        </div>
        <div
          v-if="emailMasked"
          style="
            text-align: center;
            margin-bottom: 16px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
          "
        >
          for {{ emailMasked }}
        </div>

        <TextField
          label="Email"
          label-color="grey-5"
          v-model="email"
          :maxlength="maxEmailLength"
          readonly
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
          label="Create account"
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
  title: 'Accept invitation - DeepNotes',
}));

const routeRef = route();
const token = computed(() => routeRef.value.params.token as string);

const loading = ref(true);
const valid = ref(false);
const expired = ref(false);
const emailMasked = ref<string | null>(null);

const email = ref('');
const userName = ref('');
const password = ref('');
const repeatPassword = ref('');

onMounted(async () => {
  try {
    const res = await trpcClient.users.invites.getInvite.query({
      token: token.value,
    });
    loading.value = false;
    valid.value = res.valid;
    expired.value = res.expired;
    emailMasked.value = res.emailMasked;
    if (res.email) email.value = res.email;
  } catch {
    loading.value = false;
    valid.value = false;
  }
});

async function completeRegistration() {
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
      showNotify({
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

    await trpcClient.users.invites.completeRegistrationWithInvite.mutate({
      token: token.value,
      email: email.value,
      loginHash: derivedUserValues.loginHash,
      ...registrationValues,
    });

    showNotify({
      message: 'Account created. You can now log in.',
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

  :deep(.v-field__label),
  :deep(.v-label),
  :deep(.v-field input),
  :deep(.v-field textarea) {
    color: $text-primary;
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
}
</style>
