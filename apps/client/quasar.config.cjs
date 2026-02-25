/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

const AutoImport = require('unplugin-auto-import/vite');
const VueComponents = require('unplugin-vue-components/vite');

// Inline helpers to avoid pulling @stdlib/misc (and lodash) into ESM config bundle
function hashFNV1a(str, seed = 0x811c9dc5) {
  let hval = seed;
  for (let i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval +=
      (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return hval >>> 0;
}

const dotenv = require('dotenv');

const env = Object.assign(
  {},
  require('dotenv-expand').expand({
    ...dotenv.config({ path: '../../.env' }),

    ...(dotenv.config({ path: '../../.env' }).parsed?.DEV
      ? dotenv.config({ path: '../../.env' }).parsed?.PRODEV
        ? dotenv.config({ path: '../../.env.prodev' })
        : dotenv.config({ path: '../../.env.dev' })
      : dotenv.config({ path: '../../.env.prod' })),
  }).parsed,
  Object.fromEntries(
    Object.entries(process.env ?? {}).filter(([key]) => /^\w+$/.test(key)),
  ),
);

const { configure } = require('quasar/wrappers');
const path = require('path');

// Analyse du bundle : ANALYZE=true pnpm run build:spa
const visualizerPlugin =
  process.env.ANALYZE === 'true'
    ? require('rollup-plugin-visualizer').visualizer({
        open: true,
        gzipSize: true,
        filename: path.resolve(__dirname, 'dist/stats.html'),
      })
    : null;

module.exports = configure(function (ctx) {
  const port =
    1024 + (Math.abs(hashFNV1a(JSON.stringify(ctx.mode))) % (65536 - 1024));

  console.log(`Port: ${port}`);

  return {
    eslint: {
      // fix: true,
      // include = [],
      // exclude = [],
      // rawOptions = {},
      warnings: true,
      errors: true,
    },

    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: [
      { path: 'internals.universal' },
      { path: 'helpers.universal' },
      { path: 'sodium.universal' },
      { path: 'i18n.universal' },
      { path: 'vue.universal' },

      { path: 'http-headers/disable-cache.universal' },
      { path: 'http-headers/x-frame-options.universal' },
      { path: 'http-headers/referrer-policy.universal' },

      { path: 'array-at-polyfill.client', server: false },
      { path: 'logger.client', server: false },
      { path: 'cross-tab-session-storage.client', server: false },
      { path: 'auth.client', server: false },
      { path: 'ui.client', server: false },
      { path: 'prosemirror.client', server: false },
      { path: 'syncedstore.client', server: false },
      { path: 'tiptap.client', server: false },
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
    css: ['app.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    // Uniquement mdi-v7 : toutes les icônes du projet sont mdi-* (material-design-icons)
    extras: ['mdi-v7'],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
    build: {
      target: {
        browser: ['es2022', 'edge100', 'firefox100', 'chrome100', 'safari15'],
        node: 'node20',
      },

      vueRouterMode: 'hash', // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',
      // analyze: true,
      env: {
        ...env,
        APP_URL:
          env.CLIENT_APP_URL ||
          process.env.CLIENT_APP_URL ||
          'https://deepnotes.app',
      },
      chunkSizeWarningLimit: 800,
      // rawDefine: {}
      // ignorePublicFolder: true,
      minify: true,
      // polyfillModulePreload: true,
      // distDir

      extendViteConf(viteConf) {
        viteConf.css = {
          ...viteConf.css,
          preprocessorOptions: {
            ...viteConf.css?.preprocessorOptions,
            scss: {
              silenceDeprecations: ['legacy-js-api', 'import'],
              includePaths: [path.resolve(__dirname, 'src/css')],
              additionalData: `@use 'src/css/tokens' as *;\n`,
            },
          },
        };
        // Packages Node → navigateur : alias CJS ou stub
        viteConf.resolve = viteConf.resolve || {};
        viteConf.resolve.alias = {
          ...viteConf.resolve.alias,
          'libsodium-wrappers-sumo': require.resolve('libsodium-wrappers-sumo'),
          unilogr: path.resolve(__dirname, 'src/unilogr-browser.ts'),
        };
        // Une seule instance des modules ProseMirror (évite "multiple versions" et TypeError localsInner/members)
        viteConf.resolve.dedupe = [
          ...(viteConf.resolve.dedupe || []),
          'prosemirror-model',
          'prosemirror-state',
          'prosemirror-view',
        ];
        // Stubs for packages that only exist in Capacitor/native (SPA runs in browser only)
        viteConf.resolve.alias['@revenuecat/purchases-capacitor'] = path.resolve(
          __dirname,
          'src/stubs/revenuecat.ts',
        );
        viteConf.resolve.alias['@capacitor/clipboard'] = path.resolve(
          __dirname,
          'src/stubs/capacitor-clipboard.ts',
        );
        // Réduire les warnings : boot logger (dynamically + statically imported), chunks > 500kb gérés par chunkSizeWarningLimit
        viteConf.build = viteConf.build || {};
        viteConf.build.rollupOptions = viteConf.build.rollupOptions || {};
        const onwarn = viteConf.build.rollupOptions.onwarn;
        viteConf.build.rollupOptions.onwarn = (warning, warn) => {
          const msg = typeof warning.message === 'string' ? warning.message : '';
          if (
            msg.includes('dynamically imported') && msg.includes('statically imported')
          ) {
            return;
          }
          if (onwarn) onwarn(warning, warn);
          else warn(warning);
        };
        if (visualizerPlugin) {
          viteConf.build.rollupOptions.plugins =
            viteConf.build.rollupOptions.plugins || [];
          viteConf.build.rollupOptions.plugins.push(visualizerPlugin);
        }
      },
      // viteVuePluginOptions: {},

      vitePlugins: [
        [
          '@intlify/unplugin-vue-i18n/vite',
          {
            // if you want to use Vue I18n Legacy API, you need to set `compositionOnly: false`
            // compositionOnly: false,

            // you need to set i18n resource including paths !
            include: path.resolve(__dirname, './src/i18n/**'),
          },
        ],

        AutoImport({
          // targets to transform
          include: [
            /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
            /\.vue$/,
            /\.vue\?vue/, // .vue
            /\.md$/, // .md
          ],

          // global imports to register
          imports: [
            // presets
            'vue',
            'vue-router',
            {
              'src/boot/logger.client': ['mainLogger'],

              'src/code/trpc': ['trpcClient'],

              'src/code/internals': ['internals'],

              'src/code/stores': [
                'appStore',
                'authStore',
                'uiStore',
                'pagesStore',
              ],
              'src/code/helpers': ['router', 'route', '$quasar'],

              'src/code/utils/use-meta': ['useMeta'],

              'src/components/CustomDialog.vue': [['default', 'CustomDialog']],

              quasar: [
                'useQuasar',
                'Notify',
                'Cookies',
                'Dialog',
                'useDialogPluginComponent',
              ],
            },
          ],

          // Auto import for module exports under directories
          // by default it only scan one level of modules under the directory
          dirs: [
            // './hooks',
            // './composables' // only root modules
            // './composables/**', // all nested modules
            // ...
          ],

          // Filepath to generate corresponding .d.ts file.
          // Defaults to './auto-imports.d.ts' when `typescript` is installed locally.
          // Set `false` to disable.
          dts: './auto-imports.d.ts',
        }),

        VueComponents({
          dts: true,
        }),
      ],
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      https: false,
      open: false, // opens browser window automatically
      port: port,
      host: '0.0.0.0',
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
    framework: {
      config: {
        dark: true,
      },

      iconSet: 'mdi-v7', // aligné avec extras (icônes mdi-* uniquement dans le code)
      // lang: 'en-US', // Quasar language pack

      // components/directives : auto-import via unplugin-vue-components (tree-shaking)
      // directives utilisées : v-ripple, v-close-popup

      // Quasar plugins (Dialog, Notify, Loading, $q ; Cookies/Meta utilisés dans le code)
      plugins: ['Notify', 'Cookies', 'Meta', 'Dialog', 'Loading'],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'generateSW', // or 'injectManifest'
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
      // useFilenameHashes: true,
      // extendGenerateSWOptions (cfg) {}
      // extendInjectManifestOptions (cfg) {},
      // extendManifestJson (json) {}
      // extendPWACustomSWConf (esbuildConf) {}
    },

  };
});
