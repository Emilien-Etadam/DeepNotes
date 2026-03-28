<template>
  <div class="display-camera-btns">
    <DisplayBtn
      icon="mdi-magnify-remove-outline"
      :btn-size="34"
      @click="page.camera.resetZoom()"
    >
      <v-tooltip
        activator="parent"
        location="end"
      >
        Reset zoom
      </v-tooltip>
    </DisplayBtn>

    <Gap style="height: 6px" />

    <DisplayBtn
      icon="mdi-image-filter-center-focus-weak"
      :btn-size="34"
      @click="page.camera.fitToScreen()"
    >
      <v-tooltip
        activator="parent"
        location="end"
      >
        Fit to screen
      </v-tooltip>
    </DisplayBtn>

    <Gap style="height: 8px" />

    <div style="color: white">
      {{ Math.round(page.camera.react.zoom * 100) }}%
    </div>

    <Gap style="height: 20px" />

    <DisplayBtn
      icon="mdi-undo"
      size="11px"
      :btn-size="32"
      :disable="page.react.readOnly || !page.undoRedo.react.canUndo"
      @click="page.undoRedo.undo()"
    >
      <v-tooltip
        activator="parent"
        location="end"
      >
        Undo
      </v-tooltip>
    </DisplayBtn>

    <Gap style="height: 6px" />

    <DisplayBtn
      icon="mdi-redo"
      size="11px"
      :btn-size="32"
      :disable="page.react.readOnly || !page.undoRedo.react.canRedo"
      @click="page.undoRedo.redo()"
    >
      <v-tooltip
        activator="parent"
        location="end"
      >
        Redo
      </v-tooltip>
    </DisplayBtn>
  </div>
</template>

<script setup lang="ts">
const page = computed(() => internals.pages.react.page);
</script>

<style lang="scss" scoped>
.display-camera-btns {
  position: absolute;

  left: $sp-3;
  top: 298px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
