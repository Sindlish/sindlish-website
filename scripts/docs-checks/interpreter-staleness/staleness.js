'use strict';

/**
 * Interpreter staleness gate -- pure comparison logic.
 *
 * The bundled interpreter (`public/interpreter/`) must stay byte-identical to
 * the canonical interpreter package in the language repository
 * (github.com/Sindlish/Sindlish -> `interpreter/`). Without this gate the
 * example runner and the in-browser Run button execute last month's language.
 *
 * This module only normalises trees, hashes files and produces a diff report.
 * Reading the trees from disk lives in `validate.js`; fetching the canonical
 * tree is a CI/shell concern (`fetch-canonical.sh`). Nothing here touches the
 * network, so the behaviour is unit-testable.
 */

const crypto = require('node:crypto');

/**
 * Tree bookkeeping that is never part of the comparison: Python bytecode
 * caches and VCS metadata exist on one side only by accident.
 */
const IGNORED_DIR_SEGMENTS = new Set(['__pycache__', '.git']);
const IGNORED_EXTENSIONS = ['.pyc'];

/**
 * Files that are legitimately present in the bundle but not in the canonical
 * `interpreter/` package. Keep this list as short as possible: every entry is
 * a hole in the gate.
 */
const BUNDLE_ONLY_ALLOWLIST = ['.gitignore'];

/** Collapse any mix of separators to forward slashes and drop no-op segments. */
function toPosixPath(value) {
  return String(value)
    .split(/[\\/]+/)
    .filter((segment) => segment && segment !== '.')
    .join('/');
}

function isIgnoredPath(relPath) {
  const normalized = toPosixPath(relPath);
  if (!normalized) return true;
  if (normalized.split('/').some((segment) => IGNORED_DIR_SEGMENTS.has(segment))) return true;
  return IGNORED_EXTENSIONS.some((ext) => normalized.toLowerCase().endsWith(ext));
}

function isAllowedBundleOnlyPath(relPath) {
  return BUNDLE_ONLY_ALLOWLIST.includes(toPosixPath(relPath));
}

/**
 * Normalise file content before hashing. CRLF and lone CR collapse to LF so a
 * Windows working tree and a Linux CI checkout of the same revision hash the
 * same, while any real content change still produces a different hash.
 */
function normalizeContent(content) {
  const text = Buffer.isBuffer(content) ? content.toString('utf8') : String(content);
  return text.replace(/\r\n?/g, '\n');
}

function hashContent(content) {
  return crypto.createHash('sha256').update(normalizeContent(content), 'utf8').digest('hex');
}

function sortByPath(entries) {
  return entries.slice().sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

/**
 * Build a normalised, sorted manifest from tree entries.
 *
 * @param {Array<{path: string, content: string|Buffer}>} entries
 * @returns {Array<{path: string, hash: string}>}
 */
function buildManifest(entries) {
  return sortByPath(
    entries
      .filter((entry) => !isIgnoredPath(entry.path))
      .map((entry) => ({ path: toPosixPath(entry.path), hash: hashContent(entry.content) }))
  );
}

/**
 * Compare a bundled manifest against a canonical manifest.
 *
 * @param {Array<{path: string, hash: string}>} bundled
 * @param {Array<{path: string, hash: string}>} canonical
 * @returns {{
 *   ok: boolean,
 *   changed: Array<{path: string, bundledHash: string, canonicalHash: string}>,
 *   missing: Array<{path: string, canonicalHash: string}>,
 *   added: Array<{path: string, bundledHash: string}>,
 *   allowedExtras: Array<{path: string, bundledHash: string}>,
 *   bundledCount: number,
 *   canonicalCount: number,
 * }}
 */
function compareManifests(bundled, canonical) {
  const bundledByPath = new Map(bundled.map((entry) => [entry.path, entry]));
  const canonicalByPath = new Map(canonical.map((entry) => [entry.path, entry]));

  const changed = [];
  const missing = [];
  for (const [filePath, canonicalEntry] of canonicalByPath) {
    const bundledEntry = bundledByPath.get(filePath);
    if (!bundledEntry) {
      missing.push({ path: filePath, canonicalHash: canonicalEntry.hash });
    } else if (bundledEntry.hash !== canonicalEntry.hash) {
      changed.push({
        path: filePath,
        bundledHash: bundledEntry.hash,
        canonicalHash: canonicalEntry.hash,
      });
    }
  }

  const added = [];
  const allowedExtras = [];
  for (const [filePath, bundledEntry] of bundledByPath) {
    if (canonicalByPath.has(filePath)) continue;
    if (isAllowedBundleOnlyPath(filePath)) {
      allowedExtras.push({ path: filePath, bundledHash: bundledEntry.hash });
    } else {
      added.push({ path: filePath, bundledHash: bundledEntry.hash });
    }
  }

  return {
    ok: changed.length === 0 && missing.length === 0 && added.length === 0,
    changed: sortByPath(changed),
    missing: sortByPath(missing),
    added: sortByPath(added),
    allowedExtras: sortByPath(allowedExtras),
    bundledCount: bundledByPath.size,
    canonicalCount: canonicalByPath.size,
  };
}

const MAX_LISTED_PER_SECTION = 40;

function shortHash(hash) {
  return String(hash).slice(0, 12);
}

/**
 * Render a human-readable report for a comparison result.
 *
 * @param {ReturnType<typeof compareManifests>} result
 * @param {{bundledLabel?: string, canonicalLabel?: string}} [options]
 * @returns {string}
 */
function formatReport(result, options = {}) {
  const bundledLabel = options.bundledLabel || 'bundled interpreter';
  const canonicalLabel = options.canonicalLabel || 'canonical interpreter';
  const lines = [];

  lines.push('Interpreter staleness gate');
  lines.push(`  ${bundledLabel}: ${result.bundledCount} file(s)`);
  lines.push(`  ${canonicalLabel}: ${result.canonicalCount} file(s)`);
  lines.push('');

  if (result.ok) {
    lines.push(`  OK  every compared file matches (${result.canonicalCount} canonical file(s)).`);
    if (result.allowedExtras.length > 0) {
      lines.push(
        `  Allowlisted bundle-only: ${result.allowedExtras.map((entry) => entry.path).join(', ')}`
      );
    }
    return lines.join('\n');
  }

  const section = (title, items, describe) => {
    if (items.length === 0) return;
    lines.push(`  DRIFT - ${title} (${items.length})`);
    for (const item of items.slice(0, MAX_LISTED_PER_SECTION)) {
      lines.push(`    - ${describe(item)}`);
    }
    if (items.length > MAX_LISTED_PER_SECTION) {
      lines.push(`    ... and ${items.length - MAX_LISTED_PER_SECTION} more`);
    }
    lines.push('');
  };

  section(
    'changed',
    result.changed,
    (item) =>
      `${item.path} (bundled ${shortHash(item.bundledHash)} != canonical ${shortHash(item.canonicalHash)})`
  );
  section(
    'missing from bundle',
    result.missing,
    (item) => `${item.path} (canonical ${shortHash(item.canonicalHash)})`
  );
  section(
    'only in bundle',
    result.added,
    (item) => `${item.path} (bundled ${shortHash(item.bundledHash)})`
  );

  lines.push(
    '  The bundled interpreter is stale. Re-sync public/interpreter/ from the canonical interpreter/ package.'
  );
  return lines.join('\n');
}

module.exports = {
  BUNDLE_ONLY_ALLOWLIST,
  buildManifest,
  compareManifests,
  formatReport,
  hashContent,
  isAllowedBundleOnlyPath,
  isIgnoredPath,
  normalizeContent,
  toPosixPath,
};
