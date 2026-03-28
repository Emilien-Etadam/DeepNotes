<template>
  <div style="display: flex; flex-direction: column">
    <div>
      Default user alias

      <v-tooltip
        location="top"
        max-width="230"
      >
        <template #activator="{ props: tipProps }">
          <v-icon
            v-bind="tipProps"
            icon="mdi-information"
            size="15"
            style="margin-top: -1px; opacity: 0.9"
          />
        </template>
        This is your default name in collaborative groups. This value is
        encrypted, unreadable to the server.
      </v-tooltip>
    </div>

    <Gap style="height: 10px" />

    <TextField
      :model-value="selfUserName().get()"
      @update:model-value="selfUserName().set($event as string)"
      filled
      dense
      style="max-width: 300px"
      :maxlength="maxNameLength"
    />

    <Gap style="height: 24px" />

    <v-divider />

    <Gap style="height: 20px" />

    <div>User infos</div>

    <Gap style="height: 10px" />

    <TextField
      label="User ID"
      :model-value="authStore().userId"
      dense
      style="max-width: 300px"
      readonly
      copy-btn
    />

    <Gap style="height: 16px" />

    <TextField
      label="User public key"
      :model-value="bytesToBase64(internals.keyPair.publicKey.value)"
      dense
      style="max-width: 300px"
      readonly
      copy-btn
    />
  </div>
</template>

<script setup lang="ts">
import { maxNameLength } from '@deeplib/misc';
import { bytesToBase64 } from '@stdlib/base64';
import { selfUserName } from 'src/code/self-user-name';
</script>
