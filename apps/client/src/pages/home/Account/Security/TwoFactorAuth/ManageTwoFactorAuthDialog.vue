<template>
  <CustomDialog
    ref="dialogRef"
    v-bind="$attrs"
    :maximized="maximized"
    :card-style="{
      display: 'flex',
      'flex-direction': 'column',
      position: 'relative',
      width: maximized ? undefined : '400px',
    }"
  >
    <template #header>
      <div style="padding: 12px 20px">
        <div class="text-h5">Two-factor authentication</div>
      </div>
    </template>

    <template #body>
      <div
        style="
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        "
      >
        <div
          style="padding: 20px; display: flex; flex-direction: column"
        >
          <div>Scan the following QR code to add another device:</div>

          <Gap style="height: 8px" />

          <div>
            <canvas
              ref="canvasElem"
              width="175"
              height="175"
            ></canvas>
          </div>

          <Gap style="height: 8px" />

          <div>Or use the following code:</div>

          <Gap style="height: 8px" />

          <TextField
            :model-value="secret"
            readonly
            dense
            copy-btn
          />

          <Gap style="height: 16px" />

          <DeepBtn
            label="Forget trusted devices"
            color="primary"
            @click="forgetTrustedDevices()"
          />
        </div>

        <v-divider />

        <div
          style="flex: 1; padding: 20px; display: flex; flex-direction: column"
        >
          <div>
            If you lose access to your authenticator app, your recovery codes
            will be the only way to regain access to your account:
          </div>

          <Gap style="height: 12px" />

          <DeepBtn
            label="Regenerate recovery codes"
            color="primary"
            @click="regenerateRecoveryCodes()"
          />
        </div>

        <v-divider />

        <div
          style="padding: 20px; display: flex; flex-direction: column"
        >
          <DeepBtn
            label="Disable two-factor authentication"
            color="negative"
            @click="disableTwoFactorAuth()"
          />
        </div>

        <LoadingOverlay v-if="loading" />
      </div>
    </template>

    <template #footer>
      <v-card-actions>
        <v-spacer />

        <DeepBtn
          flat
          label="Close"
          color="primary"
          @click="dialogRef.onDialogCancel()"
        />
      </v-card-actions>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { BREAKPOINT_SM_MIN, sleep } from '@stdlib/misc';
import QRCode from 'qrcode';
import { asyncDialog, handleError } from 'src/code/utils/misc';
import type { Ref } from 'vue';

import RecoveryCodeDialog from './RecoveryCodeDialog.vue';

const dialogRef = ref() as Ref<InstanceType<typeof CustomDialog>>;

const props = defineProps<{
  loginHash: Uint8Array;
  secret: string;
  keyUri: string;
}>();

const maximized = computed(() => uiStore().width < BREAKPOINT_SM_MIN);

const canvasElem = ref<HTMLElement>();

const loading = ref(true);

onMounted(async () => {
  await sleep();

  await QRCode.toCanvas(canvasElem.value, props.keyUri, {
    width: 175,
  });

  loading.value = false;
});

async function forgetTrustedDevices() {
  try {
    await asyncDialog({
      title: 'Forget trusted devices',
      message:
        'Are you sure you want to forget trusted devices in regard to two-factor authentication?',

      focus: 'cancel',

      cancel: { label: 'No', flat: true, color: 'primary' },
      ok: { label: 'Yes', flat: true, color: 'negative' },
    });

    await trpcClient.users.account.twoFactorAuth.forgetTrustedDevices.mutate({
      loginHash: props.loginHash,
    });

    showNotify({
      message: 'All trusted devices have been forgotten.',
      type: 'positive',
    });
  } catch (error: any) {
    handleError(error);
  }
}

async function regenerateRecoveryCodes() {
  try {
    await asyncDialog({
      title: 'Regenerate recovery codes',
      message: 'Are you sure you want to regenerate the recovery codes?',

      focus: 'cancel',

      cancel: { label: 'No', flat: true, color: 'primary' },
      ok: { label: 'Yes', flat: true, color: 'negative' },
    });

    const recoveryCodes =
      await trpcClient.users.account.twoFactorAuth.generateRecoveryCodes.mutate(
        { loginHash: props.loginHash },
      );

    appDialog({
      component: RecoveryCodeDialog,

      componentProps: {
        recoveryCodes,
      },
    });
  } catch (error: any) {
    handleError(error);
  }
}

async function disableTwoFactorAuth() {
  try {
    await asyncDialog({
      title: 'Disable two-factor authentication',
      message: 'Are you sure you want to disable two-factor authentication?',

      focus: 'cancel',

      cancel: { label: 'No', flat: true, color: 'primary' },
      ok: { label: 'Yes', flat: true, color: 'negative' },
    });

    await trpcClient.users.account.twoFactorAuth.disable.mutate({
      loginHash: props.loginHash,
    });

    showNotify({
      message: 'Two-factor authentication has been disabled.',
      type: 'positive',
    });

    dialogRef.value.onDialogOK();
  } catch (error: any) {
    handleError(error);
  }
}
</script>
