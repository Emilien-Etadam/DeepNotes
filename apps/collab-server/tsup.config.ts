import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true, // Clean output directory before each build

  entry: ['src/index.ts'],
  format: ['cjs'],
  minify: true,
  sourcemap: false,
  splitting: false,
  dts: false,
  // Keep libsodium out of bundle (top-level await in ESM, incompatible with CJS)
  external: ['libsodium-sumo', 'libsodium-wrappers-sumo'],
  noExternal: [/^(?!knex|ws|libsodium).+$/],
});
