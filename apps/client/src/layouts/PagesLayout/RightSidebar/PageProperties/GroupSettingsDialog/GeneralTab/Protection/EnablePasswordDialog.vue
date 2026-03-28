<template>
  <CustomDialog
    ref="dialogRef"
    card-style="width: 300px"
  >
    <template #header>
      <div style="padding: 12px 20px">
        <div class="text-h6">Password protection</div>
      </div>
    </template>

    <template #body>
      <div style="padding: 24px">
        <EvaluatedPasswordField
          label="New password"
          dense
          v-model="password"
        />

        <Gap style="height: 20px" />

        <PasswordField
          label="Repeat new password"
          dense
          v-model="repeatPassword"
        />
      </div>
    </template>

    <template #footer>
      <v-card-actions>
        <v-spacer />
        <DeepBtn
          flat
          label="Cancel"
          color="negative"
          @click="dialogRef.onDialogCancel()"
        />

        <DeepBtn
          label="Ok"
          type="submit"
          flat
          color="primary"
          delay
          @click.prevent="enablePasswordProtection"
        />
      </v-card-actions>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { asyncDialog, handleError } from 'src/code/utils/misc';
import { zxcvbnAsync } from 'src/code/utils/zxcvbn';
import type { Ref } from 'vue';

const dialogRef = ref() as Ref<InstanceType<typeof CustomDialog>>;

const password = ref('');
const repeatPassword = ref('');

async function enablePasswordProtection() {
  try {
    if (password.value !== repeatPassword.value) {
      throw new Error('Passwords do not match.');
    }

    if ((await zxcvbnAsync(password.value)).score <= 2) {
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

    dialogRef.value.onDialogOK(password.value);
  } catch (error) {
    handleError(error);
  }
}
</script>
