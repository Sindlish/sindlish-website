const { defineConfig, devices } = require('@playwright/test');

const PORT = Number(process.env.PORT) || 3000;
const baseURL = `http://localhost:${PORT}`;

// The E2E suite runs against the production build, never `next dev`. The
// webServer builds once and serves the result; metadata, sitemap/robots and the
// markdown twins are all read from that build.
//
// Visual baselines are committed under tests/e2e/__screenshots__ and are
// blocking: a changed screenshot fails `npm test` until it is reviewed and
// regenerated with `npm run test:e2e:update`.
module.exports = defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 120000,
  expect: {
    timeout: 15000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.02,
      threshold: 0.2,
    },
  },
  // One baseline per screenshot, independent of the machine's path or the
  // browser project name. Baselines are generated on Chromium only.
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  use: {
    baseURL,
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    locale: 'en-US',
    timezoneId: 'UTC',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    launchOptions: {
      // Keep glyph rasterisation as stable as Chromium allows across hosts.
      args: ['--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
      },
    },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 600000,
    env: {
      PORT: String(PORT),
      NEXT_PUBLIC_DEFAULT_SITE_URL: baseURL,
      // Test the documented non-production behaviour (noindex, no canonical,
      // Disallow: /). Production metadata is covered by unit tests.
      VERCEL_ENV: '',
      NEXT_PUBLIC_VERCEL_ENV: '',
    },
  },
});
