/**
 * Manual a11y checklist spec (issue #52).
 *
 * The parser runs against a hand-built checklist — including two deliberately
 * malformed ones — then the real checklist file is asserted, the same
 * assertion `npm run check:a11y` makes.
 */

import { createRequire } from 'module';

import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

const { EXPECTED_ITEMS, parseChecklist, validateRoutes } = require('../checklist');
const { validate } = require('../validate');

const buildChecklist = (count, { route = '/docs', skipField = null } = {}) => {
  const items = [];

  for (let number = 1; number <= count; number += 1) {
    items.push(
      [
        `### ${number}. Check number ${number}`,
        skipField === 'Route' ? null : `- **Route:** \`${route}\``,
        skipField === 'Selector' ? null : '- **Selector:** `main h1`',
        skipField === 'How to verify' ? null : '- **How to verify:** Press the thing.',
        '- **Enforcement:** manual.',
      ]
        .filter(Boolean)
        .join('\n')
    );
  }

  return `# Manual accessibility checklist\n\n${items.join('\n\n')}\n`;
};

describe('parseChecklist', () => {
  it('parses items with their four fields and line numbers', () => {
    const { items, errors } = parseChecklist(buildChecklist(EXPECTED_ITEMS));

    expect(errors).toEqual([]);
    expect(items).toHaveLength(EXPECTED_ITEMS);
    expect(items[0].heading).toBe('Check number 1');
    expect(items[0].fields.Route.value).toBe('`/docs`');
    expect(items[0].fields.Route.line).toBe(4);
  });

  it('fails when the item count drifts from the spec', () => {
    const { errors } = parseChecklist(buildChecklist(EXPECTED_ITEMS - 1));

    expect(errors).toHaveLength(1);
    expect(errors[0].kind).toBe('a11y-checklist/item-count');
    expect(errors[0].message).toContain('exactly 8');
  });

  it('fails when an item loses a required field', () => {
    const { errors } = parseChecklist(buildChecklist(EXPECTED_ITEMS, { skipField: 'Selector' }));

    expect(errors).toHaveLength(EXPECTED_ITEMS);
    expect(errors.every((error) => error.kind === 'a11y-checklist/missing-field')).toBe(true);
    expect(errors[0].message).toContain('Selector');
  });
});

describe('validateRoutes', () => {
  it('flags a route that is not site-absolute or no longer resolves', () => {
    const { items } = parseChecklist(
      [
        '### 1. Live route',
        '- **Route:** `/docs`',
        '- **Selector:** `main`',
        '- **How to verify:** Look.',
        '- **Enforcement:** manual.',
        '',
        '### 2. Relative route',
        '- **Route:** `docs/old-page`',
        '- **Selector:** `main`',
        '- **How to verify:** Look.',
        '- **Enforcement:** manual.',
        '',
        '### 3. Retired route',
        '- **Route:** `/docs/retired-page`',
        '- **Selector:** `main`',
        '- **How to verify:** Look.',
        '- **Enforcement:** manual.',
      ].join('\n')
    );

    const errors = validateRoutes(items, (route) => route === '/docs');

    expect(errors.map((error) => error.kind)).toEqual([
      'a11y-checklist/invalid-route',
      'a11y-checklist/dead-route',
    ]);
  });
});

describe('the real checklist', () => {
  it('has eight intact items pointing at live routes', () => {
    const { errors, invocations } = validate(process.cwd());

    expect(invocations).toBe(EXPECTED_ITEMS);
    expect(errors.map((error) => `${error.file}:${error.line} ${error.message}`)).toEqual([]);
  });
});
