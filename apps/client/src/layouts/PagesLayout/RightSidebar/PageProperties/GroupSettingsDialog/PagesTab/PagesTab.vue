<template>
  <div style="display: flex">
    <DeepBtn
      label="Select all"
      color="primary"
      :disable="finalSelectedPageIds.length === finalPageIds.length"
      @click="selectAll()"
    />

    <Gap style="width: 16px" />

    <DeepBtn
      label="Clear selection"
      color="primary"
      :disable="finalSelectedPageIds.length === 0"
      @click="deselectAll()"
    />

    <Gap style="width: 26px" />

    <Checkbox
      label="Show deleted pages"
      v-model="showDeletedPages"
    />
  </div>

  <Gap style="height: 16px" />

  <div style="flex: 1; height: 0; display: flex">
    <div style="flex: 1">
      <Checklist
        :item-ids="finalPageIds"
        :items-wrapper="CustomInfiniteScroll"
        :wrapper-events="{ load: onLoad }"
        :wrapper-props="{ disable: !hasMorePages }"
        :selected-item-ids="baseSelectedPageIds"
        @select="(pageId) => baseSelectedPageIds.add(pageId)"
        @unselect="(pageId) => baseSelectedPageIds.delete(pageId)"
        style="max-height: 100%; border-radius: 10px; background-color: #383838"
        class="overflow-auto"
        :item-props="
          (pageId) => ({
            style: {
              color:
                realtimeCtx.hget('page', pageId, 'permanent-deletion-date') !=
                null
                  ? '#ff9696'
                  : undefined,
            },
          })
        "
      >
        <template #item="{ itemId: groupPageId }">
          <div>
            {{ getPageTitle(groupPageId, { prefer: 'absolute' }).text }}
          </div>
        </template>
      </Checklist>
    </div>

    <Gap style="width: 16px" />

    <div
      style="flex: none; width: 200px; display: flex; flex-direction: column"
    >
      <DeepBtn
        label="Go to page"
        color="primary"
        :disable="finalSelectedPageIds.length !== 1"
        @click="goToPage(finalSelectedPageIds[0])"
      />

      <Gap style="height: 16px" />

      <DeepBtn
        :label="`Move page${pluralS(finalSelectedPageIds.length)}`"
        color="primary"
        :disable="
          finalSelectedPageIds.length === 0 ||
          !rolesMap()[
            realtimeCtx.hget(
              'group-member',
              `${groupId}:${authStore().userId}`,
              'role',
            )
          ]?.permissions.editGroupSettings
        "
        @click="movePages"
      />

      <Gap style="height: 16px" />

      <DeepBtn
        label="Add to selection"
        color="primary"
        :disable="
          finalSelectedPageIds.length === 0 ||
          !rolesMap()[
            realtimeCtx.hget(
              'group-member',
              `${groupId}:${authStore().userId}`,
              'role',
            )
          ]?.permissions.editGroupSettings
        "
        @click="addToSelection"
      />

      <Gap style="height: 16px" />

      <DeepBtn
        label="Delete"
        color="negative"
        :disable="
          finalSelectedPageIds.length === 0 ||
          !rolesMap()[
            realtimeCtx.hget(
              'group-member',
              `${groupId}:${authStore().userId}`,
              'role',
            )
          ]?.permissions.editGroupPages
        "
        @click="deletePages"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { rolesMap } from '@deeplib/misc';
import { pluralS } from '@stdlib/misc';
import type { RealtimeContext } from 'src/code/areas/realtime/context';
import { getPageTitle } from 'src/code/pages/utils';
import { handleError } from 'src/code/utils/misc';
import CustomInfiniteScroll from 'src/components/CustomInfiniteScroll.vue';
import { pageSelectionStore } from 'src/stores/page-selection';
import type { Ref } from 'vue';

import { usePageList } from '../../../../usePageList';

const dialog = inject<Ref<InstanceType<typeof CustomDialog>>>('dialog')!;

const groupId = inject<string>('groupId')!;

const realtimeCtx = inject<RealtimeContext>('realtimeCtx')!;

const basePageIds = inject<Ref<Set<string>>>('pageIds')!;

const finalPageIds = computed(() =>
  Array.from(basePageIds.value).filter(
    (pageId) =>
      realtimeCtx.hget('page', pageId, 'exists') &&
      (realtimeCtx.hget('page', pageId, 'permanent-deletion-date') == null ||
        (showDeletedPages.value &&
          realtimeCtx.hget('page', pageId, 'permanent-deletion-date') != null)),
  ),
);

const hasMorePages = inject<Ref<boolean>>('hasMorePages')!;

const baseSelectedPageIds = ref(new Set<string>());
const finalSelectedPageIds = computed(() =>
  finalPageIds.value.filter((pageId) => baseSelectedPageIds.value.has(pageId)),
);

const showDeletedPages = ref(false);

function selectAll() {
  for (const pageId of finalPageIds.value) {
    baseSelectedPageIds.value.add(pageId);
  }
}
function deselectAll() {
  for (const pageId of finalPageIds.value) {
    baseSelectedPageIds.value.delete(pageId);
  }
}

async function onLoad(index: number, done: (stop?: boolean) => void) {
  try {
    const response = await trpcClient.groups.getPages.query({
      groupId,

      lastPageId: Array.from(basePageIds.value).at(-1),
    });

    response.pageIds.forEach((pageId) => basePageIds.value.add(pageId));
    hasMorePages.value = response.hasMore;
  } catch (error) {
    handleError(error);

    hasMorePages.value = false;
  }

  done(!hasMorePages.value);
}

async function goToPage(pageId: string) {
  await internals.pages.goToPage(pageId);

  dialog.value.onDialogOK();
}

const { movePages, deletePages } = usePageList({
  getSelectedPageIds: () => finalSelectedPageIds.value,
  getGroupId: () => groupId,
});

function addToSelection() {
  for (const selectedPageId of finalSelectedPageIds.value) {
    pageSelectionStore().selectedPages.add(selectedPageId);
  }

  showNotify({
    message: 'Pages added to selection.',
    color: 'positive',
  });
}
</script>
