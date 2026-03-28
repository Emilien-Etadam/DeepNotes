<template>
  <div>
    <h5 style="margin-block-start: 0; margin-block-end: 0">Invitations</h5>

    <Gap style="height: 8px" />

    <v-divider />

    <Gap style="height: 24px" />

    <div v-if="!isAdmin">
      <p>Only the administrator can create invitations.</p>
    </div>

    <template v-else>
      <p style="margin-bottom: 16px">
        Create an invitation link for a new user. They will set their password
        when they open the link.
      </p>

      <div
        style="
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: flex-end;
          max-width: 400px;
        "
      >
        <TextField
          v-model="inviteEmail"
          label="Email"
          type="email"
          style="flex: 1; min-width: 200px"
          placeholder="user@example.com"
        />
        <DeepBtn
          label="Create invitation"
          color="primary"
          :disable="!inviteEmail.trim()"
          :loading="creating"
          @click="createInvite()"
        />
      </div>

      <Gap style="height: 24px" />

      <div
        v-if="lastInviteLink"
        style="
          padding: 16px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          max-width: 500px;
        "
      >
        <div style="font-weight: 500; margin-bottom: 8px">
          Invitation link (valid 7 days)
        </div>
        <div
          style="word-break: break-all; font-size: 13px; margin-bottom: 12px"
        >
          {{ lastInviteLink }}
        </div>
        <DeepBtn
          label="Copy link"
          flat
          size="sm"
          @click="copyLink()"
        />
      </div>
    </template>

    <LoadingOverlay v-if="loading" />
  </div>
</template>

<script setup lang="ts">
import { w3cEmailRegex } from '@stdlib/misc';
import { handleError, multiModePath } from 'src/code/utils/misc';

useMeta(() => ({
  title: 'Invitations - Account - DeepNotes',
}));

const loading = ref(true);
const isAdmin = ref(false);
const inviteEmail = ref('');
const creating = ref(false);
const lastInviteLink = ref('');

onMounted(async () => {
  try {
    const res = await trpcClient.users.invites.getAdminStatus.query();
    isAdmin.value = res.isAdmin;
  } catch {
    isAdmin.value = false;
  } finally {
    loading.value = false;
  }
});

async function createInvite() {
  const email = inviteEmail.value.trim().toLowerCase();
  if (!email || !w3cEmailRegex.test(email)) {
    $quasar().notify({
      message: 'Please enter a valid email address.',
      type: 'negative',
    });
    return;
  }
  creating.value = true;
  lastInviteLink.value = '';
  try {
    const { token } = await trpcClient.users.invites.createInvite.mutate({
      email,
    });
    const path = `/accept-invite/${token}`;
    lastInviteLink.value =
      globalThis.window === undefined
        ? path
        : `${globalThis.location.origin}${globalThis.location.pathname}${multiModePath(path)}`;
    $quasar().notify({
      message: 'Invitation created. Share the link with the user.',
      type: 'positive',
    });
  } catch (e: unknown) {
    handleError(e);
  } finally {
    creating.value = false;
  }
}

function copyLink() {
  if (!lastInviteLink.value) return;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(lastInviteLink.value);
    $quasar().notify({ message: 'Link copied.', type: 'positive' });
  }
}
</script>
