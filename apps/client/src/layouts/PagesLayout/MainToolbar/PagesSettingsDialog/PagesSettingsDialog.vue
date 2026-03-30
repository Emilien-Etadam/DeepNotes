<template>
  <CustomDialog
    ref="dialogRef"
    v-bind="$attrs"
    :max-width="'unset'"
    :maximized="maximized"
    :card-style="{
      'max-width': 'unset',
      width: maximized ? undefined : '800px',
      height: maximized ? undefined : '600px',
    }"
  >
    <template #header>
      <div style="display: flex">
        <div class="text-h5">Pages Settings</div>

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

      <template v-if="maximized">
        <v-divider />

        <v-tabs
          v-model="tab"
          :show-arrows="true"
        >
          <v-tab
            value="General"
            prepend-icon="mdi-account"
          >
            General
          </v-tab>
          <v-tab
            value="Groups"
            prepend-icon="mdi-account-group"
          >
            Groups
          </v-tab>
          <v-tab
            value="Join invitations"
            prepend-icon="mdi-calendar"
          >
            Join invitations
          </v-tab>
          <v-tab
            value="Join requests"
            prepend-icon="mdi-account-multiple-plus"
          >
            Join requests
          </v-tab>
        </v-tabs>
      </template>
    </template>

    <template #body>
      <div style="flex: 1; height: 100%; min-height: 0; display: flex; padding: 0">
        <template v-if="!maximized">
          <v-list style="flex: none; width: 200px; height: 100%; overflow-y: auto">
            <TabBtn
              name="General"
              icon="mdi-account"
              :current-tab="tab"
              @set-tab="(targetTab: string) => (tab = targetTab)"
            />
            <TabBtn
              name="Groups"
              icon="mdi-account-group"
              :current-tab="tab"
              @set-tab="(targetTab: string) => (tab = targetTab)"
            />
            <TabBtn
              name="Join invitations"
              icon="mdi-calendar"
              :current-tab="tab"
              @set-tab="(targetTab: string) => (tab = targetTab)"
            />
            <TabBtn
              name="Join requests"
              icon="mdi-account-multiple-plus"
              :current-tab="tab"
              @set-tab="(targetTab: string) => (tab = targetTab)"
            />
          </v-list>

          <v-divider vertical />
        </template>

        <div
          style="
            flex: 1;
            padding: 32px;
            display: flex;
            flex-direction: column;
            position: relative;
          "
        >
          <GeneralTab v-if="tab === 'General'" />
          <GroupsTab v-if="tab === 'Groups'" />
          <InvitationsTab v-if="tab === 'Join invitations'" />
          <RequestsTab v-if="tab === 'Join requests'" />

          <LoadingOverlay v-if="!mounted" />
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
import { watchUntilTrue } from '@stdlib/vue';
import { useRealtimeContext } from 'src/code/areas/realtime/context';
import { handleError } from 'src/code/utils/misc';
import type { Ref } from 'vue';

import GeneralTab from './GeneralTab.vue';
import GroupsTab from './GroupsTab.vue';
import InvitationsTab from './InvitationsTab.vue';
import RequestsTab from './RequestsTab.vue';

const dialogRef = ref() as Ref<InstanceType<typeof CustomDialog>>;
provide('dialog', dialogRef);

const maximized = computed(
  () => uiStore().width < 800 || uiStore().height < 600,
);

const tab = ref('General');

const groupIds = ref<string[]>([]);
provide('groupIds', groupIds);

const realtimeCtx = useRealtimeContext();
provide('realtimeCtx', realtimeCtx);

const mounted = ref(false);

onMounted(async () => {
  try {
    groupIds.value = await trpcClient.users.pages.getGroupIds.query();

    await watchUntilTrue(() => !internals.realtime.loading);

    mounted.value = true;
  } catch (error: any) {
    handleError(error);
  }
});

// Programmatic dialogs call `show()` on the mounted component instance.
// This component is a wrapper around `CustomDialog`, so we forward `show/hide`
// to ensure `appDialog({ component: PagesSettingsDialog })` works.
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
