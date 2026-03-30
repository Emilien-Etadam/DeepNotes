<template>
  <CustomDialog
    ref="dialogRef"
    v-bind="$attrs"
    card-style="width: 300px"
  >
    <template #header>
      <div
        style="padding: 12px 20px"
        class="text-h6"
      >
        User details
      </div>
    </template>

    <template #body>
      <div style="position: relative; padding: 20px">
        <TextField
          label="User display name"
          dense
          :model-value="groupMemberNames()(`${groupId}:${userId}`).get().text"
          copy-btn
          readonly
        />

        <Gap style="height: 16px" />

        <TextField
          label="User ID"
          dense
          :model-value="userId"
          copy-btn
          readonly
        />

        <Gap style="height: 16px" />

        <TextField
          label="User public key"
          dense
          :model-value="userPublicKeyBase64"
          copy-btn
          readonly
        />

        <LoadingOverlay v-if="realtimeCtx.loading" />
      </div>
    </template>

    <template #footer>
      <v-card-actions>
        <v-spacer />
        <DeepBtn
          label="Close"
          type="submit"
          flat
          color="primary"
          @click.prevent="dialogRef.onDialogOK()"
        />
      </v-card-actions>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { bytesToBase64 } from '@stdlib/base64';
import { createKeyring } from '@stdlib/crypto';
import { useRealtimeContext } from 'src/code/areas/realtime/context';
import { groupMemberNames } from 'src/code/pages/computed/group-member-names';
import type { Ref } from 'vue';

const dialogRef = ref() as Ref<InstanceType<typeof CustomDialog>>;

const realtimeCtx = useRealtimeContext();

const props = defineProps<{
  groupId: string;
  userId: string;
}>();

const userPublicKeyBase64 = computed(() => {
  const publicKeyringBytes = realtimeCtx.hget(
    'user',
    props.userId,
    'public-keyring',
  );

  if (publicKeyringBytes == null) {
    return '';
  }

  const publicKeyring = createKeyring(publicKeyringBytes);

  return bytesToBase64(publicKeyring.value);
});
</script>
