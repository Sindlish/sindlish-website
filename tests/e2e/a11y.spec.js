const AxeBuilder = require('@axe-core/playwright').default;
const { test, expect } = require('@playwright/test');

const { mockCreatorProfile, waitForCreatorProfile } = require('./helpers');

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

// Known accessibility debt, reported as a follow-up rather than fixed in the
// test-harness change:
// - Shiki's syntax palette on docs code blocks drops below the 4.5:1 text
//   contrast threshold (e.g. the orange function token is 3.06:1 on white).
// Everything else on the page is still scanned, so a new violation fails.
// Monaco's third-party editor internals are excluded from the workbench scan
// for the same reason (its line-number and token colours are below 4.5:1).
const KNOWN_VIOLATIONS = {
  'docs article': [
    {
      id: 'color-contrast',
      matches: (node) => node.target.some((target) => target.startsWith('pre[data-language=')),
    },
  ],
};

const unexpectedViolations = (violations, pageName) => {
  const known = KNOWN_VIOLATIONS[pageName] || [];

  return violations.flatMap((violation) => {
    const unexpectedNodes = violation.nodes.filter(
      (node) => !known.some((rule) => rule.id === violation.id && rule.matches(node))
    );

    return unexpectedNodes.length ? [{ ...violation, nodes: unexpectedNodes }] : [];
  });
};

const describeViolations = (violations) =>
  violations
    .map((violation) => {
      const targets = violation.nodes.map((node) => node.target.join(' ')).join(' | ');
      return `${violation.id} (${violation.impact}): ${violation.help} -> ${targets}`;
    })
    .join('\n');

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'docs index', path: '/docs' },
  { name: 'docs article', path: '/docs/introduction' },
  { name: 'search', path: '/search?q=loop' },
  { name: 'download', path: '/download' },
  { name: 'creator', path: '/creator', mockCreator: true },
  {
    name: 'workbench',
    path: '/workbench',
    // Give Monaco and the interpreter time to settle before scanning.
    ready: async (page) => {
      await expect(page.locator('#pane-editor .monaco-editor')).toBeVisible({ timeout: 60000 });
      await expect(page.locator('#run-button')).toBeEnabled({ timeout: 60000 });
    },
  },
];

test.describe('axe scans', () => {
  for (const { name, path, mockCreator, ready } of PAGES) {
    test(`${name} has no WCAG A/AA violations`, async ({ page }) => {
      if (mockCreator) await mockCreatorProfile(page);

      await page.goto(path);
      if (mockCreator) await waitForCreatorProfile(page);
      if (ready) await ready(page);

      const builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
      if (name === 'workbench') builder.exclude('.monaco-editor');

      const results = await builder.analyze();
      const violations = unexpectedViolations(results.violations, name);

      expect(violations, describeViolations(violations)).toEqual([]);
    });
  }
});
