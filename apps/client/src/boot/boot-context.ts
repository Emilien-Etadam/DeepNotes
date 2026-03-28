import type { Pinia } from 'pinia';
import type { App } from 'vue';
import type { Router } from 'vue-router';

export interface BootContext {
  app: App;
  router: Router;
  store: Pinia;
  ssrContext?: {
    res?: { setHeader(name: string, value: string): void };
  };
}
