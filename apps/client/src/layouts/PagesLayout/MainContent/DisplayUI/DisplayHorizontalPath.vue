<template>
  <div
    class="horizontal-path"
    style="
      position: absolute;
      right: 12px;
      top: 7px;
      white-space: nowrap;

      text-align: left;
      direction: rtl;

      overflow: scroll;
    "
  >
    <div style="display: inline-block; pointer-events: auto">
      <div style="display: flex; align-items: center; direction: ltr">
        <template
          v-for="(pageId, index) in internals.pages.react.pathPageIds.slice(
            0,
            internals.pages.react.pageIndex + 1,
          )"
          :key="pageId"
        >
          <span
            v-if="index > 0"
            style="color: #808080; margin-top: -1px"
          >
            >
          </span>

          <DisplayHorizontalPage
            :page-id="pageId"
            :active="index === internals.pages.react.pageIndex"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DisplayHorizontalPage from './DisplayHorizontalPage.vue';
</script>

<style scoped lang="scss">
/* Hide scrollbar */

.horizontal-path {
  left: calc(var(--v-layout-left, 0px) + 12px);
  font-size: $fs-sm;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.horizontal-path::-webkit-scrollbar {
  display: none;
}
</style>
