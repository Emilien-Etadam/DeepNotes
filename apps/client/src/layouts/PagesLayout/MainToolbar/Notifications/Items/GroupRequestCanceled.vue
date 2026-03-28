<template>
  <NotificationItem
    :notification="notification"
    @click="onClick"
  >
    <div>{{ notificationInfo.get()?.message }}</div>
  </NotificationItem>
</template>

<script setup lang="ts">
import type { DeepNotesNotification } from '@deeplib/misc';
import { wrapSymmetricKey } from '@stdlib/crypto';
import { createSmartComputed } from '@stdlib/vue';
import { unpack } from 'msgpackr';
import { getGroupRequestCanceledNotificationInfo } from 'src/code/pages/notifications/group-request-canceled';
import type { Ref } from 'vue';

import NotificationItem from '../NotificationItem.vue';

const props = defineProps<{
  notification: DeepNotesNotification;
}>();

const notificationContent = computed(() => {
  const symmetricKey = wrapSymmetricKey(
    internals.keyPair.decrypt(props.notification.encryptedSymmetricKey),
  );

  return unpack(
    symmetricKey.decrypt(props.notification.encryptedContent, {
      padding: true,
      associatedData: { context: 'UserNotificationContent' },
    }),
  );
});

const notificationInfo = createSmartComputed({
  get: () => getGroupRequestCanceledNotificationInfo(notificationContent.value),
});

const notificationsMenu = inject('notificationsMenu') as Ref<{ hide: () => void }>;

async function onClick() {
  await router().push(`/groups/${notificationContent.value.groupId}`);

  notificationsMenu.value.hide();
}
</script>
