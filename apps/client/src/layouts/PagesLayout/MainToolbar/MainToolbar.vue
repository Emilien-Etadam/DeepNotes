<template>
  <v-app-bar
    v-show="uiStore().width >= 840"
    elevation="1"
    class="d-none d-md-block main-toolbar-header"
    style="background-color: transparent; z-index: 100; pointer-events: auto"
    app
  >
    <v-toolbar
      class="bg-grey-darken-4"
      style="padding: 0; pointer-events: auto"
    >
      <DeepBtn
        round
        style="
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          min-height: 42px;
          min-width: 42px;
        "
        class="bg-grey-darken-3"
        @click="uiStore().toggleLeftSidebar()"
      >
        <v-icon
          style="position: relative; left: -2px"
          :icon="
            uiStore().leftSidebarExpanded
              ? 'mdi-chevron-left'
              : 'mdi-chevron-right'
          "
        />
      </DeepBtn>

      <div style="flex: 1; width: 0; display: flex">
        <Gap style="width: 8px" />

        <ToolbarContent />

        <Gap style="width: 8px" />

        <v-divider
          vertical
          class="my-0"
          style="margin-top: -5px; margin-bottom: -5px; align-self: stretch"
        />

        <Gap style="width: 8px" />

        <div style="display: flex; align-items: center">
          <template v-if="true">
            <ToolbarBtn
              tooltip="Home"
              icon="mdi-home"
              icon-size="28px"
              round
              :href="multiModePath('/')"
            />

            <Gap style="width: 2px" />
          </template>

          <NotificationsBtn />

          <Gap style="width: 2px" />

          <ToolbarBtn
            tooltip="Pages settings"
            icon="mdi-cog"
            icon-size="28px"
            round
            @click="appDialog({ component: PagesSettingsDialog })"
            :disable="!uiStore().loggedIn"
          />

          <Gap style="width: 2px" />

          <ToolbarBtn
            tooltip="Account"
            icon="mdi-account"
            icon-size="30px"
            round
          >
            <AccountPopup />
          </ToolbarBtn>

          <Gap style="width: 10px" />
        </div>
      </div>

      <DeepBtn
        dense
        round
        style="
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          min-height: 42px;
          min-width: 42px;
        "
        class="bg-grey-darken-3"
        @click="uiStore().toggleRightSidebar()"
      >
        <v-icon
          :icon="
            uiStore().rightSidebarExpanded
              ? 'mdi-chevron-right'
              : 'mdi-chevron-left'
          "
          style="position: relative; right: -2px"
        />
      </DeepBtn>
    </v-toolbar>
  </v-app-bar>
</template>

<script setup lang="ts">
import { multiModePath } from 'src/code/utils/misc';

import AccountPopup from './AccountPopup.vue';
import NotificationsBtn from './Notifications/NotificationsBtn.vue';
import PagesSettingsDialog from './PagesSettingsDialog/PagesSettingsDialog.vue';
import ToolbarContent from './ToolbarContent.vue';

const _quasarMode = process.env.MODE;
</script>

<style scoped lang="scss">
.main-toolbar-header {
  border-bottom: 1px solid $border-subtle;
}

.v-app-bar :deep() {
  transition:
    left 0.2s ease,
    right 0.2s ease;
}
</style>
