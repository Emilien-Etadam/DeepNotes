<template>
  <CustomDialog
    ref="dialogRef"
    v-bind="$attrs"
    card-style="width: 240px"
  >
    <template #header>
      <div style="padding: 12px 20px">
        <div class="text-h5">Accept join request</div>
      </div>
    </template>

    <template #body>
      <div style="padding: 20px; padding-top: 16px">
        Target role:

        <Gap style="height: 8px" />

        <RoleSelect
          v-model="targetRole"
          :options="manageableRoles"
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
          @click.prevent="_acceptJoinRequest()"
        />
      </v-card-actions>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { acceptJoinRequest } from 'src/code/areas/api-interface/groups/join-requests/accept';
import { handleError } from 'src/code/utils/misc';
import RoleSelect from 'src/layouts/PagesLayout/RightSidebar/PageProperties/GroupSettingsDialog/RoleSelect.vue';
import { useRoleSelector } from 'src/layouts/PagesLayout/RightSidebar/PageProperties/GroupSettingsDialog/useRoleSelector';
import type { Ref } from 'vue';

const props = defineProps<{
  groupId: string;
  userIds: string[];
}>();

const dialogRef = ref() as Ref<InstanceType<typeof CustomDialog>>;
const { selectedRole: targetRole, manageableRoles } = useRoleSelector(
  () => props.groupId,
);

async function _acceptJoinRequest() {
  try {
    if (targetRole.value == null) {
      throw new Error('Please select a role.');
    }

    for (const userId of props.userIds) {
      await acceptJoinRequest({
        groupId: props.groupId,
        patientId: userId,
        targetRole: targetRole.value,
      });
    }

    dialogRef.value.onDialogOK();
  } catch (error: any) {
    handleError(error);
  }
}
</script>
