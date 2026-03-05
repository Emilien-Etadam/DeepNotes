<template>
  <div style="font-size: 28px; font-weight: bold">{{ title }}</div>
  <Gap style="height: 36px" />
  <div style="max-width: 600px">
    <p>
      Click on an empty area of the canvas to create a new note. Drag a note to
      move it; drag its edges to resize it.
    </p>
    <p>
      To connect two notes, hover over the source note's edge until a small
      circle appears, then drag from that circle to the target note. This
      creates a directional arrow.
    </p>
    <p>
      Right-click a note or arrow to access its properties (color, container
      mode, head/body content). Notes can act as containers for other notes,
      allowing spatial grouping.
    </p>
    <p>
      Any note can host a nested page. When a note contains a page,
      double-clicking it opens that page in the canvas.
    </p>
  </div>
</template>

<script setup lang="ts">
const title = 'Creating notes and arrows';
useMeta(() => ({ title: `${title} - Help - DeepNotes` }));
</script>
