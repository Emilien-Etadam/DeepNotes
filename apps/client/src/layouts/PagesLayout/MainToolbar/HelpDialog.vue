<template>
  <CustomDialog
    ref="dialogRef"
    v-bind="$attrs"
    :max-width="'unset'"
    :card-style="{ 'max-width': 'unset', width: '800px', height: '600px' }"
  >
    <template #header>
      <div style="display: flex">
        <div class="text-h5">Help</div>

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
      <div style="flex: 1; min-height: 0; overflow-y: auto; padding: 24px 28px">
        <template v-if="section === 'main'">
          <div style="font-size: 36px; font-weight: bold; text-align: center">Help</div>

          <Gap style="height: 40px" />

          <div class="help-section">
            <div class="help-section-title">Getting started</div>
            <ul class="help-list">
              <li>
                <a @click.prevent="section = 'what-is-deepnotes'">What is DeepNotes?</a>
              </li>
              <li>
                <a @click.prevent="section = 'canvas-navigation'">Navigating the canvas</a>
              </li>
              <li>
                <a @click.prevent="section = 'notes-and-arrows'">Creating notes and arrows</a>
              </li>
              <li>
                <a @click.prevent="section = 'export-for-ai'">Exporting a page for AI</a>
              </li>
              <li>
                <a @click.prevent="section = 'keyboard-shortcuts'">Keyboard shortcuts</a>
              </li>
            </ul>
          </div>

          <div class="help-section">
            <div class="help-section-title">Collaboration</div>
            <ul class="help-list">
              <li>
                <a @click.prevent="section = 'creating-group'">Creating a group</a>
              </li>
              <li>
                <a @click.prevent="section = 'inviting-users'">Inviting users to a group</a>
              </li>
              <li>
                <a @click.prevent="section = 'joining-group'">Joining a group</a>
              </li>
            </ul>
          </div>

          <div class="help-section">
            <div class="help-section-title">Security & data</div>
            <ul class="help-list">
              <li>
                <a @click.prevent="section = 'encryption'">End-to-end encryption</a>
              </li>
              <li>
                <a @click.prevent="section = 'forgot-password'">Forgotten password</a>
              </li>
            </ul>
          </div>
        </template>

        <template v-else>
          <DeepBtn
            flat
            color="primary"
            prepend-icon="mdi-arrow-left"
            label="Back"
            style="margin-bottom: 16px"
            @click="section = 'main'"
          />

          <WhatIsDeepNotesPage v-if="section === 'what-is-deepnotes'" />
          <CanvasNavigationPage v-if="section === 'canvas-navigation'" />
          <NotesAndArrowsPage v-if="section === 'notes-and-arrows'" />
          <ExportForAIPage v-if="section === 'export-for-ai'" />
          <KeyboardShortcutsPage v-if="section === 'keyboard-shortcuts'" />
          <CreatingGroupPage v-if="section === 'creating-group'" />
          <InvitingUsersPage v-if="section === 'inviting-users'" />
          <JoiningGroupPage v-if="section === 'joining-group'" />
          <EncryptionPage v-if="section === 'encryption'" />
          <ForgotPasswordPage v-if="section === 'forgot-password'" />
        </template>
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

import CanvasNavigationPage from 'src/pages/home/Help/Pages/CanvasNavigation.vue';
import CreatingGroupPage from 'src/pages/home/Help/Pages/CreatingGroup.vue';
import EncryptionPage from 'src/pages/home/Help/Pages/Encryption.vue';
import ExportForAIPage from 'src/pages/home/Help/Pages/ExportForAI.vue';
import ForgotPasswordPage from 'src/pages/home/Help/Pages/ForgotPassword.vue';
import InvitingUsersPage from 'src/pages/home/Help/Pages/InvitingUsers.vue';
import JoiningGroupPage from 'src/pages/home/Help/Pages/JoiningGroup.vue';
import KeyboardShortcutsPage from 'src/pages/home/Help/Pages/KeyboardShortcuts.vue';
import NotesAndArrowsPage from 'src/pages/home/Help/Pages/NotesAndArrows.vue';
import WhatIsDeepNotesPage from 'src/pages/home/Help/Pages/WhatIsDeepNotes.vue';

const dialogRef = ref() as Ref<InstanceType<typeof CustomDialog>>;
const section = ref('main');

function show() {
  section.value = 'main';
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

<style scoped lang="scss">
.help-section {
  margin-bottom: $sp-7;
}

.help-section-title {
  font-size: $fs-lg;
  font-weight: bold;
  color: $text-secondary;
  margin-bottom: $sp-3;
}

.help-list {
  padding-left: 48px;
  font-size: $fs-subtitle;
  font-weight: bold;

  > li {
    margin-bottom: $sp-2;
  }

  > li::marker {
    font-size: $fs-xl;
  }

  a {
    color: $color-link;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
