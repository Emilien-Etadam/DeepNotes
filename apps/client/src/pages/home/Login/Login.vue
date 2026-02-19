<template>
  <q-page class="login-page">
    <ResponsiveContainer style="padding: 150px 32px">
      <div
        class="login-form"
        style="margin: 0px auto; max-width: 270px"
      >
        <q-form>
          <Standard v-if="authType === 'standard'" />
          <Authenticator v-else-if="authType === 'authenticator'" />
          <Recovery v-else-if="authType === 'recovery'" />
        </q-form>
      </div>
    </ResponsiveContainer>
  </q-page>
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
  color: rgba(255, 255, 255, 0.92);

  :deep(.q-field__label),
  :deep(.q-field__native),
  :deep(.q-field__input),
  :deep(.q-checkbox__label) {
    color: rgba(255, 255, 255, 0.92);
  }

  :deep(.q-field--filled .q-field__control::before) {
    background: rgba(255, 255, 255, 0.12);
  }

  :deep(.q-field--filled:hover .q-field__control::before) {
    background: rgba(255, 255, 255, 0.2);
  }

  :deep(.q-field--filled.q-field--focused .q-field__control::before) {
    background: rgba(255, 255, 255, 0.25);
  }

  :deep(a) {
    color: #47a7ff;
  }
  :deep(a:hover) {
    color: #4fc3f7;
  }

  :deep(.q-btn) {
    color: inherit;
  }
  :deep(.q-btn.bg-primary) {
    color: #fff;
  }
}
</style>
