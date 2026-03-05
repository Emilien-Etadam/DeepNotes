<template>
  <div style="font-size: 28px; font-weight: bold">{{ title }}</div>
  <Gap style="height: 36px" />
  <div style="max-width: 600px">
    <p>
      Click the "Export for AI" button in the bottom-left toolbar (the export
      icon below Find & Replace).
    </p>
    <p>
      A dialog opens showing your page converted to structured Markdown. The
      output includes the page title, the full note hierarchy with headings
      reflecting nesting depth, note body text, and a "Connections" section
      listing all arrows as "source → target".
    </p>
    <p>
      Use "Copy to clipboard" to paste the Markdown directly into an AI chat, or
      "Download as .md" to save the file.
    </p>
    <p>
      This export is designed for feeding context to an AI assistant — it
      preserves the spatial and hierarchical structure of your ideas in a text
      format the AI can parse.
    </p>
  </div>
</template>

<script setup lang="ts">
const title = 'Exporting a page for AI';
useMeta(() => ({ title: `${title} - Help - DeepNotes` }));
</script>
