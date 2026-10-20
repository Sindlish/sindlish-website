import LINKS from './links';
import MASCOT_LINES from './mascot-lines';

export const NOT_FOUND = {
  title: 'Page not found',
  message: 'The page you are looking for does not exist.',
  hint: 'It may have moved as the docs were reorganised.',
  mascot: { variant: 'curious-question', size: 180, line: MASCOT_LINES.notFound, alt: '' },
  links: [
    { text: 'Go to the documentation', href: LINKS.docsHome },
    { text: 'Go to the homepage', href: '/' },
  ],
};

export const RUNTIME_ERROR = {
  title: 'Something went wrong',
  message: 'The page could not be loaded.',
  hint: 'Try again, or report the problem on GitHub if it keeps happening.',
  mascot: { variant: 'thinking-error', size: 180, line: MASCOT_LINES.error, alt: '' },
  links: [
    { text: 'Report the problem', href: `${LINKS.github}/issues/new` },
    { text: 'Go to the homepage', href: '/' },
  ],
};

// The empty states belong to T5 (#51, docs index no match) and T7 (#35, search)
// but share the same locked line and placement. They are provided here as a
// small seam; the consuming surfaces may extend the copy with the query string.
export const SEARCH_EMPTY = {
  title: 'Search',
  message: 'No pages match your search.',
  hint: 'Try a shorter word, or start from the documentation index.',
  mascot: { variant: 'curious-question', size: 160, line: MASCOT_LINES.empty, alt: '' },
  links: [
    { text: 'Documentation index', href: LINKS.docsHome },
    { text: 'Go to the homepage', href: '/' },
  ],
};

export const DOCS_EMPTY = {
  title: 'Docs',
  message: 'Nothing in the docs matches your search.',
  hint: 'The index lists the pages grouped by pillar. Try the documentation index to get oriented.',
  mascot: { variant: 'curious-question', size: 160, line: MASCOT_LINES.empty, alt: '' },
  links: [
    { text: 'Documentation index', href: LINKS.docsHome },
    { text: 'Go to the homepage', href: '/' },
  ],
};
