import path from 'path';

import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    // The Playwright suite lives in tests/e2e and is run by `npm test`, not
    // Vitest. Without this it is collected by the default *.spec.js glob.
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      app: path.resolve(__dirname, './src/app'),
      components: path.resolve(__dirname, './src/components'),
      constants: path.resolve(__dirname, './src/constants'),
      utils: path.resolve(__dirname, './src/utils'),
    },
  },
});
