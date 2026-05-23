import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: [
      'packages/**/src/**/*.spec.ts',
      'apps/**/src/**/*.spec.ts',
      'tests/**/*.spec.ts',
    ],
  },
});
