/**
 * Gate 2 spec: internal links (issue #52).
 *
 * Two layers: the pure rules (extraction, classification, resolution) are
 * tested against hand-built inventories, and the gate is then asserted against
 * the real tree — the same assertion `npm run check:links` makes.
 */

import { createRequire } from 'module';

import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

const {
  checkLinks,
  classifyHref,
  extractLinks,
  matchesAppRoute,
  normalizeInternalPath,
  resolveInternalHref,
} = require('../links');
const { validate } = require('../validate');

const inventory = {
  docsPages: new Set(['basics/variables', 'how-to/index']),
  appRoutes: [
    { path: '/', dynamic: false },
    { path: '/docs', dynamic: false },
    { path: '/docs/og', dynamic: false },
    { path: '/search', dynamic: false },
    { path: '/workbench/docs', dynamic: true },
  ],
  publicFiles: new Set(['/favicon.ico', '/images/screenshot.png']),
  redirectSources: new Set(['/playground']),
};

describe('classifyHref', () => {
  it('classifies the five href shapes', () => {
    expect(classifyHref('https://sindlish.org/docs')).toBe('external');
    expect(classifyHref('//cdn.sindlish.org/logo.svg')).toBe('external');
    expect(classifyHref('mailto:hello@sindlish.org')).toBe('external');
    expect(classifyHref('#anchor')).toBe('fragment');
    expect(classifyHref('/docs/basics/variables')).toBe('internal');
    expect(classifyHref('../../README.md')).toBe('relative');
    expect(classifyHref('')).toBe('empty');
  });
});

describe('normalizeInternalPath', () => {
  it('drops query strings, fragments and trailing slashes', () => {
    expect(normalizeInternalPath('/docs/basics/variables#loops')).toBe('/docs/basics/variables');
    expect(normalizeInternalPath('/search?q=lists')).toBe('/search');
    expect(normalizeInternalPath('/docs/')).toBe('/docs');
    expect(normalizeInternalPath('/docs//basics//variables')).toBe('/docs/basics/variables');
  });
});

describe('matchesAppRoute', () => {
  it('matches static routes exactly', () => {
    expect(matchesAppRoute('/search', inventory.appRoutes)).toBe(true);
    expect(matchesAppRoute('/searching', inventory.appRoutes)).toBe(false);
  });

  it('matches dynamic routes at and below their prefix', () => {
    expect(matchesAppRoute('/workbench/docs', inventory.appRoutes)).toBe(true);
    expect(matchesAppRoute('/workbench/docs/basics/variables', inventory.appRoutes)).toBe(true);
    expect(matchesAppRoute('/workbenching/docs', inventory.appRoutes)).toBe(false);
  });
});

describe('resolveInternalHref', () => {
  it('resolves docs pages, the docs index, static docs routes and public files', () => {
    expect(resolveInternalHref('/docs', inventory).ok).toBe(true);
    expect(resolveInternalHref('/docs/basics/variables', inventory).ok).toBe(true);
    expect(resolveInternalHref('/docs/basics/variables/', inventory).ok).toBe(true);
    expect(resolveInternalHref('/docs/og', inventory).ok).toBe(true);
    expect(resolveInternalHref('/favicon.ico', inventory).ok).toBe(true);
  });

  it('fails a docs slug the corpus does not have, even though the catch-all route exists', () => {
    const result = resolveInternalHref('/docs/basics/variable', inventory);

    expect(result.ok).toBe(false);
    expect(result.reason).toContain('no docs page');
  });

  it('resolves dynamic routes, public files and legacy redirects', () => {
    expect(resolveInternalHref('/workbench/docs/basics/variables', inventory).ok).toBe(true);
    expect(resolveInternalHref('/images/screenshot.png', inventory).ok).toBe(true);
    expect(resolveInternalHref('/playground', inventory).ok).toBe(true);
  });

  it('fails a route nothing serves', () => {
    const result = resolveInternalHref('/nope', inventory);

    expect(result.ok).toBe(false);
    expect(result.reason).toContain('no app route');
  });
});

describe('extractLinks', () => {
  it('finds markdown, reference-definition and HTML links with line numbers', () => {
    const markdown = [
      'Intro.',
      '',
      'See [Variables](/docs/basics/variables) and [Lists](/docs/data-structures/lists).',
      '',
      'An ![alt](/images/screenshot.png) image is not a link.',
      '',
      'Inline code `[not](/docs/a-link)` is ignored.',
      '',
      '```md',
      '[fenced](/docs/not-a-link)',
      '```',
      '',
      'A raw <a href="/docs/how-to/index">anchor</a> counts.',
      '',
      'Ref: [Guide][guide]',
      '',
      '[guide]: /docs/basics/loops',
    ].join('\n');

    const links = extractLinks(markdown);

    expect(links).toEqual([
      { href: '/docs/basics/variables', line: 3 },
      { href: '/docs/data-structures/lists', line: 3 },
      { href: '/docs/how-to/index', line: 13 },
      { href: '/docs/basics/loops', line: 17 },
    ]);
  });
});

describe('checkLinks', () => {
  it('reports unresolvable internal links and ignores everything else', () => {
    const markdown = [
      '[ok](/docs/basics/variables)',
      '[typo](/docs/basics/variable)',
      '[external](https://example.com/does-not-exist)',
      '[fragment](#somewhere)',
      '[relative](../README.md)',
    ].join('\n');

    const errors = checkLinks(markdown, inventory);

    expect(errors).toHaveLength(1);
    expect(errors[0].line).toBe(2);
    expect(errors[0].message).toContain('/docs/basics/variable');
  });
});

describe('the real tree', () => {
  it('has no unresolvable internal links', () => {
    const { errors, invocations } = validate(process.cwd());

    expect(invocations).toBeGreaterThan(0);
    expect(errors.map((error) => `${error.file}:${error.line} ${error.message}`)).toEqual([]);
  });
});
