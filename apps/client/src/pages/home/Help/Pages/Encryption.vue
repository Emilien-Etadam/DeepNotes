<template>
  <div style="font-size: 28px; font-weight: bold">{{ title }}</div>
  <Gap style="height: 36px" />
  <div style="max-width: 600px">
    <p>
      DeepNotes encrypts all page content on your device before sending it to
      the server. The server stores only ciphertext and has no access to your
      notes, arrows, or page titles.
    </p>
    <p>
      Encryption uses libsodium (XChaCha20-Poly1305 for symmetric encryption,
      X25519 for key exchange). Each page has its own encryption key, shared
      only with group members who have been granted access.
    </p>
    <p>
      Because the server cannot read your data, some features are structurally
      impossible: there is no server-side search across pages, no password
      recovery by the administrator, and no way to access your content if you
      lose your credentials.
    </p>
    <p>
      If you use two-factor authentication, store your recovery codes in a safe
      location — they are your only fallback.
    </p>
  </div>
</template>

<script setup lang="ts">
const title = 'End-to-end encryption';
useMeta(() => ({ title: `${title} - Help - DeepNotes` }));
</script>
