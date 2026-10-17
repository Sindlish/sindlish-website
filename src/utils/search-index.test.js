import { describe, it, expect } from 'vitest';

import {
  buildSearchIndex,
  extractCodeIdentifiers,
  extractHeadings,
  searchDocs,
} from './search-index.js';

const POSTS = [
  {
    slug: 'basics/variables',
    title: 'Variables',
    summary: 'Store values in named variables.',
    content: [
      'A variable holds a value. Text is called `lafz` in Sindlish.',
      '',
      '## Dynamic typing is the default',
      '',
      '```sd',
      'lafz city = "Karachi"',
      'ubah(city)',
      '```',
      '',
    ].join('\n'),
  },
  {
    slug: 'reference/keywords',
    title: 'Keywords',
    summary: 'Every keyword and what it means.',
    content: ['## Types', '', '`lafz` is the word for text.', '', '```sd', 'likh("hi")', '```', ''].join(
      '\n'
    ),
  },
  {
    slug: 'reference/operators',
    title: 'Operators',
    summary: 'Arithmetic and comparison operators.',
    content: ['## Arithmetic', '', 'Use `+` to add numbers.', ''].join('\n'),
  },
];

describe('extractCodeIdentifiers', () => {
  it('collects identifiers from runnable fences and inline code', () => {
    const ids = extractCodeIdentifiers(
      ['Some `lafz` prose.', '```sd', 'likh(x)', '```', '```bash', 'npm install', '```'].join('\n')
    );

    expect(ids).toContain('lafz');
    expect(ids).toContain('likh');
    expect(ids).toContain('x');
    // bash fences are not Sindlish code identifiers
    expect(ids).not.toContain('npm');
  });
});

describe('extractHeadings', () => {
  it('collects headings outside code fences', () => {
    const headings = extractHeadings(
      ['# Title', '', '```sd', '# not a heading', '```', '', '## Real heading'].join('\n')
    );

    expect(headings).toEqual(['Title', 'Real heading']);
  });
});

describe('buildSearchIndex', () => {
  it('produces a deterministic index with title, summary and code tokens', () => {
    const index = buildSearchIndex(POSTS);

    expect(index.version).toBe(1);
    expect(index.docs).toHaveLength(3);

    const variables = index.docs.find((doc) => doc.slug === 'basics/variables');
    expect(variables.title).toBe('Variables');
    expect(variables.summary).toBe('Store values in named variables.');
    expect(variables.url).toBe('/docs/basics/variables');
    expect(variables.code).toContain('lafz');
    expect(variables.code).toContain('ubah');

    // Same input, same output.
    expect(JSON.stringify(buildSearchIndex(POSTS))).toBe(JSON.stringify(index));
  });
});

describe('searchDocs', () => {
  const index = buildSearchIndex(POSTS);

  it('returns nothing for an empty query', () => {
    expect(searchDocs(index, '')).toEqual([]);
  });

  it('survives a typo in prose (fuzzy matching)', () => {
    const results = searchDocs(index, 'lafs');

    expect(results.length).toBeGreaterThan(0);
    expect(results.map((result) => result.slug)).toContain('basics/variables');
    expect(results.every((result) => result.kind === 'prose')).toBe(true);
  });

  it('treats a call-syntax term as a strict code identifier', () => {
    const exact = searchDocs(index, 'ubah()');

    expect(exact).toHaveLength(1);
    expect(exact[0].slug).toBe('basics/variables');
    expect(exact[0].kind).toBe('code');

    // A misspelled identifier is not a code hit.
    const typo = searchDocs(index, 'ubha()');
    expect(typo.some((result) => result.kind === 'code')).toBe(false);
  });

  it('labels prose hits distinctly from code hits', () => {
    const prose = searchDocs(index, 'lafz');
    const code = searchDocs(index, 'likh()');

    expect(prose.every((result) => result.kind === 'prose')).toBe(true);
    expect(code).toHaveLength(1);
    expect(code[0].kind).toBe('code');
  });

  it('ranks title matches above body matches', () => {
    const results = searchDocs(index, 'operators');

    expect(results[0].slug).toBe('reference/operators');
  });
});
