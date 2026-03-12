<template>
  <q-header
    ref="headerRef"
    class="home-header"
  >
    <q-toolbar
      style="
        height: 64px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        padding: 0;
        min-height: 0;
      "
    >
      <ResponsiveContainer style="display: flex; align-items: center">
        <!-- Left menu-->

        <template
          v-if="
            uiStore().width < BREAKPOINT_LG_MIN &&
            $route.path.startsWith('/account/')
          "
        >
          <ToolbarBtn
            icon="mdi-menu"
            icon-size="32px"
            btn-size="46px"
          >
            <q-menu
              anchor="bottom left"
              self="top left"
              auto-close
            >
              <q-list>
                <AccountItems />
              </q-list>
            </q-menu>
          </ToolbarBtn>

          <Gap style="width: 10px" />
        </template>

        <!-- App name and Logo -->

        <q-toolbar-title style="overflow: visible; padding: 0px; flex: none">
          <router-link
            :to="{ name: 'home' }"
            style="display: flex; align-items: center"
          >
            <img
              src="~assets/white-logo-outline.webp"
              style="width: 39px; height: 39px; opacity: 95%"
            />

            <div style="width: 8px"></div>

            <div
              class="header-app-name"
              style="font-weight: bold; position: relative"
            >
              DeepNotes
            </div>
          </router-link>
        </q-toolbar-title>

        <!-- Center buttons -->

        <template v-if="uiStore().width >= BREAKPOINT_LG_MIN">
          <Gap style="width: 32px" />

          <DeepBtn
            label="Help"
            flat
            class="toolbar-btn"
            :to="{ name: 'help' }"
            :style="{
              'background-color':
                $route.name === 'help' ? 'rgba(255,255,255,0.15)' : undefined,
            }"
          />
        </template>

        <q-space />

        <RightButtons></RightButtons>
        <RightMenu></RightMenu>
      </ResponsiveContainer>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { BREAKPOINT_LG_MIN } from '@stdlib/misc';
import { useResizeObserver } from 'src/code/utils/misc';
import AccountItems from 'src/pages/home/Account/AccountItems.vue';
import type { ComponentPublicInstance } from 'vue';

import RightButtons from './RightButtons/RightButtons.vue';
import RightMenu from './RightButtons/RightMenu.vue';

const headerRef = ref<ComponentPublicInstance>();

useResizeObserver(
  () => headerRef.value!.$el,
  (entry) => {
    uiStore().headerHeight = entry.contentRect.height;
  },
);
</script>

<style scoped lang="scss">
.home-header {
  background-color: $bg-page;
}

.header-app-name {
  font-size: $fs-lg;
  color: $text-primary;
}
</style>
