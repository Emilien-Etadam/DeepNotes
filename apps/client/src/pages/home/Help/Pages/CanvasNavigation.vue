<template>
  <div style="font-size: 28px; font-weight: bold">{{ title }}</div>
  <Gap style="height: 36px" />
  <div style="max-width: 600px">
    <p>
      Zoom in and out with the mouse wheel or pinch gesture on trackpad. Pan by
      right-click dragging or two-finger dragging.
    </p>
    <p>
      Double-click a note that contains a nested page to navigate into it. Use
      the back and forward arrows in the bottom-left toolbar to move through
      your navigation history.
    </p>
    <p>
      The horizontal breadcrumb bar at the top of the canvas shows your current
      path. Click any segment to jump directly to that page.
    </p>
    <p>
      Use Ctrl+F (or the magnifying glass button) to open Find & Replace within
      the current page.
    </p>
  </div>
</template>

<script setup lang="ts">
const title = 'Navigating the canvas';
useMeta(() => ({ title: `${title} - Help - DeepNotes` }));
</script>
