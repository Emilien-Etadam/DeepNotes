<template>
  <CustomDialog
    ref="dialogRef"
    v-bind="$attrs"
    :maximized="maximized"
    :card-style="{
      width: maximized ? undefined : '400px',
    }"
  >
    <template #header>
      <div style="padding: 12px 20px">
        <div class="text-h5">Save your Recovery Codes</div>
      </div>
    </template>

    <template #body>
      <div
        style="flex: 1; padding: 20px; display: flex; flex-direction: column"
      >
        <div>
          These are one-time use recovery codes that can be used to access your
          account in case you lose access to your authenticator app:
        </div>

        <Gap style="height: 24px" />

        <div style="display: flex">
          <div
            class="recovery-codes"
            style="flex: 1; font-weight: bold"
          >
            <div
              v-for="recoveryCode in recoveryCodes"
              :key="recoveryCode"
            >
              {{ recoveryCode }}
            </div>
          </div>

          <Gap style="width: 16px" />

          <div style="flex: none; display: flex; flex-direction: column">
            <v-btn
              color="primary"
              style="width: 38px; min-width: 38px"
              @click="copyRecoveryCodes()"
            >
              <v-icon
                icon="mdi-content-copy"
                size="23"
                class="cursor-pointer"
                style="margin-right: -3px"
              />
              <v-tooltip
                activator="parent"
                location="top"
              >
                Copy
              </v-tooltip>
            </v-btn>

            <Gap style="height: 16px" />

            <v-btn
              color="primary"
              style="width: 38px; min-width: 38px"
              @click="
                download(
                  recoveryCodes.join('\n'),
                  'DeepNotes recovery codes.txt',
                  'text/plain',
                )
              "
            >
              <v-icon
                icon="mdi-download"
                size="23"
                class="cursor-pointer"
                style="margin-right: -3px"
              />
              <v-tooltip
                activator="parent"
                location="top"
              >
                Download
              </v-tooltip>
            </v-btn>

            <Gap style="height: 16px" />

            <v-btn
              color="primary"
              style="width: 38px; min-width: 38px"
              @click="printRecoveryCodes"
            >
              <v-icon
                icon="mdi-printer"
                size="23"
                class="cursor-pointer"
                style="margin-right: -3px"
              />
              <v-tooltip
                activator="parent"
                location="top"
              >
                Print
              </v-tooltip>
            </v-btn>
          </div>
        </div>

        <Gap style="height: 24px" />

        <div style="color: red">These won't be displayed again.</div>
        <div>Make sure to store them in a safe and accessible place.</div>
      </div>
    </template>

    <template #footer>
      <v-card-actions>
        <v-spacer />

        <DeepBtn
          flat
          label="Finish"
          color="positive"
          @click="dialogRef.onDialogOK()"
        />
      </v-card-actions>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { BREAKPOINT_SM_MIN } from '@stdlib/misc';
import download from 'downloadjs';
import { setClipboardText } from 'src/code/utils/clipboard';
import type { Ref } from 'vue';

const dialogRef = ref() as Ref<InstanceType<typeof CustomDialog>>;

const props = defineProps<{
  recoveryCodes: string[];
}>();

const maximized = computed(() => uiStore().width < BREAKPOINT_SM_MIN);

const recoveryCodes = ref(props.recoveryCodes);

async function copyRecoveryCodes() {
  await setClipboardText(recoveryCodes.value.join('\n'));

  showNotify({
    message: 'Copied to clipboard.',
    type: 'positive',
  });
}

function printRecoveryCodes() {
  const newWindow = globalThis.open('', 'Print');

  if (newWindow == null) {
    return;
  }

  const pre = newWindow.document.createElement('pre');
  pre.textContent = recoveryCodes.value.join('\n');
  newWindow.document.body.appendChild(pre);

  newWindow.print();
  newWindow.close();
}
</script>

<style scoped lang="scss">
.recovery-codes :deep(*) {
  font-family: $font-mono;

  font-size: $fs-subtitle;
}
</style>
