/**
 * The route/asset inventory the link-shaped gates resolve against (issue #52).
 *
 * Shared by `internal-links/` (Gate 2) and `a11y-checklist/` (the checklist's
 * Route rows must name real routes). Four sources of truth are merged:
 *
 * 1. the docs corpus (`content/docs/**`), with the same ignore rules the site
 *    itself uses (`api-content.js` `getPostSlugs`) — the docs catch-all route
 *    swallows every `/docs/...` URL, so the corpus, not the router, is what a
 *    docs link must resolve against;
 * 2. the Next.js app router tree (`src/app/**`) — static routes exactly, and
 *    dynamic routes as prefix patterns;
 * 3. the static files served from `public/`;
 * 4. the legacy redirects (`src/lib/legacy-redirects.js`).
 */

const fs = require('fs');
const path = require('path');

const { LEGACY_REDIRECTS } = require('../../../src/lib/legacy-redirects');

/** Mirrors api-content.js: files that are content but never pages. */
const PAGE_IGNORE = ['README.md', 'GUIDE_TEMPLATE.md'];
const PAGE_IGNORE_DIRS = ['unused', 'shared-content'];

const PAGE_EXTENSIONS = ['.md', '.mdx'];
const ROUTE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

/**
 * Recursively collect files under `dir` as POSIX-style relative paths.
 *
 * @param {string} dir Directory to walk.
 * @param {string} [base=dir] Directory paths are made relative to.
 * @returns {string[]} Paths relative to `base`, forward-slashed.
 */
function walkFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];

  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      found.push(...walkFiles(fullPath, base));
    } else {
      found.push(path.relative(base, fullPath).split(path.sep).join('/'));
    }
  }

  return found;
}

/**
 * Every docs page slug, e.g. `basics/variables` for `content/docs/basics/variables.md`.
 *
 * @param {string} projectRoot Repository root.
 * @returns {string[]} Slugs, forward-slashed, without extension.
 */
function collectDocsPages(projectRoot) {
  const docsDir = path.join(projectRoot, 'content', 'docs');

  return walkFiles(docsDir)
    .filter((relPath) => PAGE_EXTENSIONS.includes(path.posix.extname(relPath)))
    .filter((relPath) => !PAGE_IGNORE.includes(path.posix.basename(relPath)))
    .filter(
      (relPath) => !PAGE_IGNORE_DIRS.some((dirName) => relPath.startsWith(`${dirName}/`))
    )
    .map((relPath) => relPath.replace(/\.mdx?$/, ''));
}

/**
 * App router routes from `src/app`. Route groups (`(docs)`) contribute nothing
 * to the URL; dynamic segments (`[slug]`, `[...slug]`, `[[...slug]]`) collapse
 * to a prefix match instead of an exact path.
 *
 * @param {string} projectRoot Repository root.
 * @returns {{path: string, dynamic: boolean}[]} Route patterns.
 */
function collectAppRoutes(projectRoot) {
  const appDir = path.join(projectRoot, 'src', 'app');
  const routes = [];

  const isRouteFile = (name) =>
    ['page', 'route', 'default'].includes(path.posix.basename(name, path.extname(name))) &&
    ROUTE_EXTENSIONS.includes(path.extname(name));

  /**
   * @param {string} dir Directory being walked.
   * @param {string} routePath URL path built so far.
   * @param {boolean} dynamic Whether an enclosing segment is dynamic.
   * @returns {void}
   */
  const walk = (dir, routePath, dynamic) => {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    if (entries.some((entry) => entry.isFile() && isRouteFile(entry.name))) {
      routes.push({ path: routePath || '/', dynamic });
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const { name } = entry;

      // Route groups are organisational only; they never appear in the URL.
      if (/^\(.*\)$/.test(name)) {
        walk(path.join(dir, name), routePath, dynamic);
        continue;
      }

      // Dynamic segments match any value at or below their position, so the
      // URL prefix stops here and everything under it folds into one pattern.
      if (/^\[.*\]$/.test(name)) {
        walk(path.join(dir, name), routePath, true);
        continue;
      }

      walk(path.join(dir, name), `${routePath}/${name}`.replace('//', '/'), dynamic);
    }
  };

  walk(appDir, '', false);

  // De-duplicate (a static and a dynamic pattern can share a path).
  return routes.filter(
    (route, index) =>
      routes.findIndex((other) => other.path === route.path && other.dynamic === route.dynamic) ===
      index
  );
}

/**
 * Static files served from `public/`, each as a `/`-rooted path.
 *
 * @param {string} projectRoot Repository root.
 * @returns {Set<string>} Paths like `/favicon.ico`.
 */
function collectPublicFiles(projectRoot) {
  const publicDir = path.join(projectRoot, 'public');

  return new Set(walkFiles(publicDir).map((relPath) => `/${relPath}`));
}

/**
 * Build the full inventory.
 *
 * @param {string} [projectRoot=process.cwd()] Repository root.
 * @returns {{docsPages: Set<string>, appRoutes: {path: string, dynamic: boolean}[], publicFiles: Set<string>, redirectSources: Set<string>, docsPageList: string[]}} Inventory.
 */
function buildInventory(projectRoot = process.cwd()) {
  const docsPageList = collectDocsPages(projectRoot);

  return {
    docsPages: new Set(docsPageList),
    docsPageList,
    appRoutes: collectAppRoutes(projectRoot),
    publicFiles: collectPublicFiles(projectRoot),
    redirectSources: new Set(LEGACY_REDIRECTS.map((redirect) => redirect.source)),
  };
}

module.exports = { buildInventory, collectAppRoutes, collectDocsPages, collectPublicFiles };
