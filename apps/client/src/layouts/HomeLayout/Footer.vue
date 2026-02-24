<template>
  <q-footer class="footer-minimal">
    <ResponsiveContainer>
      <div class="footer-line">
        <router-link
          :to="{ name: 'home' }"
          class="footer-link"
        >
          DeepNotes
        </router-link>
        <span class="footer-sep">·</span>
        <router-link
          :to="{ name: 'help' }"
          class="footer-link"
        >
          Help
        </router-link>
        <span class="footer-sep">·</span>
        <a
          href="https://github.com/DeepNotesApp/DeepNotes"
          class="footer-link"
        >
          GitHub
        </a>
        <span class="footer-sep">·</span>
        <router-link
          :to="{ name: 'terms-of-service' }"
          class="footer-link"
        >
          Terms
        </router-link>
        <span class="footer-sep">·</span>
        <span class="footer-copy">© {{ new Date().getFullYear() }}</span>
      </div>
    </ResponsiveContainer>
  </q-footer>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.footer-minimal {
  background-color: $bg-page;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding: $sp-2 0;
}
.footer-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: $sp-1 $sp-2;
  font-size: $fs-xs;
}
.footer-sep {
  color: rgba(255, 255, 255, 0.35); // TODO: token
  user-select: none;
}
.footer-link,
.footer-copy {
  color: #c8c8c8; // TODO: token
}
.footer-link:hover {
  color: #fff;
}
</style>
