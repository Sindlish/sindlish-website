const { test, expect } = require('@playwright/test');

const { gotoAndSettle, mockCreatorProfile, settle, waitForCreatorProfile } = require('./helpers');

// Every screenshot is full-page at the fixed 1280x720 / DPR 1 / light /
// reduced-motion viewport from playwright.config.js. Baselines live in
// tests/e2e/__screenshots__ and are blocking. Update them deliberately with
// `npm run test:e2e:update` and include the changed PNGs in the commit.
const PAGES = [
  { name: 'home', path: '/' },
  { name: 'docs-index', path: '/docs' },
  { name: 'docs-introduction', path: '/docs/introduction' },
  { name: 'search-loop', path: '/search?q=loop' },
  { name: 'download', path: '/download' },
  { name: 'creator', path: '/creator', mockCreator: true },
];

test.describe('visual regression', () => {
  for (const { name, path, mockCreator } of PAGES) {
    test(`${name} matches its committed baseline`, async ({ page }) => {
      if (mockCreator) await mockCreatorProfile(page);

      await gotoAndSettle(page, path);

      if (mockCreator) await waitForCreatorProfile(page);
      await settle(page);

      await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
    });
  }
});
