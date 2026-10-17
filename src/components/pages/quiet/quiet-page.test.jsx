import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { NOT_FOUND, RUNTIME_ERROR } from 'constants/quiet-pages';

import QuietPage from './quiet-page';

const renderQuietPage = (config) => renderToStaticMarkup(<QuietPage {...config} />);

describe('quiet pages', () => {
  it('renders the not-found copy with its locked line', () => {
    const html = renderQuietPage(NOT_FOUND);

    expect(html).toContain('Page not found');
    expect(html).toContain('He jaga na milyo.');
    expect(html).toContain('Go to the documentation');
  });

  it('renders the runtime-error copy with its locked line', () => {
    const html = renderQuietPage(RUNTIME_ERROR);

    expect(html).toContain('Something went wrong');
    expect(html).toContain('HalndeVaktGhalti thi.');
    expect(html).toContain('Report the problem');
  });

  it('keeps the decorative mascot out of assistive technology', () => {
    const html = renderQuietPage(NOT_FOUND);

    // The art has landed, so the placement now renders a real image and hides it
    // the way decorative art should be hidden: an empty alt. Before the art
    // existed the labelled placeholder frame used aria-hidden instead. Whichever
    // branch renders, the mascot must never come away with an accessible name.
    expect(html).toMatch(/<img[^>]*\salt=""|aria-hidden="true"/);
  });
});
