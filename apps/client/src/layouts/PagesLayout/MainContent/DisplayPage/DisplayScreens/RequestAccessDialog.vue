<template>
  <CustomDialog
    ref="dialogRef"
    v-bind="$attrs"
    card-style="width: 250px"
  >
    <template #header>
      <div style="padding: 12px 20px">
        <div class="text-h5">Request access</div>
      </div>
    </template>

    <template #body>
      <div
        style="
          padding: 20px;
          display: flex;
          flex-direction: column;
          position: relative;
        "
      >
        <TextField
          label="Your in-group name"
          v-model="userName"
          :maxlength="maxNameLength"
        />

        <LoadingOverlay v-if="loading" />
      </div>
    </template>

    <template #footer>
      <v-card-actions style="padding: 12px 20px">
        <v-spacer />

        <DeepBtn
          flat
          label="Cancel"
          color="primary"
          @click="dialogRef.onDialogCancel()"
        />

        <DeepBtn
          label="Ok"
          type="submit"
          flat
          color="primary"
          :disable="loading"
          @click="_sendJoinRequest()"
        />
      </v-card-actions>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { maxNameLength } from '@deeplib/misc';
import { sendJoinRequest } from 'src/code/areas/api-interface/groups/join-requests/send';
import { selfUserName } from 'src/code/self-user-name';
import { handleError } from 'src/code/utils/misc';
import type { Ref } from 'vue';

const props = defineProps<{
  groupId: string;
}>();

const dialogRef = ref() as Ref<InstanceType<typeof CustomDialog>>;

const loading = ref(true);

const userName = ref('');

onMounted(async () => {
  userName.value = await selfUserName().getAsync();

  loading.value = false;
});

async function _sendJoinRequest() {
  try {
    await sendJoinRequest({
      groupId: props.groupId,

      userName: userName.value,
    });

    dialogRef.value.onDialogOK();
  } catch (error: any) {
    handleError(error);
  }
}
</script>
