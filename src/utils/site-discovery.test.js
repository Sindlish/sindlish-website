import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import robots from 'app/robots';
import sitemap from 'app/sitemap';
import { getMarkdownPath } from 'utils/ai-agent-detection';
import { getAllPosts } from 'utils/api-docs';

// Cross-checks the discovery surface that must agree on one route inventory:
// the native sitemap, the markdown-twin resolver and robots.txt. If a route is
// added to one and not the others, one of these fails.

const SITE_URL = 'https://sindlish.org';

// Routes that are deliberately absent from the sitemap and never get a twin.
const EXCLUDED_PATHS = ['/search', '/workbench', '/playground'];

const pathnameOf = (url) => new URL(url).pathname;

describe('site discovery consistency', () => {
  let savedEnv;

  beforeEach(() => {
    savedEnv = {
      NEXT_PUBLIC_DEFAULT_SITE_URL: process.env.NEXT_PUBLIC_DEFAULT_SITE_URL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
    };
    process.env.NEXT_PUBLIC_DEFAULT_SITE_URL = SITE_URL;
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('lists every indexable docs page exactly once', async () => {
    const listed = (await sitemap())
      .map((entry) => entry.url)
      .filter((url) => url.startsWith(`${SITE_URL}/docs/`));

    const expected = (await getAllPosts())
      .filter((post) => post && !post.noindex && !post.isDraft)
      .map((post) => `${SITE_URL}/docs/${post.slug}`);

    expect(new Set(listed)).toEqual(new Set(expected));
    expect(listed.length).toBe(new Set(listed).size);
  });

  it('ships the settled route inventory and nothing excluded', async () => {
    const paths = (await sitemap()).map((entry) => pathnameOf(entry.url));

    expect(paths).toEqual(expect.arrayContaining(['/', '/docs', '/download', '/creator']));
    expect(paths.length).toBe(new Set(paths).size);

    for (const excluded of EXCLUDED_PATHS) {
      expect(paths).not.toContain(excluded);
      expect(paths.some((path) => path.startsWith(`${excluded}/`))).toBe(false);
    }
  });

  it('resolves a markdown twin for every sitemap docs URL', async () => {
    const docsUrls = (await sitemap())
      .map((entry) => entry.url)
      .filter((url) => pathnameOf(url).startsWith('/docs/'));

    expect(docsUrls.length).toBeGreaterThan(0);

    for (const url of docsUrls) {
      const pathname = pathnameOf(url);
      expect(getMarkdownPath(pathname), `no twin mapping for ${pathname}`).toBe(`/md${pathname}.md`);
    }
  });

  it('never advertises a twin for an excluded route', () => {
    for (const pathname of [...EXCLUDED_PATHS, '/workbench/docs/getting-started']) {
      expect(getMarkdownPath(pathname)).toBeNull();
    }
  });

  it('allows the site in production and disallows it everywhere else', () => {
    process.env.VERCEL_ENV = 'production';
    const production = robots();
    expect(production.rules[0].allow).toBe('/');
    expect(production.rules[0].disallow).toBe('/search');
    expect(production.sitemap).toBe(`${SITE_URL}/sitemap.xml`);

    delete process.env.VERCEL_ENV;
    delete process.env.NEXT_PUBLIC_VERCEL_ENV;
    const preview = robots();
    expect(preview.rules[0].disallow).toBe('/');
    expect(preview.sitemap).toBeUndefined();
  });
});
