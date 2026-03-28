<template>
  <div
    v-if="numUnreadNotifications > 0"
    class="notification-badge"
  >
    {{ numUnreadNotifications }}
  </div>
</template>

<script setup lang="ts">
const numUnreadNotifications = computed(() => {
  return (
    pagesStore().notifications.items.reduce((acc, notification) => {
      if (
        notification.id > (pagesStore().notifications.lastNotificationRead ?? 0)
      ) {
        return acc + 1;
      } else {
        return acc;
      }
    }, 0) ?? 0
  );
});
</script>

<style scoped>
.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: red;
  color: white;
  font-size: 11px;
  line-height: 1;
  pointer-events: none;
}
</style>
