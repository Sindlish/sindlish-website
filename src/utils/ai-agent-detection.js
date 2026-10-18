// Markdown twin resolution and content negotiation.
//
// Negotiation is pure `Accept: text/markdown`. There is no user-agent sniffing,
// no agents.txt and no MCP: a client either asked for markdown or it did not.
// The legacy `/llms/*.txt` redirects are gone; the llms.txt pair and its aliases
// are kept as static files.

import { CONTENT_ROUTES, EXCLUDED_ROUTES, EXCLUDED_FILES } from 'constants/content';

// True only when the request explicitly negotiated markdown. `*/*` and
// `text/html` do not count.
export function prefersMarkdown(request) {
  const accept = (request.headers.get('accept') || '').toLowerCase();
  return accept.includes('text/markdown');
}

// Paths where the generic CONTENT_ROUTES resolver produces the wrong markdown
// path (or no path at all). Maps directly to the correct static file in public/.
const CUSTOM_MARKDOWN_PATHS = {
  'docs/changelog': '/md/docs/changelog.md',
};

// Paths under content routes that are static files in public/ (not generated into public/md/).
// The middleware should pass these through so Next.js serves them directly.
const STATIC_DOC_PREFIXES = ['docs/ai/'];

// Paths under a content route that resolve to a Next.js Route Handler rather
// than a page (so they have no markdown twin and must never be negotiated).
// Currently just the generated OG image: src/app/(docs)/docs/og/route.jsx.
const NON_PAGE_DOC_PATHS = new Set(['docs/og']);

// Convert URL path to markdown file path
// Example: /docs/introduction -> /md/docs/introduction.md (maps to public/md/)
export function getMarkdownPath(pathname) {
  const path = pathname.slice(1).replace(/\/$/, ''); // Remove leading and trailing slashes

  // Early return for excluded routes and files
  const isExcluded =
    EXCLUDED_ROUTES.some((route) => path === route) ||
    EXCLUDED_FILES.some((file) => pathname.endsWith(file));

  if (isExcluded) return null;

  if (STATIC_DOC_PREFIXES.some((prefix) => path.startsWith(prefix))) return null;

  if (NON_PAGE_DOC_PATHS.has(path)) return null;

  // Normalize .md suffix so /branching.md matches the branching route
  const normalized = path.endsWith('.md') ? path.slice(0, -3) : path;

  if (CUSTOM_MARKDOWN_PATHS[path] || CUSTOM_MARKDOWN_PATHS[normalized])
    return CUSTOM_MARKDOWN_PATHS[path] || CUSTOM_MARKDOWN_PATHS[normalized];

  const matchedRoute = Object.keys(CONTENT_ROUTES).find(
    (route) => normalized === route || path.startsWith(`${route}/`)
  );

  if (!matchedRoute) return null;

  // Get the content directory path from CONTENT_ROUTES and convert to public path
  // Example: content/docs -> /md/docs
  const contentPath = CONTENT_ROUTES[matchedRoute];
  const publicPath = contentPath.replace('content/', '/md/');

  // Extract slug after the matched route
  const slug = normalized === matchedRoute ? '' : path.replace(`${matchedRoute}/`, '');
  const mdSlug = slug.endsWith('.md') ? slug : `${slug}.md`;

  // Build the full public path: /md/{directory}/{slug}.md
  return slug ? `${publicPath}/${mdSlug}` : `${publicPath}.md`;
}

export function buildAgent404Response(pathname) {
  return `# Page Not Found

\`${pathname}\` does not exist in Sindlish documentation.

Find what you need:

- [All Sindlish documentation](/docs/llms.txt): Table of contents for all Sindlish docs
- [Full documentation text](/docs/llms-full.txt): Complete Sindlish docs in one file
`;
}
