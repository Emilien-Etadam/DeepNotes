<template>
  <div
    class="main-content-wrap"
    style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 0"
  >
    <div class="main-content-page">
      <DisplayPage
        v-for="page in internals.pages?.pageCache.react.cache"
        :key="page.id"
        :page="page"
        :style="{
          visibility:
            page === internals.pages.react.page ? undefined : 'hidden',
        }"
      />

      <DisplayUI v-if="!pagesStore().loading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import DisplayPage from './DisplayPage/DisplayPage.vue';
import DisplayUI from './DisplayUI/DisplayUI.vue';
</script>

<style scoped lang="scss">
.main-content-page {
  background-color: $bg-page;
}
</style>
