/**
 * Gate 3 spec: docs object to nothing absent (issue #52).
 *
 * The pure rules run against hand-built inputs, then the gate is asserted
 * against the real tree — the same assertion `npm run check:docs` makes.
 */

import { createRequire } from 'module';

import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

const {
  ALLOWED_FRONTMATTER_FIELDS,
  extractComponentRefs,
  extractImageRefs,
  parseComponentSurface,
  parseFrontmatterBlock,
  validateComponents,
  validateFrontmatter,
  validateImageRefs,
} = require('../references');
const { validate } = require('../validate');

describe('parseFrontmatterBlock', () => {
  it('parses keys with line numbers and finds the body start', () => {
    const lines = ['---', 'title: Variables', 'summary: Store values.', 'enableTableOfContents: true', '---', '', '# Body'];

    const result = parseFrontmatterBlock(lines);

    expect(result.keys.map((key) => key.name)).toEqual(['title', 'summary', 'enableTableOfContents']);
    expect(result.keys[1]).toEqual({ name: 'summary', value: 'Store values.', line: 3 });
    expect(result.bodyStartLine).toBe(5);
  });

  it('returns null without a frontmatter block', () => {
    expect(parseFrontmatterBlock(['# Body', '', 'Text.'])).toBeNull();
    expect(parseFrontmatterBlock(['---', 'title: Unterminated'])).toBeNull();
  });
});

describe('validateFrontmatter', () => {
  it('requires title and summary', () => {
    const errors = validateFrontmatter([{ name: 'enableTableOfContents', value: 'true', line: 2 }]);

    expect(errors.map((error) => error.raw).sort()).toEqual(['summary', 'title']);
  });

  it('rejects a field the site does not render', () => {
    const errors = validateFrontmatter([
      { name: 'title', value: 'Variables', line: 2 },
      { name: 'summary', value: 'Store values.', line: 3 },
      { name: 'description', value: 'A competing summary.', line: 4 },
    ]);

    expect(errors).toHaveLength(1);
    expect(errors[0].kind).toBe('docs-references/unknown-frontmatter');
    expect(errors[0].line).toBe(4);
    expect(errors[0].message).toContain('description');
  });

  it('accepts every documented field', () => {
    const keys = ALLOWED_FRONTMATTER_FIELDS.map((name, index) => ({
      name,
      value: 'x',
      line: index + 2,
    }));

    expect(validateFrontmatter(keys)).toEqual([]);
  });
});

describe('extractImageRefs and validateImageRefs', () => {
  it('finds markdown and HTML images, ignoring remote sources and code', () => {
    const { stripCode } = require('../../_lib/markdown');
    const body = stripCode(
      [
        '![A screenshot](/images/docs/screenshot.png)',
        '<img src="/images/docs/inline.png" alt="An inline image" />',
        '![Remote](https://sindlish.org/og.png)',
        '![Broken relative](./local.png)',
        '`![In code](/images/not-an-image.png)`',
        '',
        '```md',
        '![Fenced](/images/not-an-image.png)',
        '```',
      ].join('\n')
    );

    expect(extractImageRefs(body)).toEqual([
      { src: '/images/docs/screenshot.png', line: 1 },
      { src: '/images/docs/inline.png', line: 2 },
      { src: './local.png', line: 4 },
    ]);

    expect(validateImageRefs([{ src: './local.png', line: 4 }])).toHaveLength(1);
    expect(validateImageRefs([{ src: '/images/docs/screenshot.png', line: 1 }])).toEqual([]);
  });
});

describe('extractComponentRefs', () => {
  it('finds uppercase tags and ignores HTML, closing tags and code', () => {
    const { stripCode } = require('../../_lib/markdown');
    const body = stripCode(
      [
        '<Admonition type="warning" title="Careful">',
        'Text.',
        '</Admonition>',
        '',
        '<Steps>',
        '<img src="/images/x.png" alt="An image" />',
        '</Steps>',
        '',
        '`<CodeTabs>` in inline code is invisible.',
      ].join('\n')
    );

    expect(extractComponentRefs(body)).toEqual([
      { name: 'Admonition', line: 1 },
      { name: 'Steps', line: 5 },
    ]);
  });

  it('flags a component outside the surface', () => {
    const errors = validateComponents([{ name: 'CodeTabs', line: 12 }], ['Admonition', 'Steps']);

    expect(errors).toHaveLength(1);
    expect(errors[0].kind).toBe('docs-references/unknown-component');
    expect(errors[0].line).toBe(12);
  });
});

describe('parseComponentSurface', () => {
  it('derives the authored surface from the MDX component map', () => {
    const source = [
      'const getComponents = (linkBasePath = \'/docs\') => ({',
      '  h2: AnchorHeading(\'h2\'),',
      '  table: (props) => (',
      '    <div className="table-wrapper">',
      '      <table {...props} />',
      '    </div>',
      '  ),',
      '  pre: (props) => <CodeBlock {...props} />,',
      '  Admonition,',
      '  Steps,',
      '});',
    ].join('\n');

    expect(parseComponentSurface(source)).toEqual(['Admonition', 'Steps']);
  });

  it('returns an empty surface when the map cannot be found', () => {
    expect(parseComponentSurface('export default Content;')).toEqual([]);
  });
});

describe('the real tree', () => {
  it('references only images, components and frontmatter fields that exist', () => {
    const { errors, invocations } = validate(process.cwd());

    expect(invocations).toBeGreaterThan(0);
    expect(errors.map((error) => `${error.file}:${error.line} ${error.message}`)).toEqual([]);
  });
});
