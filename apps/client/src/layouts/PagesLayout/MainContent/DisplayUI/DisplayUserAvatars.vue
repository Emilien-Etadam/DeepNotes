<template>
  <div
    style="
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      pointer-events: none;
    "
  >
    <div
      v-for="(userState, index) in page.collab.presence.react.userStates"
      :key="userState[0]"
      class="display-user-avatar"
      :style="{
        left: `${(mobile ? 82 : 20) + 44 * index}px`,

        'background-color': userState[1].user.color,
      }"
    >
      {{ getNameInitials(userState[1].user.name ?? '') }}

      <v-tooltip
        activator="parent"
        location="top"
      >
        {{ userState[1].user.name }}
      </v-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getNameInitials } from 'src/code/utils/misc';
import { useDisplay } from 'vuetify';

const { mobile } = useDisplay();

const page = computed(() => internals.pages.react.page);
</script>

<style scoped>
.display-user-avatar {
  position: absolute;
  bottom: 20px;

  border-radius: 9999px;

  width: 34px;
  height: 34px;

  display: flex;
  justify-content: center;
  align-items: center;

  pointer-events: auto;

  font-weight: bold;
}
</style>
