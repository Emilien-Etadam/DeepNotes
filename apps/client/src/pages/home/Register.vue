<template>
  <div>
    <ResponsiveContainer style="padding: 120px 32px">
      <form
        style="margin: 0px auto; max-width: 270px"
        @submit.prevent="register()"
      >
        <TextField
          v-model="email"
          label-color="grey-5"
          :maxlength="maxEmailLength"
        >
          <template #label>
            Email

            <v-icon
              icon="mdi-information"
              size="18"
              style="margin-top: -4px; pointer-events: auto; vertical-align: middle"
            >
              <v-tooltip
                activator="parent"
                location="top"
              >
                <span style="max-width: 230px; display: inline-block">
                  This is the only information readable to the server. Used for
                  user identification and communication.
                </span>
              </v-tooltip>
            </v-icon>
          </template>
        </TextField>

        <Gap style="height: 12px" />

        <TextField
          v-model="userName"
          label-color="grey-5"
          :maxlength="maxNameLength"
        >
          <template #label>
            Display name

            <v-icon
              icon="mdi-information"
              size="18"
              style="margin-top: -4px; pointer-events: auto; vertical-align: middle"
            >
              <v-tooltip
                activator="parent"
                location="top"
              >
                <span style="max-width: 165px; display: inline-block">
                  This value is encrypted, unreadable to the server.
                </span>
              </v-tooltip>
            </v-icon>
          </template>
        </TextField>

        <Gap style="height: 12px" />

        <EvaluatedPasswordField
          label="Password"
          stack-label
          v-model="password"
        />

        <Gap style="height: 12px" />

        <PasswordField
          label="Repeat password"
          stack-label
          v-model="repeatPassword"
        />

        <Gap style="height: 20px" />

        <div style="display: flex">
          <Checkbox
            v-model="agree"
            style="flex: none"
          />

          <div style="flex: 1">
            I have read and agree to the Terms of Service.
          </div>
        </div>

        <Gap style="height: 28px" />

        <DeepBtn
          label="Create account"
          type="submit"
          color="primary"
          style="width: 100%; font-size: 14px; padding: 14px 0px"
          delay
        />
      </form>

      <Gap style="height: 16px" />

      <div style="text-align: center">
        Already registered?

        <router-link :to="{ name: 'login', query: $route.query }">
          Log in
        </router-link>
      </div>
    </ResponsiveContainer>
  </div>
</template>

<script setup lang="ts">
import { maxNameLength } from '@deeplib/misc';
import { maxEmailLength, w3cEmailRegex } from '@stdlib/misc';
import { getRegistrationValues } from 'src/code/areas/auth/register';
import { deriveUserValues } from 'src/code/crypto';
import { asyncDialog, handleError } from 'src/code/utils/misc';
import { zxcvbnAsync } from 'src/code/utils/zxcvbn';

useMeta(() => ({
  title: 'Register - DeepNotes',
}));

const email = ref('');
const userName = ref('');
const password = ref('');
const repeatPassword = ref('');

const agree = ref(false);

async function register() {
  try {
    // Check if email is valid

    if (!w3cEmailRegex.test(email.value)) {
      throw new Error('Email is invalid.');
    }

    // Check if display name is empty

    if (userName.value === '') {
      throw new Error('Display name cannot be empty.');
    }

    // Password validation

    if (password.value !== repeatPassword.value) {
      throw new Error('Passwords do not match.');
    }

    // Check password strength

    const zxcvbnResult = await zxcvbnAsync(password.value);

    if (zxcvbnResult.score <= 0) {
      showNotify({
        html: true,
        message: 'Password is too weak.<br/>Please use a stronger password.',
        type: 'negative',
      });

      return;
    }

    if (zxcvbnResult.score <= 2) {
      await asyncDialog({
        title: 'Weak password',
        html: true,
        message:
          'Your password is relatively weak.<br/>Are you sure you want to continue?',
        style: { width: 'max-content', padding: '4px 8px' },

        focus: 'cancel',

        cancel: { label: 'No', flat: true, color: 'primary' },
        ok: { label: 'Yes', flat: true, color: 'negative' },
      });
    }

    if (!agree.value) {
      throw new Error(
        'You must agree to the Terms of Service and Privacy Policy.',
      );
    }

    const derivedUserValues = await deriveUserValues({
      email: email.value,
      password: password.value,
    });

    const registrationValues = await getRegistrationValues({
      derivedUserValues,
      userName: userName.value,
    });

    await trpcClient.users.account.register.mutate({
      email: email.value,
      loginHash: derivedUserValues.loginHash,

      ...registrationValues,
    });

    internals.sessionStorage.setItem('email', email.value);

    if (process.env.SEND_EMAILS === 'false') {
      showNotify({
        message: 'User registered successfully.',
        type: 'positive',
      });

      await router().push({ name: 'login' });
    } else {
      showNotify({
        message: 'Verification email sent.',
        type: 'positive',
      });

      await router().push({
        name: 'finish-registration',
        query: route().value.query,
      });
    }
  } catch (error: any) {
    handleError(error);
  }
}
</script>
