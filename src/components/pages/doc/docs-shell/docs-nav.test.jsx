import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { getNavigation } from 'utils/api-docs';

import DocsNav from './docs-nav';

const navigation = getNavigation();

const render = (props) => renderToStaticMarkup(<DocsNav navigation={navigation} {...props} />);

describe('DocsNav', () => {
  it('never emits a heading element (the shell adds no headings)', () => {
    const html = render({ currentPath: '/docs/basics/variables' });

    expect(html).not.toMatch(/<h[1-6]/);
  });

  it('marks the current page with aria-current', () => {
    const html = render({ currentPath: '/docs/basics/variables' });

    expect(html).toContain('aria-current="page"');
    expect(html).toContain('/docs/basics/variables');
  });

  it('shows the current pillar expanded and others collapsed', () => {
    const html = render({ currentPath: '/docs/basics/variables' });

    // The current pillar (Learn) renders <details open="">, the rest do not.
    const openCount = (html.match(/<details[^>]*\bopen=""/g) || []).length;
    expect(openCount).toBe(1);
  });

  it('exposes a search field in the sidebar', () => {
    const html = render({ currentPath: '/docs/introduction' });

    expect(html).toContain('role="search"');
    expect(html).toContain('name="q"');
  });

  it('renders a page count next to every pillar', () => {
    const html = render({ currentPath: '/docs/introduction' });

    // Reference has 7 leaves in navigation.yaml
    expect(html).toContain('>7<');
  });
});
