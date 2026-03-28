<template>
  <CustomDialog ref="dialogRef">
    <template #header>
      <div style="padding: 12px 20px">
        <div class="text-h6">Export for AI (Markdown)</div>
      </div>
    </template>

    <template #body>
      <div style="padding: 20px; display: flex; flex-direction: column">
        <v-textarea
          :model-value="markdown"
          readonly
          variant="outlined"
          auto-grow
          rows="15"
          class="export-markdown-textarea"
          style="font-family: monospace; font-size: 13px"
        />

        <Gap style="height: 16px" />

        <div style="display: flex; gap: 8px; flex-wrap: wrap">
          <DeepBtn
            flat
            label="Copy to clipboard"
            icon="mdi-content-copy"
            color="primary"
            @click="copyToClipboard()"
          />
          <DeepBtn
            flat
            label="Download as .md"
            icon="mdi-download"
            color="primary"
            @click="downloadAsMd()"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <v-card-actions>
        <v-spacer />

        <DeepBtn
          flat
          label="Close"
          color="primary"
          @click="dialogRef.onDialogCancel()"
        />
      </v-card-actions>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import download from 'downloadjs';
import { getPageTitle } from 'src/code/pages/utils';
import type { Ref } from 'vue';

const props = withDefaults(
  defineProps<{
    markdown?: string;
  }>(),
  { markdown: '' },
);

const dialogRef = ref() as Ref<InstanceType<typeof CustomDialog>>;

function copyToClipboard() {
  navigator.clipboard.writeText(props.markdown).then(() => {
    showNotify({
      message: 'Copied to clipboard',
      color: 'positive',
      position: 'bottom',
    });
  });
}

function downloadAsMd() {
  const page = internals.pages.react.page;
  const titleResult = page
    ? getPageTitle(page.id, { prefer: 'relative' })
    : null;
  const name =
    titleResult?.status === 'success' && titleResult?.text
      ? titleResult.text.replaceAll(/[/\\?%*:|"<>]/g, '-')
      : 'export';
  download(props.markdown, `${name}.md`, 'text/markdown');
}
</script>

<style scoped>
.export-markdown-textarea {
  min-height: 400px;
  font-family: monospace;
}
</style>
