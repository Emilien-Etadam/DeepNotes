<template>
  <template v-if="uiStore().loggedIn || uiStore().width < BREAKPOINT_LG_MIN">
    <Gap style="width: 20px" />

    <ToolbarBtn
      :icon="uiStore().loggedIn ? 'mdi-account-circle' : 'mdi-menu'"
      :icon-size="uiStore().loggedIn ? '38px' : '32px'"
      :btn-size="uiStore().loggedIn ? '36px' : '46px'"
      :round="uiStore().loggedIn"
    >
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
              :ripple="false"
            />

            <v-divider />
          </template>

          <template
            v-if="!uiStore().loggedIn && uiStore().width < BREAKPOINT_MD_MIN"
          >
            <v-list-item
              link
              :to="{ name: 'login' }"
              prepend-icon="mdi-login"
              title="Login"
            />
          </template>

          <template v-if="uiStore().loggedIn">
            <v-list-item
              link
              :to="{ name: 'account/general' }"
              prepend-icon="mdi-account"
              title="Account settings"
            />
          </template>

          <template v-if="uiStore().width < BREAKPOINT_LG_MIN">
            <v-list-item
              link
              :to="{ name: 'help' }"
              prepend-icon="mdi-help"
              title="Help"
            />
          </template>

          <template v-if="uiStore().loggedIn">
            <v-list-item
              link
              prepend-icon="mdi-logout"
              title="Logout"
              @click="logout()"
            />
          </template>
        </v-list>
      </v-menu>
    </ToolbarBtn>
  </template>
</template>

<script setup lang="ts">
import { BREAKPOINT_LG_MIN, BREAKPOINT_MD_MIN } from '@stdlib/misc';
import { logout } from 'src/code/areas/auth/logout';
import { selfUserName } from 'src/code/self-user-name';
</script>
