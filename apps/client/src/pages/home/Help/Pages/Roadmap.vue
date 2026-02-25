<template>
  <div style="font-size: 28px; font-weight: bold">{{ title }}</div>

  <Gap style="height: 36px" />

  <div>
    The roadmap is maintained in the project repository. You can follow
    development and contribute on
    <a
      href="https://github.com/DeepNotesApp/DeepNotes"
      target="_blank"
      rel="noopener noreferrer"
    >
      GitHub
    </a>.
  </div>
</template>

<script setup lang="ts">
const title = 'Is there a roadmap?';

useMeta(() => ({
  title: `${title} - Help - DeepNotes`,
}));
</script>
