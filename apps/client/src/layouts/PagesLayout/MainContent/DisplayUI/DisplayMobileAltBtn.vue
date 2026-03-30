<template>
  <DeepBtn
    v-if="mobile"
    color="grey-9"
    class="display-mobile-alt-btn"
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

<style scoped lang="scss">
.display-mobile-alt-btn {
  background-color: #808080;
  position: absolute;
  left: calc(var(--v-layout-left, 0px) + 16px);
  bottom: 12px;
  width: 48px;
  height: 48px;
  text-transform: none;
}
</style>
