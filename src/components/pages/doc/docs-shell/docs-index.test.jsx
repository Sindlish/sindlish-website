import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { getNavigation } from 'utils/api-docs';

import DocsIndex from './docs-index';

const navigation = getNavigation();
const html = renderToStaticMarkup(<DocsIndex navigation={navigation} />);

describe('DocsIndex', () => {
  it('has exactly one h1 titled Documentation', () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('Documentation');
  });

  it('groups every page under its pillar heading', () => {
    for (const pillar of navigation) {
      expect(html).toContain(`>${pillar.nav}<`);
    }

    expect(html).toContain('Welcome to Sindlish');
    expect(html).toContain('Getting Started');
    expect(html).toContain('Collection methods');
    expect(html).toContain('Cookbook');
  });

  it('derives the per-pillar page count from navigation', () => {
    // Learn: 18, How-to: 3, Reference: 7, Concepts: 3
    expect(html).toContain('18 pages');
    expect(html).toContain('3 pages');
    expect(html).toContain('7 pages');
  });

  it('links every page to its slug', () => {
    expect(html).toContain('/docs/basics/variables');
    expect(html).toContain('/docs/reference/standard-library');
  });
});
