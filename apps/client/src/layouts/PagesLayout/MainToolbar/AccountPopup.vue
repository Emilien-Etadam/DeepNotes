<template>
  <q-menu
    anchor="bottom right"
    self="top right"
  >
    <q-list>
      <template v-if="uiStore().loggedIn">
        <q-item>
          <q-item-section style="font-weight: bold">
            <q-item-label>
              {{ selfUserName().get() }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator />

        <slot></slot>

        <q-item
          clickable
          v-close-popup
          :href="multiModePath('/account/general')"
        >
          <q-item-section avatar>
            <q-icon name="mdi-account" />
          </q-item-section>
          <q-item-section>Account settings</q-item-section>
        </q-item>
      </template>

      <template v-else>
        <q-item
          clickable
          v-close-popup
          :href="multiModePath('/login')"
        >
          <q-item-section avatar>
            <q-icon name="mdi-login" />
          </q-item-section>
          <q-item-section>Login</q-item-section>
        </q-item>

        <q-item
          clickable
          v-close-popup
          :href="multiModePath('/register')"
        >
          <q-item-section avatar>
            <q-icon name="mdi-account-plus" />
          </q-item-section>
          <q-item-section>Register</q-item-section>
        </q-item>

        <slot></slot>
      </template>

      <q-item
        clickable
        v-close-popup
        :href="multiModePath('/help')"
      >
        <q-item-section avatar>
          <q-icon name="mdi-help" />
        </q-item-section>
        <q-item-section>Help</q-item-section>
      </q-item>

      <q-item
        v-if="uiStore().loggedIn"
        clickable
        v-close-popup
        @click="logout()"
      >
        <q-item-section avatar>
          <q-icon name="mdi-logout" />
        </q-item-section>
        <q-item-section>Logout</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
import { logout } from 'src/code/areas/auth/logout';
import { selfUserName } from 'src/code/self-user-name';
import { multiModePath } from 'src/code/utils/misc';
</script>
