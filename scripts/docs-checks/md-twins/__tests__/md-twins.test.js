/**
 * Markdown-twin completeness spec (issue #52, folds in T10).
 *
 * Pure diff/lookup rules first, then the check against the real tree — the
 * same assertion `npm run check:md-twins` makes.
 */

import { createRequire } from 'module';

import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

const { compareSets, findTwinSummaryLine, findTwinTitleLine } = require('../twins');
const { validate } = require('../validate');

describe('compareSets', () => {
  it('reports pages without twins and twins without pages', () => {
    const { missing, stale } = compareSets(
      ['docs/basics/variables.md', 'docs/basics/loops.md'],
      ['docs/basics/variables.md', 'docs/basics/comments.md']
    );

    expect(missing).toEqual(['docs/basics/loops.md']);
    expect(stale).toEqual(['docs/basics/comments.md']);
  });

  it('passes when the sets agree', () => {
    expect(compareSets(['docs/a.md'], ['docs/a.md'])).toEqual({ missing: [], stale: [] });
  });
});

describe('findTwinTitleLine and findTwinSummaryLine', () => {
  const twin = [
    '> Full Sindlish documentation index: https://sindlish.org/docs/llms.txt',
    '',
    '# Variables',
    '',
    '> Store values in named variables and declare their types.',
    '',
    'A **variable** is a name that points to a value.',
  ];

  it('finds the frontmatter-derived heading and summary line', () => {
    expect(findTwinTitleLine(twin, 'Variables')).toBe(3);
    expect(findTwinSummaryLine(twin, 'Store values in named variables and declare their types.')).toBe(
      5
    );
  });

  it('returns -1 when the twin disagrees with the frontmatter', () => {
    expect(findTwinTitleLine(twin, 'Variable')).toBe(-1);
    expect(findTwinSummaryLine(twin, 'A competing summary.')).toBe(-1);
  });
});

describe('the real tree', () => {
  it(
    'exports every page with matching title and summary',
    () => {
      const { errors, invocations } = validate(process.cwd());

      expect(invocations).toBeGreaterThan(0);
      expect(errors.map((error) => `${error.file}:${error.line} ${error.message}`)).toEqual([]);
    },
    60000
  );
});
