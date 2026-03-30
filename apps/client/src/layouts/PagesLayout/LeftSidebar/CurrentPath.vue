<template>
  <div class="section-root">
    <div class="section-header">
      <v-avatar
        size="32"
        style="margin-top: -1px; margin-left: -8px"
      >
        <v-icon
          icon="mdi-map-marker-radius"
          size="20"
        />
      </v-avatar>

      <span class="section-title">Current path</span>
    </div>

    <div class="section-list">
    <PageItem
      v-for="pageId in internals.pages.react.pathPageIds"
      :key="pageId"
      icon
      :page-id="pageId"
      :active="pageId === internals.pages.react.pageId"
      prefer="relative"
      style="padding-right: 8px"
    >
      <template #append>
        <PagePopupOptions :page-id="pageId" />
      </template>
    </PageItem>
    </div>
  </div>
</template>

<script setup lang="ts">
import PagePopupOptions from 'src/components/PagePopupOptions.vue';
</script>

<style scoped lang="scss">
.section-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background-color: #141414;
}

.section-header {
  height: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  position: relative;
}

.section-title {
  margin-left: -2px;
  text-align: left;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 600;
}

.section-list {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
