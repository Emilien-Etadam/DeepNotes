<template>
  <div
    v-if="uiStore().width < 840"
    style="
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      pointer-events: none;
    "
  >
    <template
      v-if="
        uiStore().width >= 570 ||
        (uiStore().width < 570 &&
          !uiStore().leftSidebarExpanded &&
          !uiStore().rightSidebarExpanded)
      "
    >
      <div
        style="
          position: absolute;
          left: 60px;
          top: 8px;
          pointer-events: none;
          display: flex;
        "
      >
        <DisplayBtn
          icon="mdi-hammer-wrench"
          tooltip="Basic"
        >
          <v-menu
            activator="parent"
            :close-on-content-click="true"
            :offset="4"
            location="bottom"
          >
            <div style="padding: 1px 5px">
              <BasicBtns popup />
            </div>
          </v-menu>
        </DisplayBtn>

        <Gap style="width: 4px" />

        <DisplayBtn
          icon="mdi-format-color-text"
          tooltip="Formatting"
        >
          <v-menu
            activator="parent"
            :close-on-content-click="true"
            :offset="4"
            location="bottom"
          >
            <div style="padding: 1px 5px">
              <FormattingBtns popup />
            </div>
          </v-menu>
        </DisplayBtn>

        <Gap style="width: 4px" />

        <DisplayBtn
          icon="mdi-format-list-bulleted"
          tooltip="Objects"
        >
          <v-menu
            activator="parent"
            :close-on-content-click="true"
            :offset="4"
            location="bottom"
          >
            <div style="padding: 1px 5px">
              <ObjectBtns popup />
            </div>
          </v-menu>
        </DisplayBtn>

        <Gap style="width: 4px" />

        <DisplayBtn
          icon="mdi-align-horizontal-left"
          tooltip="Alignment"
        >
          <v-menu
            activator="parent"
            :close-on-content-click="true"
            :offset="4"
            location="bottom"
          >
            <div style="padding: 1px 5px">
              <AlignmentBtns popup />
            </div>
          </v-menu>
        </DisplayBtn>
      </div>

      <DisplayBtn
        icon="mdi-menu"
        tooltip="Menu"
        style="position: absolute; right: 60px; top: 8px"
      >
        <AccountPopup>
          <v-list-item
            link
            prepend-icon="mdi-home"
            title="Home"
            :href="multiModePath('/')"
          />

          <div @click.stop>
            <v-list-item>
              <template #prepend>
                <span
                  style="
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                  "
                >
                  <v-icon icon="mdi-bell" />
                  <NotificationsBadge />
                </span>
              </template>

              <v-list-item-title>Notifications</v-list-item-title>

              <NotificationsPopup />
            </v-list-item>
          </div>

          <v-list-item
            link
            prepend-icon="mdi-cog"
            title="Pages settings"
            @click="appDialog({ component: PagesSettingsDialog })"
          />
        </AccountPopup>
      </DisplayBtn>
    </template>

    <DeepBtn
      v-if="!(uiStore().rightSidebarExpanded && uiStore().width < 458)"
      round
      style="
        position: absolute;
        left: 0px;
        top: 6px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        min-height: 42px;
        min-width: 42px;
        pointer-events: auto;
      "
      class="bg-grey-9"
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

    <DeepBtn
      v-if="!(uiStore().leftSidebarExpanded && uiStore().width < 458)"
      dense
      round
      style="
        position: absolute;
        right: 0px;
        top: 6px;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        min-height: 42px;
        min-width: 42px;
        pointer-events: auto;
      "
      class="bg-grey-9"
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
  </div>
</template>

<script setup lang="ts">
import { appDialog } from 'src/code/utils/dialog';
import { multiModePath } from 'src/code/utils/misc';

import AccountPopup from '../../MainToolbar/AccountPopup.vue';
import AlignmentBtns from '../../MainToolbar/AlignmentBtns.vue';
import BasicBtns from '../../MainToolbar/BasicBtns.vue';
import FormattingBtns from '../../MainToolbar/FormattingBtns.vue';
import NotificationsBadge from '../../MainToolbar/Notifications/NotificationsBadge.vue';
import NotificationsPopup from '../../MainToolbar/Notifications/NotificationsPopup.vue';
import ObjectBtns from '../../MainToolbar/ObjectBtns.vue';
import PagesSettingsDialog from '../../MainToolbar/PagesSettingsDialog/PagesSettingsDialog.vue';

</script>
