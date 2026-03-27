import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: 'src', replacement: path.resolve(dirname, 'src') },
      {
        find: /^@deeplib\/([^/]+)\/src\/(.+)$/,
        replacement: path.resolve(dirname, '../../packages/@deeplib/$1/src/$2'),
      },
      {
        find: /^@deeplib\/([^/]+)$/,
        replacement: path.resolve(dirname, '../../packages/@deeplib/$1/src'),
      },
      {
        find: /^@stdlib\/([^/]+)\/src\/(.+)$/,
        replacement: path.resolve(dirname, '../../packages/@stdlib/$1/src/$2'),
      },
      {
        find: /^@stdlib\/([^/]+)$/,
        replacement: path.resolve(dirname, '../../packages/@stdlib/$1/src'),
      },
    ],
  },
  test: {
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    setupFiles: ['src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/__tests__/**'],
    },
  },
});
