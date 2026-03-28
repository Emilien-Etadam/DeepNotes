import '@mdi/font/css/materialdesignicons.css';
import '@quasar/extras/mdi-v7/mdi-v7.css';
import 'quasar/src/css/index.sass';
import 'vuetify/styles';
import './css/app.scss';

import { createPinia } from 'pinia';
import { Cookies, Dialog, Loading, Meta, Notify, Quasar } from 'quasar';
import iconSet from 'quasar/icon-set/mdi-v7';
import lang from 'quasar/lang/en-US';
import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import App from './App.vue';
import { setup as setupArrayAtPolyfill } from './boot/array-at-polyfill.client';
import { setup as setupAuth } from './boot/auth.client';
import type { BootContext } from './boot/boot-context';
import { setup as setupCrossTabSessionStorage } from './boot/cross-tab-session-storage.client';
import { setup as setupHelpers } from './boot/helpers.universal';
import { setup as setupDisableCache } from './boot/http-headers/disable-cache.universal';
import { setup as setupReferrerPolicy } from './boot/http-headers/referrer-policy.universal';
import { setup as setupXFrameOptions } from './boot/http-headers/x-frame-options.universal';
import { setup as setupI18n } from './boot/i18n.universal';
import { setup as setupInternals } from './boot/internals.universal';
import { setup as setupLogger } from './boot/logger.client';
import { setup as setupProsemirror } from './boot/prosemirror.client';
import { setup as setupSodium } from './boot/sodium.universal';
import { setup as setupSyncedstore } from './boot/syncedstore.client';
import { setup as setupTiptap } from './boot/tiptap.client';
import { setup as setupUi } from './boot/ui.client';
import { setup as setupVue } from './boot/vue.universal';
import { createAppRouter } from './router';

const app = createApp(App);

app.use(Quasar, {
  plugins: { Notify, Cookies, Meta, Dialog, Loading },
  lang,
  iconSet,
  config: {
    dark: true,
  },
});

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          primary: '#006dd2',
          secondary: '#606060',
          accent: '#9c27b0',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
  },
});

app.use(vuetify);

const pinia = createPinia();
app.use(pinia);

const routerInstance = createAppRouter(pinia);
app.use(routerInstance);

const ctx: BootContext = {
  app,
  router: routerInstance,
  store: pinia,
};

await setupInternals(ctx);
await setupHelpers(ctx);
await setupSodium(ctx);
await setupI18n(ctx);
await setupVue(ctx);
await setupDisableCache(ctx);
await setupXFrameOptions(ctx);
await setupReferrerPolicy(ctx);

await setupArrayAtPolyfill(ctx);
await setupLogger(ctx);
await setupCrossTabSessionStorage(ctx);
await setupAuth(ctx);
await setupUi(ctx);
await setupProsemirror(ctx);
await setupSyncedstore(ctx);
await setupTiptap(ctx);

app.mount('#app');
