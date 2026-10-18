/**
 * Gate 5 spec: navigation ↔ corpus (issue #52).
 *
 * The pure diff rules run against hand-built navigation data, then the gate
 * is asserted against the real tree — the same assertion `npm run check:nav`
 * makes.
 */

import { createRequire } from 'module';

import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

const { collectNavEntries, diffNavAgainstCorpus, findSlugLines } = require('../nav');
const { validate } = require('../validate');

const navigation = [
  {
    nav: 'Learn',
    slug: 'introduction',
    icon: 'start',
    items: [
      {
        section: 'Getting Started',
        icon: 'book',
        items: [
          { title: 'Welcome to Sindlish', slug: 'introduction' },
          { title: 'Installation', slug: 'get-started/installation' },
        ],
      },
    ],
  },
  { nav: 'How-to', slug: 'how-to/index', items: [{ title: 'Overview', slug: 'how-to/index' }] },
];

describe('collectNavEntries', () => {
  it('flattens leaves and keeps the breadcrumb path', () => {
    expect(collectNavEntries(navigation)).toEqual([
      { slug: 'introduction', title: 'Welcome to Sindlish', navPath: 'Learn > Getting Started' },
      { slug: 'get-started/installation', title: 'Installation', navPath: 'Learn > Getting Started' },
      { slug: 'how-to/index', title: 'Overview', navPath: 'How-to' },
    ]);
  });

  it('ignores pillar-level slugs, which the shell never renders as pages', () => {
    const slugs = collectNavEntries(navigation).map((entry) => entry.slug);

    expect(slugs).not.toContain('Learn');
  });
});

describe('diffNavAgainstCorpus', () => {
  it('finds nav entries with no file and files with no nav entry', () => {
    const entries = collectNavEntries(navigation);
    const { brokenNav, orphanPages } = diffNavAgainstCorpus(entries, [
      'introduction',
      'basics/variables',
    ]);

    expect(brokenNav.map((entry) => entry.slug)).toEqual(['get-started/installation', 'how-to/index']);
    expect(orphanPages).toEqual(['basics/variables']);
  });

  it('passes when the two views agree', () => {
    const entries = collectNavEntries(navigation);
    const { brokenNav, orphanPages } = diffNavAgainstCorpus(entries, [
      'introduction',
      'get-started/installation',
      'how-to/index',
    ]);

    expect(brokenNav).toEqual([]);
    expect(orphanPages).toEqual([]);
  });

  it('allows the same page in two pillars (a deliberate cross-reference)', () => {
    const entries = [
      ...collectNavEntries(navigation),
      { slug: 'introduction', title: 'Welcome', navPath: 'Concepts' },
    ];
    const { brokenNav } = diffNavAgainstCorpus(entries, [
      'introduction',
      'get-started/installation',
      'how-to/index',
    ]);

    expect(brokenNav).toEqual([]);
  });
});

describe('findSlugLines', () => {
  it('maps every slug: line to its line number', () => {
    const raw = ['- nav: Learn', '  slug: introduction', '  items:', '        - title: Installation', '          slug: get-started/installation'].join('\n');

    const lines = findSlugLines(raw);

    expect(lines.get('introduction')).toEqual([2]);
    expect(lines.get('get-started/installation')).toEqual([5]);
  });
});

describe('the real tree', () => {
  it('has no broken nav entries and no orphaned pages', () => {
    const { errors, invocations } = validate(process.cwd());

    expect(invocations).toBeGreaterThan(0);
    expect(errors.map((error) => `${error.file}:${error.line} ${error.message}`)).toEqual([]);
  });
});
