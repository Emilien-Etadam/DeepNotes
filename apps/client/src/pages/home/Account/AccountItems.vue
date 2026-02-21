<template>
  <q-item
    clickable
    :to="{ name: 'account/general' }"
    style="padding: 16px 20px; font-size: 16px"
  >
    <q-item-section avatar>
      <q-icon name="mdi-cog" />
    </q-item-section>
    <q-item-section>General</q-item-section>
  </q-item>

  <q-item
    clickable
    :to="{ name: 'account/security' }"
    style="padding: 16px 20px; font-size: 16px"
  >
    <q-item-section avatar>
      <q-icon name="mdi-shield" />
    </q-item-section>
    <q-item-section>Security</q-item-section>
  </q-item>
</template>

<script setup lang="ts"></script>
