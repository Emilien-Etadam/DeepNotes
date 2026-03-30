<template>
  <CustomDialog
    ref="dialogRef"
    v-bind="$attrs"
    :max-width="'unset'"
    :card-style="{ 'max-width': 'unset', width: '800px', height: '600px' }"
  >
    <template #header>
      <div style="display: flex">
        <div class="text-h5">Account Settings</div>

        <v-spacer />

        <DeepBtn
          icon="mdi-close"
          color="primary"
          flat
          round
          style="margin: -5px; height: 42px"
          @click="dialogRef.onDialogCancel()"
        />
      </div>
    </template>

    <template #body>
      <div style="flex: 1; height: 100%; min-height: 0; display: flex; padding: 0">
        <v-list style="flex: none; width: 200px; height: 100%; overflow-y: auto">
          <v-list-item
            :active="tab === 'General'"
            prepend-icon="mdi-cog"
            title="General"
            @click="tab = 'General'"
          />
          <v-list-item
            :active="tab === 'Security'"
            prepend-icon="mdi-shield"
            title="Security"
            @click="tab = 'Security'"
          />
          <v-list-item
            :active="tab === 'Invitations'"
            prepend-icon="mdi-account-plus"
            title="Invitations"
            @click="tab = 'Invitations'"
          />
        </v-list>

        <v-divider vertical />

        <div
          style="
            flex: 1;
            min-width: 0;
            padding: 24px 28px;
            overflow-y: auto;
            position: relative;
          "
        >
          <GeneralTab v-if="tab === 'General'" />
          <SecurityTab v-if="tab === 'Security'" />
          <InvitationsTab v-if="tab === 'Invitations'" />
        </div>
      </div>
    </template>

    <template #footer>
      <v-card-actions>
        <v-spacer />
        <DeepBtn
          flat
          label="Close"
          color="primary"
          @click="dialogRef.onDialogOK()"
        />
      </v-card-actions>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';

import GeneralTab from 'src/pages/home/Account/General/General.vue';
import InvitationsTab from 'src/pages/home/Account/Invitations/Invitations.vue';
import SecurityTab from 'src/pages/home/Account/Security/Security.vue';

const dialogRef = ref() as Ref<InstanceType<typeof CustomDialog>>;
const tab = ref('General');

function show() {
  dialogRef.value?.show?.();
}

function hide() {
  dialogRef.value?.hide?.();
}

defineExpose({
  show,
  hide,
});
</script>
