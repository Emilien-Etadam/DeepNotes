<template>
  <div class="login-page">
    <ResponsiveContainer style="padding: 150px 32px">
      <div
        class="login-form"
        style="margin: 0px auto; max-width: 270px"
      >
        <form @submit.prevent>
          <Standard v-if="authType === 'standard'" />
          <Authenticator v-else-if="authType === 'authenticator'" />
          <Recovery v-else-if="authType === 'recovery'" />
        </form>
      </div>
    </ResponsiveContainer>
  </div>
</template>

<script setup lang="ts">
import Authenticator from './Authenticator.vue';
import Recovery from './Recovery.vue';
import Standard from './Standard.vue';

useMeta(() => ({
  title: 'Login - DeepNotes',
}));

const authType = ref('standard');
provide('authType', authType);

const email = ref('');
provide('email', email);

const password = ref('');
provide('password', password);

const rememberSession = ref(false);
provide('rememberSession', rememberSession);

const backendUnavailableMessage =
  'Backend unavailable. Ensure PostgreSQL and Redis (KeyDB) are running.';

onMounted(async () => {
  email.value = internals.localStorage.getItem('email') ?? '';
  try {
    const res = await trpcClient.setup.getSetupStatus.query();
    if (res.error === 'unavailable') {
      $quasar().notify({
        type: 'warning',
        message: backendUnavailableMessage,
        timeout: 8000,
      });
    }
  } catch {
    // Network, "Unable to transform" (server returned non-JSON), or backend error
    $quasar().notify({
      type: 'warning',
      message: backendUnavailableMessage,
      timeout: 8000,
    });
  }
});
</script>

<style scoped lang="scss">
.login-page {
  color: $text-primary;

  :deep(.v-field__label),
  :deep(.v-label),
  :deep(.v-field input),
  :deep(.v-field textarea) {
    color: $text-primary;
  }

  :deep(.v-field--variant-filled .v-field__overlay) {
    opacity: 1;
    background: $bg-input-idle;
  }

  :deep(.v-input:hover .v-field--variant-filled .v-field__overlay) {
    background: $bg-input-hover;
  }

  :deep(.v-input--focused .v-field--variant-filled .v-field__overlay) {
    background: $bg-input-focus;
  }

  :deep(a) {
    color: $color-link;
  }
  :deep(a:hover) {
    color: $color-link-hover;
  }

  :deep(.v-btn) {
    color: inherit;
  }
  :deep(.v-btn.v-btn--color-primary) {
    color: #fff;
  }
}
</style>
