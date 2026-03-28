<template>
  <v-list-item
    :to="{ name: 'account/general' }"
    prepend-icon="mdi-cog"
    style="padding: 16px 20px; font-size: 16px"
  >
    <v-list-item-title>General</v-list-item-title>
  </v-list-item>

  <v-list-item
    :to="{ name: 'account/security' }"
    prepend-icon="mdi-shield"
    style="padding: 16px 20px; font-size: 16px"
  >
    <v-list-item-title>Security</v-list-item-title>
  </v-list-item>
</template>

<script setup lang="ts"></script>
