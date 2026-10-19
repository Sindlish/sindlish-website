const { test, expect } = require('@playwright/test');

const KEY_ROUTES = [
  '/',
  '/docs',
  '/docs/introduction',
  '/docs/basics/loops',
  '/search?q=loop',
  '/download',
  '/creator',
  '/workbench',
  '/workbench/docs/basics/loops',
  '/manifest.json',
  '/docs/introduction.md',
];

const jsonLd = async (page, id) => {
  const script = page.locator(`script#${id}`);
  await expect(script).toHaveCount(1);
  return JSON.parse(await script.textContent());
};

test.describe('site routes and rendered content', () => {
  for (const route of KEY_ROUTES) {
    test(`serves ${route}`, async ({ request }) => {
      const response = await request.get(route);
      expect(response.status()).toBe(200);
    });
  }

  test('unknown docs and site routes return 404', async ({ request }) => {
    for (const route of [
      '/docs/does-not-exist',
      '/does-not-exist',
      '/workbench/docs/does-not-exist',
    ]) {
      const response = await request.get(route);
      expect(response.status(), route).toBe(404);
    }
  });

  test('renders the docs article server-side', async ({ page }) => {
    await page.goto('/docs/introduction');
    await expect(page.getByRole('heading', { level: 1, name: 'Introduction' })).toBeVisible();
    await expect(page.getByText('Salam, Sindh!').first()).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Documentation' }).first()).toBeVisible();
  });

  test('renders search hits server-side for a query', async ({ page }) => {
    await page.goto('/search?q=loop');

    await expect(page.getByRole('status').filter({ hasText: /results for/ })).toContainText(
      /results for/
    );
    await expect(page.locator('a[href="/docs/basics/loops"]:visible').first()).toBeVisible();
    await expect(page.locator('#search-input')).toHaveValue('loop');
  });

  test('playground redirects to workbench and preserves the query', async ({ page, request }) => {
    const redirect = await request.get('/playground?code=abc', { maxRedirects: 0 });
    expect(redirect.status()).toBe(308);
    expect(redirect.headers().location).toBe('/workbench?code=abc');

    await page.goto('/playground?code=abc');
    await expect(page).toHaveURL(/\/workbench\?code=abc$/);
    await expect(page.locator('#run-button')).toBeEnabled({ timeout: 60000 });
  });
});

test.describe('metadata, structured data, sitemap and robots', () => {
  test('docs page carries its title, description and article Open Graph data', async ({ page }) => {
    await page.goto('/docs/introduction');

    await expect(page).toHaveTitle('Introduction - Sindlish');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'What Sindlish is and how this guide teaches it to you, step by step.'
    );

    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Introduction'
    );
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
      'content',
      '1200'
    );
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute(
      'content',
      '630'
    );

    const alternate = page.locator('link[rel="alternate"][type="text/markdown"]');
    await expect(alternate).toHaveCount(1);
    const alternateHref = await alternate.getAttribute('href');
    expect(new URL(alternateHref, page.url()).pathname).toBe('/docs/introduction.md');

    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.json');
    await expect(page.locator('link[rel="icon"]')).toHaveCount(3);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  });

  test('non-production pages are noindex and carry no canonical', async ({ page }) => {
    for (const route of ['/docs/introduction', '/workbench', '/search?q=loop']) {
      await page.goto(route);
      await expect(page.locator('meta[name="robots"]'), route).toHaveAttribute(
        'content',
        /noindex/
      );
      await expect(page.locator('link[rel="canonical"]'), route).toHaveCount(0);
    }
  });

  test('home page uses the absolute site title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Sindlish - The First Sindhi Programming Language');
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
  });

  test('publishes the site, docs and creator JSON-LD graphs', async ({ page }) => {
    await page.goto('/docs/introduction');

    const site = await jsonLd(page, 'site-json-ld');
    const types = site['@graph'].map((node) => node['@type']);
    expect(types).toEqual(expect.arrayContaining(['WebSite', 'Organization']));
    const website = site['@graph'].find((node) => node['@type'] === 'WebSite');
    expect(website.potentialAction['@type']).toBe('SearchAction');
    expect(website.potentialAction.target.urlTemplate).toContain('/search?q=');

    const article = await jsonLd(page, 'docs-json-ld');
    expect(article['@type']).toBe('Article');
    expect(article.headline).toBe('Introduction');
    expect(article.inLanguage).toBe('en');

    await page.goto('/creator');
    const person = await jsonLd(page, 'creator-json-ld');
    expect(person['@type']).toBe('Person');
    expect(person.name).toBe('Amanat Ali Panhwer');
  });

  test('sitemap lists the real routes and excludes noindex routes', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);

    const xml = await response.text();
    const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
      ([, location]) => new URL(location).pathname
    );

    expect(paths).toEqual(
      expect.arrayContaining(['/', '/docs', '/docs/introduction', '/download', '/creator'])
    );
    expect(paths).not.toContain('/search');
    expect(paths).not.toContain('/workbench');
    expect(paths).not.toContain('/playground');
  });

  test('robots disallows a non-production deployment', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain('User-Agent: *');
    expect(body).toContain('Disallow: /');
    expect(body).not.toContain('Allow: /');
  });

  test('serves the markdown twin and negotiates markdown for docs', async ({ request }) => {
    const twin = await request.get('/docs/introduction.md');
    expect(twin.status()).toBe(200);
    expect(twin.headers()['content-type']).toContain('text/markdown');
    expect(await twin.text()).toContain('# Introduction');

    const negotiated = await request.get('/docs/introduction', {
      headers: { Accept: 'text/markdown' },
    });
    expect(negotiated.status()).toBe(200);
    expect(negotiated.headers()['content-type']).toContain('text/markdown');
    expect(negotiated.headers()['x-robots-tag']).toBe('noindex');
    expect(negotiated.headers().link).toContain('rel="llms-txt"');
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the docs index and article still render and link', async ({ page }) => {
    await page.goto('/docs');

    await expect(page.getByRole('heading', { level: 1, name: 'Documentation' })).toBeVisible();
    await expect(page.locator('a[href="/docs/introduction"]:visible').first()).toBeVisible();

    await page.goto('/docs/introduction');

    await expect(page.getByRole('heading', { level: 1, name: 'Introduction' })).toBeVisible();
    await expect(page.getByText('Salam, Sindh!').first()).toBeVisible();
    await expect(page.locator('a[href="/docs/get-started/installation"]').first()).toBeVisible();
  });

  test('search results are server-rendered', async ({ page }) => {
    await page.goto('/search?q=loop');

    await expect(page.getByRole('status').filter({ hasText: /results for/ })).toContainText(
      /results for/
    );
    await expect(page.locator('a[href="/docs/basics/loops"]:visible').first()).toBeVisible();
  });
});
