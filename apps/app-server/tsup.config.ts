import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true, // Clean output directory before each build

  entry: ['src/index.ts'],
  format: ['cjs'],
  minify: true,
  sourcemap: false,
  splitting: false,
  dts: false,
  // Exclude libsodium* so they are not bundled (they use top-level await, incompatible with CJS)
  noExternal: [/^(?!ws|@getbrevo\/brevo|libsodium).+$/],
});
