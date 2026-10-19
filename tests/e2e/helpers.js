const { expect } = require('@playwright/test');

// The /creator page reads a live GitHub profile. Tests serve a fixed payload so
// the DOM and the screenshots never depend on the network or on GitHub's data.
const CREATOR_PROFILE = {
  login: 'AmanatAliPanhwer',
  name: 'Amanat Ali Panhwer',
  avatar_url: '/images/og/default.png',
  html_url: 'https://github.com/AmanatAliPanhwer',
  public_repos: 42,
  followers: 128,
  following: 7,
  location: 'Sindh, Pakistan',
  company: 'Sindlish',
  bio: 'Building Sindlish, the first Sindhi programming language.',
  created_at: '2020-01-01T00:00:00Z',
};

const mockCreatorProfile = (page) =>
  page.route('https://api.github.com/users/AmanatAliPanhwer', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CREATOR_PROFILE),
    })
  );

const waitForCreatorProfile = (page) =>
  expect(page.getByRole('heading', { name: CREATOR_PROFILE.name })).toBeVisible();

/**
 * Make a page screenshot-stable: kill CSS motion, walk the whole document so
 * lazy images decode, and wait for webfonts and images. `reducedMotion` is also
 * set in the config, but the global style guarantees no transition is mid-flight.
 */
const settle = async (page) => {
  await page.addStyleTag({
    content:
      '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }',
  });

  await page.evaluate(async () => {
    await document.fonts.ready;

    const step = Math.max(200, Math.floor(window.innerHeight / 2));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const pending = Array.from(document.images)
      .filter((image) => !image.complete)
      .map(
        (image) =>
          new Promise((resolve) => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
          })
      );

    await Promise.all(pending);
    await document.fonts.ready;
  });

  await page.waitForTimeout(150);
};

const gotoAndSettle = async (page, path) => {
  await page.goto(path, { waitUntil: 'load' });
  await settle(page);
};

module.exports = {
  CREATOR_PROFILE,
  gotoAndSettle,
  mockCreatorProfile,
  settle,
  waitForCreatorProfile,
};
