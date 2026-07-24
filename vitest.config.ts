import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, '**/.next/**', 'tests/smoke/e2e/**'],
  },
});
