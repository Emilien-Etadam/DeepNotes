<template>
  <div class="error-notfound">
    <div>
      <div class="error-notfound__code">404</div>

      <div
        class="text-h2 error-notfound__subtitle"
        style="opacity: 0.4"
      >
        Oops. Nothing here...
      </div>

      <DeepBtn
        class="mt-10"
        color="white"
        text-color="primary"
        unelevated
        :to="{ name: 'home' }"
        label="Go Home"
        no-caps
      />
    </div>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  name: 'ErrorNotFound',
});
</script>

<style scoped>
.error-notfound {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--v-theme-primary));
  color: white;
  text-align: center;
  padding: 16px;
  box-sizing: border-box;
}

.error-notfound__code {
  font-size: 30vh;
  line-height: 1;
}

.error-notfound__subtitle {
  margin-top: 0.5rem;
}
</style>
