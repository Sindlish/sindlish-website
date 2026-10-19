import { readFileSync } from 'node:fs';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import buildMetadata from 'utils/get-metadata';

// The metadata helper is a pure function whose output becomes a contract:
// `robots.index` and `alternates.canonical` are exactly what the served page
// emits. The workbench regression (a call site passing a retired `robotsNoindex`
// key that the helper silently ignored) is what these cases lock down.

const SITE_URL = 'https://sindlish.org';

const base = { title: 'Test', description: 'Test' };

describe('buildMetadata', () => {
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

  it('indexes a normal page in production and canonicalises it to its pathname', () => {
    process.env.VERCEL_ENV = 'production';
    const metadata = buildMetadata({ ...base, pathname: '/docs/introduction' });

    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.alternates.canonical).toBe(`${SITE_URL}/docs/introduction`);
  });

  it('turns indexing off and emits no canonical for `noindex: true`', () => {
    process.env.VERCEL_ENV = 'production';
    const metadata = buildMetadata({ ...base, pathname: '/workbench', noindex: true });

    expect(metadata.robots.index).toBe(false);
    expect(metadata.alternates.canonical).toBeUndefined();
  });

  it('emits a canonical for a noindexed page only when it explicitly owns one', () => {
    process.env.VERCEL_ENV = 'production';
    const metadata = buildMetadata({
      ...base,
      pathname: '/docs/basics/loops',
      noindex: true,
      canonical: true,
    });

    expect(metadata.robots.index).toBe(false);
    expect(metadata.alternates.canonical).toBe(`${SITE_URL}/docs/basics/loops`);
  });

  it('never emits a canonical outside production', () => {
    delete process.env.VERCEL_ENV;
    delete process.env.NEXT_PUBLIC_VERCEL_ENV;
    const metadata = buildMetadata({
      ...base,
      pathname: '/docs/introduction',
      canonical: true,
      noindex: true,
    });

    expect(metadata.robots.index).toBe(false);
    expect(metadata.alternates.canonical).toBeUndefined();
  });
});

describe('the workbench routes opt out of indexing', () => {
  const read = (file) => readFileSync(path.resolve(process.cwd(), file), 'utf8');

  it.each(['src/app/workbench/page.jsx', 'src/app/workbench/docs/[[...slug]]/page.jsx'])(
    'passes a truthy `noindex` and no retired `robotsNoindex` in %s',
    (file) => {
      const source = read(file);

      expect(source).toContain('noindex: true');
      expect(source).not.toContain('robotsNoindex');
    }
  );
});
