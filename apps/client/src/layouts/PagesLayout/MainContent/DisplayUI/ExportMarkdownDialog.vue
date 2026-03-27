<template>
  <CustomDialog ref="dialogRef">
    <template #header>
      <q-card-section style="padding: 12px 20px">
        <div class="text-h6">Export for AI (Markdown)</div>
      </q-card-section>
    </template>

    <template #body>
      <q-card-section
        style="padding: 20px; display: flex; flex-direction: column"
      >
        <q-input
          :model-value="markdown"
          type="textarea"
          readonly
          outlined
          autogrow
          input-class="export-markdown-textarea"
          style="min-height: 400px; font-family: monospace; font-size: 13px"
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
      </q-card-section>
    </template>

    <template #footer>
      <q-card-actions align="right">
        <DeepBtn
          flat
          label="Close"
          color="primary"
          @click="dialogRef.onDialogCancel()"
        />
      </q-card-actions>
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
    $quasar().notify({
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
