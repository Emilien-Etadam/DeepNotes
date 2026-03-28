<template>
  <div class="page-item-content">
    <v-avatar
      v-if="icon"
      size="24"
      style="margin-right: 8px"
    >
      <v-icon
        icon="mdi-note-text"
        class="page-icon"
        :class="{
          encrypted: pageTitleInfo.status === 'encrypted',
          empty: isEmpty,
        }"
      />
    </v-avatar>

    <div style="flex: 1; min-width: 0">
      <div
        class="group-name"
        style="font-size: 12px"
      >
        {{ groupNameInfo.text }}
      </div>

      <div
        class="page-title"
        :class="{
          encrypted: pageTitleInfo.status === 'encrypted',
          empty: isEmpty,
        }"
      >
        {{ pageTitleInfo.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watchUntilTrue } from '@stdlib/vue';
import { useRealtimeContext } from 'src/code/areas/realtime/context';
import { groupNames } from 'src/code/pages/computed/group-names';
import { pageGroupIds } from 'src/code/pages/computed/page-group-id';
import { getPageTitle } from 'src/code/pages/utils';

const props = defineProps<{
  icon: boolean;
  pageId: string;
  prefer: 'relative' | 'absolute';
}>();

const realtimeCtx = useRealtimeContext();

const pageGroupId = computed(() => pageGroupIds()(props.pageId).get());
const groupNameInfo = computed(() => groupNames()(pageGroupId.value!).get());
const pageTitleInfo = computed(() =>
  getPageTitle(props.pageId, { prefer: props.prefer }),
);

const loading = ref(true);

onMounted(() => {
  void watchUntilTrue(() => {
    if (!internals.realtime.loading) {
      loading.value = false;
    }

    return !internals.realtime.loading;
  });
});

const isEmpty = computed(
  () =>
    !loading.value &&
    (!!realtimeCtx.hget('page', props.pageId, 'permanent-deletion-date') ||
      !!realtimeCtx.hget(
        'group',
        pageGroupId.value!,
        'permanent-deletion-date',
      ) ||
      (pageTitleInfo.value.status !== 'success' &&
        groupNameInfo.value.status !== 'success')),
);
</script>

<style scoped lang="scss">
@use 'sass:color';

.page-item-content {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  width: 100%;
}

.group-name {
  color: color.adjust(#006dd2, $lightness: 23%);
}

.page-title {
  font-size: 13.8px;
}
.page-title.encrypted {
  color: rgba(150, 150, 255, 1);
}
.page-title.empty {
  color: rgba(255, 150, 150, 1);
}
</style>
