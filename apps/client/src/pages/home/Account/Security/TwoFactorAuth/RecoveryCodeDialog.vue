<template>
  <CustomDialog
    ref="dialogRef"
    :maximized="maximized"
    :card-style="{
      width: maximized ? undefined : '400px',
    }"
  >
    <template #header>
      <q-card-section style="padding: 12px 20px">
        <div class="text-h6">Save your Recovery Codes</div>
      </q-card-section>
    </template>

    <template #body>
      <q-card-section
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
            <q-btn
              color="primary"
              style="width: 38px"
              @click="
                async () => {
                  await setClipboardText(recoveryCodes.join('\n'));

                  $q.notify({
                    message: 'Copied to clipboard.',
                    type: 'positive',
                  });
                }
              "
            >
              <q-icon
                name="mdi-content-copy"
                size="23px"
                class="cursor-pointer"
                style="margin-right: -3px"
              >
                <q-tooltip
                  anchor="top middle"
                  self="bottom middle"
                  transition-show="jump-up"
                  transition-hide="jump-down"
                >
                  Copy
                </q-tooltip>
              </q-icon>
            </q-btn>

            <Gap style="height: 16px" />

            <q-btn
              color="primary"
              style="width: 38px"
              @click="
                download(
                  recoveryCodes.join('\n'),
                  'DeepNotes recovery codes.txt',
                  'text/plain',
                )
              "
            >
              <q-icon
                name="mdi-download"
                size="23px"
                class="cursor-pointer"
                style="margin-right: -3px"
              >
                <q-tooltip
                  anchor="top middle"
                  self="bottom middle"
                  transition-show="jump-up"
                  transition-hide="jump-down"
                >
                  Download
                </q-tooltip>
              </q-icon>
            </q-btn>

            <Gap style="height: 16px" />

            <q-btn
              color="primary"
              style="width: 38px"
              @click="printRecoveryCodes"
            >
              <q-icon
                name="mdi-printer"
                size="23px"
                class="cursor-pointer"
                style="margin-right: -3px"
              >
                <q-tooltip
                  anchor="top middle"
                  self="bottom middle"
                  transition-show="jump-up"
                  transition-hide="jump-down"
                >
                  Print
                </q-tooltip>
              </q-icon>
            </q-btn>
          </div>
        </div>

        <Gap style="height: 24px" />

        <div style="color: red">These won't be displayed again.</div>
        <div>Make sure to store them in a safe and accessible place.</div>
      </q-card-section>
    </template>

    <template #footer>
      <q-card-actions align="right">
        <DeepBtn
          flat
          label="Finish"
          color="positive"
          @click="dialogRef.onDialogOK()"
        />
      </q-card-actions>
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
