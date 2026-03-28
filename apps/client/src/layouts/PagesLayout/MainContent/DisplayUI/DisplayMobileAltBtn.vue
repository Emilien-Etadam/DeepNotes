<template>
  <DeepBtn
    v-if="mobile"
    color="grey-9"
    style="
      background-color: #808080;

      position: absolute;

      left: 16px;
      bottom: 12px;

      width: 48px;
      height: 48px;

      text-transform: none;
    "
    @pointerdown="onPointerDown"
  >
    Alt

    <v-tooltip
      activator="parent"
      location="top"
    >
      Alternate function
    </v-tooltip>
  </DeepBtn>
</template>

<script setup lang="ts">
import { listenPointerEvents } from '@stdlib/misc';
import { useDisplay } from 'vuetify';

const { mobile } = useDisplay();

function onPointerDown(event: PointerEvent) {
  internals.mobileAltKey = true;

  listenPointerEvents(event, {
    up: onPointerUp,
  });
}

function onPointerUp() {
  internals.mobileAltKey = false;
}
</script>
