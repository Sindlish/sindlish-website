import { describe, expect, it } from 'vitest';

import { countPages, findCurrentPillarIndex, getPillarSections } from './nav-helpers';

const NAVIGATION = [
  {
    nav: 'Learn',
    slug: 'introduction',
    items: [
      {
        section: 'Getting Started',
        items: [
          { title: 'Welcome to Sindlish', slug: 'introduction' },
          { title: 'Installation', slug: 'get-started/installation' },
        ],
      },
      {
        section: 'The Basics',
        items: [{ title: 'Comments', slug: 'basics/comments' }],
      },
    ],
  },
  {
    nav: 'How-to',
    slug: 'how-to/index',
    items: [
      {
        section: 'Guides',
        items: [{ title: 'Overview', slug: 'how-to/index' }],
      },
    ],
  },
];

describe('countPages', () => {
  it('counts leaf pages across nested sections', () => {
    expect(countPages(NAVIGATION[0].items)).toBe(3);
    expect(countPages(NAVIGATION[1].items)).toBe(1);
  });

  it('returns 0 for empty input', () => {
    expect(countPages()).toBe(0);
    expect(countPages([])).toBe(0);
  });
});

describe('findCurrentPillarIndex', () => {
  it('matches a pillar by its own slug', () => {
    expect(findCurrentPillarIndex(NAVIGATION, '/docs/introduction')).toBe(0);
  });

  it('matches a descendant page', () => {
    expect(findCurrentPillarIndex(NAVIGATION, '/docs/basics/comments')).toBe(0);
    expect(findCurrentPillarIndex(NAVIGATION, '/docs/how-to/index')).toBe(1);
  });

  it('returns -1 for the /docs index and unknown paths', () => {
    expect(findCurrentPillarIndex(NAVIGATION, '/docs')).toBe(-1);
    expect(findCurrentPillarIndex(NAVIGATION, '/docs/')).toBe(-1);
    expect(findCurrentPillarIndex(NAVIGATION, '/nope')).toBe(-1);
  });
});

describe('getPillarSections', () => {
  it('groups pages under their section label', () => {
    const sections = getPillarSections(NAVIGATION[0].items);

    expect(sections).toHaveLength(2);
    expect(sections[0].title).toBe('Getting Started');
    expect(sections[0].pages).toHaveLength(2);
    expect(sections[1].title).toBe('The Basics');
  });
});
