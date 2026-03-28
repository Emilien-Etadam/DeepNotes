import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import vue from '@vitejs/plugin-vue';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import AutoImport from 'unplugin-auto-import/vite';
import VueComponents from 'unplugin-vue-components/vite';
import { defineConfig, type PluginOption } from 'vite';
import vuetify from 'vite-plugin-vuetify';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { visualizer } =
  require('rollup-plugin-visualizer') as typeof import('rollup-plugin-visualizer');

function hashFNV1a(str: string, seed = 0x811c9dc5) {
  let hval = seed;
  for (let i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval +=
      (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return hval >>> 0;
}

const envPath = path.resolve(__dirname, '../../.env');
const rootEnvLoad = dotenv.config({ path: envPath });

const env = Object.assign(
  {},
  dotenvExpand.expand({
    ...rootEnvLoad,
    ...(rootEnvLoad.parsed?.DEV
      ? rootEnvLoad.parsed?.PRODEV
        ? dotenv.config({ path: path.resolve(__dirname, '../../.env.prodev') })
        : dotenv.config({ path: path.resolve(__dirname, '../../.env.dev') })
      : dotenv.config({ path: path.resolve(__dirname, '../../.env.prod') })),
  }).parsed,
  Object.fromEntries(
    Object.entries(process.env ?? {}).filter(([key]) => /^\w+$/.test(key)),
  ),
) as Record<string, string | undefined>;

const APP_URL =
  env.CLIENT_APP_URL || process.env.CLIENT_APP_URL || 'https://deepnotes.app';

const vitePrependScssPath = path
  .resolve(__dirname, 'src/css/vite-prepend.scss')
  .replace(/\\/g, '/');

function buildProcessEnvDefine(
  mode: string,
): Record<string, string | undefined> {
  return {
    ...env,
    APP_URL,
    CLIENT: 'true',
    DEV: mode === 'development' ? 'true' : 'false',
    VUE_ROUTER_MODE: 'hash',
    VUE_ROUTER_BASE: undefined,
  };
}

export default defineConfig(({ mode }) => {
  const port =
    1024 +
    (Math.abs(hashFNV1a(JSON.stringify({ mode: 'spa' }))) % (65536 - 1024));
  console.log(`Port: ${port}`);

  const processEnvKeys = buildProcessEnvDefine(mode);
  const define: Record<string, string> = {};
  for (const [k, v] of Object.entries(processEnvKeys)) {
    if (v === undefined) {
      define[`process.env.${k}`] = 'undefined';
    } else {
      define[`process.env.${k}`] = JSON.stringify(v);
    }
  }

  const visualizerPlugin =
    process.env.ANALYZE === 'true'
      ? visualizer({
          open: true,
          gzipSize: true,
          filename: path.resolve(__dirname, 'dist/stats.html'),
        })
      : null;

  const plugins: PluginOption[] = [
    vue(),
    vuetify({ autoImport: true }),
    VueI18nPlugin({
      include: path.resolve(__dirname, './src/i18n/**'),
    }),
    AutoImport({
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
      imports: [
        'vue',
        'vue-router',
        {
          'src/boot/logger.client': ['mainLogger'],
          'src/code/trpc': ['trpcClient'],
          'src/code/internals': ['internals'],
          'src/code/stores': ['appStore', 'authStore', 'uiStore', 'pagesStore'],
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
      dts: './auto-imports.d.ts',
    }),
    VueComponents({
      dts: true,
    }),
  ];

  return {
    define,
    plugins,
    resolve: {
      alias: {
        src: path.resolve(__dirname, 'src'),
        app: path.resolve(__dirname, '.'),
        assets: path.resolve(__dirname, 'src/assets'),
        boot: path.resolve(__dirname, 'src/boot'),
        components: path.resolve(__dirname, 'src/components'),
        layouts: path.resolve(__dirname, 'src/layouts'),
        pages: path.resolve(__dirname, 'src/pages'),
        stores: path.resolve(__dirname, 'src/stores'),
        'libsodium-wrappers-sumo': require.resolve('libsodium-wrappers-sumo'),
        unilogr: path.resolve(__dirname, 'src/unilogr-browser.ts'),
        '@revenuecat/purchases-capacitor': path.resolve(
          __dirname,
          'src/stubs/revenuecat.ts',
        ),
        '@capacitor/clipboard': path.resolve(
          __dirname,
          'src/stubs/capacitor-clipboard.ts',
        ),
      },
      dedupe: ['prosemirror-model', 'prosemirror-state', 'prosemirror-view'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api', 'import'],
          includePaths: [path.resolve(__dirname, 'src/css')],
          additionalData: `@use '${vitePrependScssPath}' as *;\n`,
        },
      },
    },
    build: {
      target: 'es2022',
      chunkSizeWarningLimit: 800,
      minify: true,
      rollupOptions: {
        onwarn(warning, warn) {
          const msg =
            typeof warning.message === 'string' ? warning.message : '';
          if (
            msg.includes('dynamically imported') &&
            msg.includes('statically imported')
          ) {
            return;
          }
          warn(warning);
        },
        plugins: visualizerPlugin ? [visualizerPlugin] : [],
      },
    },
    server: {
      host: '0.0.0.0',
      https: false,
      port,
    },
  };
});
