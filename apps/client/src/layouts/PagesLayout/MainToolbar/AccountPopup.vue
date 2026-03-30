<template>
  <v-menu
    activator="parent"
    location="bottom end"
    :close-on-content-click="true"
  >
    <v-list density="compact">
      <template v-if="uiStore().loggedIn">
        <v-list-item
          :title="selfUserName().get()"
          style="font-weight: bold"
        />

        <v-divider />

        <slot></slot>

        <v-list-item
          link
          prepend-icon="mdi-account"
          title="Account settings"
          @click="appDialog({ component: AccountSettingsDialog })"
        />
      </template>

      <template v-else>
        <v-list-item
          link
          prepend-icon="mdi-login"
          title="Login"
          :href="multiModePath('/login')"
        />

        <v-list-item
          link
          prepend-icon="mdi-account-plus"
          title="Register"
          :href="multiModePath('/register')"
        />

        <slot></slot>
      </template>

      <v-list-item
        link
        prepend-icon="mdi-help"
        title="Help"
        @click="appDialog({ component: HelpDialog })"
      />

      <v-list-item
        v-if="uiStore().loggedIn"
        link
        prepend-icon="mdi-logout"
        title="Logout"
        @click="logout()"
      />
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { logout } from 'src/code/areas/auth/logout';
import { appDialog } from 'src/code/utils/dialog';
import { selfUserName } from 'src/code/self-user-name';
import { multiModePath } from 'src/code/utils/misc';

import AccountSettingsDialog from './AccountSettingsDialog.vue';
import HelpDialog from './HelpDialog.vue';
</script>
