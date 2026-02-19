<template>
  <q-footer
    class="footer-minimal"
    style="
      background-color: #202020;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    "
  >
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
          :to="{ name: 'privacy-policy' }"
          class="footer-link"
        >
          Privacy
        </router-link>
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

<style scoped>
.footer-minimal {
  padding: 8px 0;
}
.footer-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px 8px;
  font-size: 12px;
}
.footer-sep {
  color: rgba(255, 255, 255, 0.35);
  user-select: none;
}
.footer-link,
.footer-copy {
  color: #c8c8c8;
}
.footer-link:hover {
  color: #fff;
}
</style>
