/**
 * Pure link logic for Gate 2, internal links (issue #52).
 *
 * No filesystem, no network: markdown is handed in as text and the inventory
 * (docs pages, app routes, public files, redirect sources) as plain data, so
 * every rule here is unit-testable in isolation from the real tree.
 */

const { stripCode } = require('../_lib/markdown');

const PROTOCOL = /^[a-z][a-z0-9+.-]*:/i;
const MARKDOWN_LINK = /(!?)\[[^\]]*\]\(\s*(<[^>]*>|[^)\s]+)(?:\s+["'][^"']*["'])?\s*\)/g;
const REFERENCE_DEFINITION = /^\s{0,3}\[[^\]]+\]:\s*(\S+)/;
const HTML_HREF = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

/**
 * Classify a raw href.
 *
 * @param {string} href Raw href as authored.
 * @returns {'external'|'fragment'|'internal'|'relative'|'empty'} The class.
 */
function classifyHref(href) {
  if (!href) return 'empty';
  if (href.startsWith('#')) return 'fragment';
  if (href.startsWith('//') || PROTOCOL.test(href)) return 'external';
  if (href.startsWith('/')) return 'internal';
  return 'relative';
}

/**
 * Reduce an internal href to the path it requests: drop the query string and
 * fragment, decode percent-escapes, collapse a trailing slash.
 *
 * @param {string} href An internal href (`/`-prefixed).
 * @returns {string} The normalised path.
 */
function normalizeInternalPath(href) {
  let pathname = href.split('#')[0].split('?')[0];

  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    // Malformed escape: keep the raw form; it will simply not resolve.
  }

  pathname = pathname.replace(/\/{2,}/g, '/');
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  return pathname;
}

/**
 * Does the path resolve inside the app router tree?
 *
 * Static routes match exactly; dynamic routes (`[...slug]` and friends) match
 * their prefix, mirroring how Next.js matches them.
 *
 * @param {string} pathname Normalised path.
 * @param {{path: string, dynamic: boolean}[]} appRoutes Route patterns.
 * @returns {boolean} Whether it resolves.
 */
function matchesAppRoute(pathname, appRoutes) {
  return appRoutes.some((route) => {
    if (!route.dynamic) return route.path === pathname;
    return pathname === route.path || pathname.startsWith(`${route.path}/`);
  });
}

/**
 * Resolve an internal path against the inventory.
 *
 * `/docs/...` never falls through to the `[...slug]` catch-all: the corpus is
 * the authority for docs URLs, so a typo in a docs slug fails even though the
 * router would happily render a 404 page for it.
 *
 * @param {string} href An internal href.
 * @param {{docsPages: Set<string>, appRoutes: {path: string, dynamic: boolean}[], publicFiles: Set<string>, redirectSources: Set<string>}} inventory Inventory.
 * @returns {{ok: boolean, pathname: string, reason: string}} Resolution result.
 */
function resolveInternalHref(href, inventory) {
  const pathname = normalizeInternalPath(href);

  if (pathname === '/docs') return { ok: true, pathname, reason: '' };

  if (pathname.startsWith('/docs/')) {
    const slug = pathname.slice('/docs/'.length);

    if (inventory.docsPages.has(slug)) return { ok: true, pathname, reason: '' };
    if (inventory.publicFiles.has(pathname)) return { ok: true, pathname, reason: '' };
    if (inventory.appRoutes.some((route) => !route.dynamic && route.path === pathname)) {
      return { ok: true, pathname, reason: '' };
    }

    return {
      ok: false,
      pathname,
      reason: 'no docs page, static route, or public file serves this docs URL',
    };
  }

  if (matchesAppRoute(pathname, inventory.appRoutes)) return { ok: true, pathname, reason: '' };
  if (inventory.publicFiles.has(pathname)) return { ok: true, pathname, reason: '' };
  if (inventory.redirectSources.has(pathname)) return { ok: true, pathname, reason: '' };

  return {
    ok: false,
    pathname,
    reason: 'no app route, legacy redirect, or public file serves this URL',
  };
}

/**
 * Extract every link worth validating from markdown.
 *
 * Ignored on purpose: images (Gate 3 owns assets), bare URLs, fragments
 * (`#anchor`, validated nowhere — no authored docs link uses one yet), and
 * anything inside a code fence or inline code span.
 *
 * @param {string} text Markdown file contents.
 * @returns {{href: string, line: number}[]} Links with their 1-based lines.
 */
function extractLinks(text) {
  const lines = stripCode(text);
  const links = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    let match;
    MARKDOWN_LINK.lastIndex = 0;
    while ((match = MARKDOWN_LINK.exec(line)) !== null) {
      if (match[1] === '!') continue; // image, not a link
      links.push({ href: match[2].replace(/^<|>$/g, ''), line: lineNumber });
    }

    const definition = line.match(REFERENCE_DEFINITION);
    if (definition) {
      links.push({ href: definition[1], line: lineNumber });
    }

    HTML_HREF.lastIndex = 0;
    while ((match = HTML_HREF.exec(line)) !== null) {
      links.push({ href: match[1] ?? match[2], line: lineNumber });
    }
  });

  return links;
}

/**
 * Validate every link in one markdown file against the inventory.
 *
 * @param {string} text Markdown file contents.
 * @param {object} inventory Inventory, see {@link resolveInternalHref}.
 * @returns {{line: number, raw: string, message: string}[]} Errors.
 */
function checkLinks(text, inventory) {
  const errors = [];

  for (const { href, line } of extractLinks(text)) {
    if (classifyHref(href) !== 'internal') continue;

    const { ok, pathname, reason } = resolveInternalHref(href, inventory);

    if (!ok) {
      errors.push({
        line,
        raw: href,
        message: `internal link "${href}" resolves nowhere (${pathname} ${reason})`,
      });
    }
  }

  return errors;
}

module.exports = {
  checkLinks,
  classifyHref,
  extractLinks,
  matchesAppRoute,
  normalizeInternalPath,
  resolveInternalHref,
};
