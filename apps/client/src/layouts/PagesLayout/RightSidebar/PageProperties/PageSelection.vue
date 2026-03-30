<template>
  <div style="padding: 12px; display: flex; flex-direction: column">
    <DeepBtn
      v-if="pageSelectionStore().selectedPages.has(page.id)"
      dense
      size="small"
      label="Deselect this page"
      icon="mdi-selection-multiple"
      color="negative"
      @click="deselectPage"
    />
    <DeepBtn
      v-else
      dense
      size="small"
      label="Select this page"
      icon="mdi-selection-multiple"
      color="primary"
      @click="selectPage"
    />

    <Gap style="height: 8px" />

    <DeepBtn
      dense
      size="small"
      label="Select linked pages"
      icon="mdi-selection-multiple"
      color="primary"
      @click="selectLinkedPages"
    />
  </div>
</template>

<script setup lang="ts">
import type { Page } from 'src/code/pages/page/page';
import { APP_URL } from 'src/code/utils/app-url';
import { pageSelectionStore } from 'src/stores/page-selection';
import type { Ref } from 'vue';

const page = inject<Ref<Page>>('page')!;

function selectPage() {
  pageSelectionStore().selectedPages.add(page.value.id);

  showNotify({
    message: 'Page added to selection.',
    color: 'positive',
    timeout: 1000,
  });
}

function deselectPage() {
  pageSelectionStore().selectedPages.delete(page.value.id);

  showNotify({
    message: 'Page removed from selection.',
    color: 'negative',
    timeout: 1000,
  });
}

function selectLinkedPages() {
  for (const note of Object.values(page.value.notes.react.map)) {
    const headMatches = (
      note.react.collab.head.value.toDOM().textContent ?? ''
    ).matchAll(/(?:\/pages\/([\w-]{21})\b)/g);

    const bodyMatches = (
      note.react.collab.head.value.toDOM().textContent ?? ''
    ).matchAll(/(?:\/pages\/([\w-]{21})\b)/g);

    const appUrlEscaped = APP_URL.replaceAll(
      /[.*+?^${}()|[\]\\]/g,
      String.raw`\$&`,
    );
    const linkMatches = note.react.collab.link.matchAll(
      new RegExp(
        String.raw`^(?:${appUrlEscaped}/pages/([\w-]{21})|/pages/([\w-]{21})|([\w-]{21}))$`,
        'g',
      ),
    );

    const matches = [...headMatches, ...bodyMatches, ...linkMatches];

    for (const match of matches) {
      for (let i = 1; i < match.length; i++) {
        if (match[i] != null && match[i] !== page.value.id) {
          pageSelectionStore().selectedPages.add(match[i]);
        }
      }
    }
  }

  showNotify({
    message: 'Linked pages added to selection.',
    color: 'positive',
    timeout: 1000,
  });
}
</script>
