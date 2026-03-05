<template>
  <div style="font-size: 28px; font-weight: bold">{{ title }}</div>
  <Gap style="height: 36px" />
  <div style="max-width: 600px">
    <p>
      DeepNotes is a self-hosted, open-source note-taking tool built around an
      infinite canvas. Notes are floating blocks of rich text that you place
      freely on the canvas and connect with arrows.
    </p>
    <p>
      Pages can be nested inside notes, creating a deep hierarchy of ideas
      without a rigid folder structure. You navigate between pages by
      double-clicking notes or using the horizontal breadcrumb bar at the top.
    </p>
    <p>
      All data is end-to-end encrypted with libsodium. The server never sees
      your content. Collaboration happens in real time via Yjs CRDT
      synchronization.
    </p>
    <p>
      The "Export for AI" button (bottom-left of the canvas) converts any page
      into structured Markdown — including note hierarchy and connections —
      ready to paste into an AI assistant.
    </p>
  </div>
</template>

<script setup lang="ts">
const title = 'What is DeepNotes?';
useMeta(() => ({ title: `${title} - Help - DeepNotes` }));
</script>
