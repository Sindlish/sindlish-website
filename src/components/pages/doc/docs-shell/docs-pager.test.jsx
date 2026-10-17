import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import DocsPager from './docs-pager';

const render = (props) => renderToStaticMarkup(<DocsPager {...props} />);

describe('DocsPager', () => {
  it('shows both previous and next when they exist', () => {
    const html = render({
      previousLink: { title: 'Math', slug: 'basics/math' },
      nextLink: { title: 'Strings', slug: 'basics/strings' },
    });

    expect(html).toContain('>Previous<');
    expect(html).toContain('Math');
    expect(html).toContain('>Next<');
    expect(html).toContain('Strings');
    expect(html).toContain('/docs/basics/math');
    expect(html).toContain('/docs/basics/strings');
  });

  it('shows only next on the first page', () => {
    const html = render({ nextLink: { title: 'Installation', slug: 'get-started/installation' } });

    expect(html).toContain('>Next<');
    expect(html).toContain('Installation');
    expect(html).not.toContain('>Previous<');
  });

  it('shows only previous on the last page', () => {
    const html = render({ previousLink: { title: 'Scope', slug: 'advanced/scope' } });

    expect(html).toContain('>Previous<');
    expect(html).toContain('Scope');
    expect(html).not.toContain('>Next<');
  });

  it('renders nothing when there is no neighbour', () => {
    expect(render({})).toBe('');
  });
});
