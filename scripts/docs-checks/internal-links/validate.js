/**
 * Gate 2, internal links (issue #52): every `/`-rooted link in the docs
 * corpus and in the canonical route table resolves to a real page, route,
 * redirect or static file — without a browser and without the network.
 *
 * This is the deterministic half of "internal links resolve". The linkinator
 * crawl (`npm run check:broken-links`, run against the built site in CI) stays
 * as the rendered-layer half; it checks the HTML the build emits, this gate
 * checks the authored sources, and neither needs the other to fail loudly.
 */

const fs = require('fs');
const path = require('path');

const { buildInventory } = require('../_lib/inventory');
const { splitLines } = require('../_lib/markdown');

const { checkLinks, classifyHref, resolveInternalHref } = require('./links');

const MARKDOWN_EXTENSIONS = ['.md', '.mdx'];

/** Route literals the header/footer/sidebar menus link to. */
const ROUTE_TABLE = 'src/constants/links.js';

/**
 * Recursively collect markdown files under `dir`, as repo-relative paths.
 *
 * @param {string} dir Directory to walk (absolute).
 * @param {string} projectRoot Repository root (absolute).
 * @returns {string[]} Repo-relative file paths, forward-slashed.
 */
function collectMarkdownFiles(dir, projectRoot) {
  const found = [];

  if (!fs.existsSync(dir)) return found;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      found.push(...collectMarkdownFiles(fullPath, projectRoot));
    } else if (MARKDOWN_EXTENSIONS.includes(path.extname(entry.name))) {
      found.push(path.relative(projectRoot, fullPath).split(path.sep).join('/'));
    }
  }

  return found;
}

/**
 * Extract `'/some/path'` literals from the route table. External URLs,
 * fragments and template literals are ignored by the pattern.
 *
 * @param {string} source File contents of src/constants/links.js.
 * @returns {{href: string, line: number}[]} Route literals with their lines.
 */
function extractRouteLiterals(source) {
  const literals = [];

  splitLines(source).forEach((line, index) => {
    const matches = line.match(/['"](\/[a-zA-Z0-9/._-]*)['"]/g) || [];

    for (const match of matches) {
      literals.push({ href: match.slice(1, -1), line: index + 1 });
    }
  });

  return literals;
}

/**
 * Run the gate over the real tree.
 *
 * @param {string} [projectRoot=process.cwd()] Repository root.
 * @returns {{invocations: number, errors: {kind: string, file: string, line: number, raw: string, message: string}[]}} Report.
 */
function validate(projectRoot = process.cwd()) {
  const inventory = buildInventory(projectRoot);
  const errors = [];
  let invocations = 0;

  for (const file of collectMarkdownFiles(path.join(projectRoot, 'content'), projectRoot)) {
    const contents = fs.readFileSync(path.join(projectRoot, file), 'utf8');
    const fileErrors = checkLinks(contents, inventory);

    invocations += 1;
    for (const error of fileErrors) {
      errors.push({ kind: 'internal-links', file, ...error });
    }
  }

  const routeTablePath = path.join(projectRoot, ROUTE_TABLE);
  if (fs.existsSync(routeTablePath)) {
    const routeTable = fs.readFileSync(routeTablePath, 'utf8');
    const literals = extractRouteLiterals(routeTable);

    invocations += 1;
    for (const { href, line } of literals) {
      if (classifyHref(href) !== 'internal') continue;

      const { ok, pathname, reason } = resolveInternalHref(href, inventory);

      if (!ok) {
        errors.push({
          kind: 'internal-links',
          file: ROUTE_TABLE,
          line,
          raw: href,
          message: `route literal "${href}" resolves nowhere (${pathname} ${reason})`,
        });
      }
    }
  }

  return { invocations, errors };
}

module.exports = { extractRouteLiterals, validate };
