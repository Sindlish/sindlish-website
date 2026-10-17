const DOCS_PREFIX = '/docs';

const stripTrailingSlash = (value) => (value.endsWith('/') ? value.slice(0, -1) : value);

/**
 * Rewrite an authored docs link onto the pane's own base path (issue #54).
 *
 * Docs content links are written relative to `/docs`. Inside the workbench pane
 * they must resolve within the pane (`/workbench/docs/...`) so the browser back
 * button and deep links keep speaking the pane's routes. Anything that is not a
 * docs link is returned untouched.
 */
export function rewriteDocsHref(href, basePath = DOCS_PREFIX) {
  if (!href || typeof href !== 'string') return href;

  const base = stripTrailingSlash(basePath);

  const rewriteRelative = (link) => `${base}${link.slice(DOCS_PREFIX.length)}`;

  if (href === DOCS_PREFIX || href === `${DOCS_PREFIX}/`) return base;
  if (href.startsWith(`${DOCS_PREFIX}/`) || href.startsWith(`${DOCS_PREFIX}#`)) {
    return rewriteRelative(href);
  }

  // Absolute links authored against the site URL are rewritten too.
  const siteUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_DEFAULT_SITE_URL || '');
  if (siteUrl) {
    const absoluteDocs = `${siteUrl}${DOCS_PREFIX}`;
    if (href === absoluteDocs || href === `${absoluteDocs}/`) return base;
    if (href.startsWith(`${absoluteDocs}/`) || href.startsWith(`${absoluteDocs}#`)) {
      return rewriteRelative(href.slice(siteUrl.length));
    }
  }

  return href;
}

export default rewriteDocsHref;
