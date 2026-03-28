<template>
  <v-navigation-drawer
    :model-value="true"
    location="end"
    permanent
    :rail="!uiStore().rightSidebarExpanded"
    rail-width="72"
    width="299"
    style="display: flex; flex-direction: column"
    class="right-sidebar-drawer"
  >
    <v-toolbar
      class="right-sidebar-toolbar"
      style="
        padding: 0;
        flex: none;
        height: 32px;
        min-height: 0;
        overflow: hidden;
      "
    >
      <v-avatar
        style="margin-left: 9px"
        size="32"
        rounded
      >
        <v-icon
          icon="mdi-chart-box"
          size="20"
        />
      </v-avatar>

      <v-toolbar-title
        v-if="uiStore().rightSidebarExpanded"
        class="right-sidebar-title"
        style="margin-left: -2px; text-align: left"
      >
        <template v-if="page.activeElem.react.value?.type === 'note'">
          Note properties
        </template>
        <template v-else-if="page.activeElem.react.value?.type === 'arrow'">
          Arrow properties
        </template>
        <template v-else> Page properties </template>
      </v-toolbar-title>
    </v-toolbar>

    <div style="overflow-y: auto; height: 0; flex: 1">
      <NoteProperties v-if="page.activeElem.react.value?.type === 'note'" />
      <ArrowProperties
        v-else-if="page.activeElem.react.value?.type === 'arrow'"
      />
      <PageProperties v-else />
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import ArrowProperties from './ArrowProperties.vue';
import NoteProperties from './NoteProperties/NoteProperties.vue';
import PageProperties from './PageProperties/PageProperties.vue';

const page = computed(() => internals.pages.react.page);

provide('page', page);
</script>

<style scoped lang="scss">
.right-sidebar-drawer {
  background-color: $bg-sidebar;

  border-left: 1px solid $border-subtle !important;
}

.right-sidebar-toolbar {
  background-color: $bg-sidebar-sub;
}

.right-sidebar-title {
  color: $text-secondary;
  font-size: $fs-sm;
}
</style>
