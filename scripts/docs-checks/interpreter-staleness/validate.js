'use strict';

/**
 * Interpreter staleness gate -- filesystem wrapper.
 *
 * Reads the bundled tree and the canonical tree from disk and maps a drift
 * report onto the docs-check error shape (`{ kind, file, line, raw, message }`)
 * so the same check can be asserted in Vitest and printed by `check.js`.
 *
 * No network access happens here: the caller is responsible for making the
 * canonical tree available (see `check.js` and `fetch-canonical.sh`).
 */

const fs = require('node:fs');
const path = require('node:path');

const { buildManifest, compareManifests } = require('./staleness.js');

const DEFAULT_BUNDLED_PREFIX = 'public/interpreter';

function makeError(kind, file, message) {
  return { kind, file, line: null, raw: null, message };
}

/** Walk a directory into `{ path, content }` entries (paths relative to root). */
function readTreeEntries(rootDir) {
  const entries = [];
  const visit = (dir, prefix) => {
    for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
      const relPath = prefix ? `${prefix}/${dirent.name}` : dirent.name;
      const absPath = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        visit(absPath, relPath);
      } else if (dirent.isFile()) {
        entries.push({ path: relPath, content: fs.readFileSync(absPath) });
      }
    }
  };
  visit(rootDir, '');
  return entries;
}

function withPrefix(prefix, relPath) {
  return `${String(prefix).replace(/[\\/]+$/, '')}/${relPath}`;
}

/**
 * Compare the bundled interpreter tree with a canonical interpreter tree.
 *
 * @param {{
 *   bundledDir: string,
 *   canonicalDir: string,
 *   bundledPrefix?: string,
 * }} options
 * @returns {{
 *   invocations: number,
 *   errors: Array<{kind: string, file: string, line: null, raw: null, message: string}>,
 *   result?: ReturnType<typeof compareManifests>,
 * }}
 */
function validate({ bundledDir, canonicalDir, bundledPrefix = DEFAULT_BUNDLED_PREFIX }) {
  if (!bundledDir || !fs.existsSync(bundledDir)) {
    return {
      invocations: 0,
      errors: [
        makeError(
          'bundled-unavailable',
          String(bundledDir || ''),
          `bundled interpreter directory not found: ${bundledDir}`
        ),
      ],
    };
  }

  if (!canonicalDir || !fs.existsSync(canonicalDir)) {
    return {
      invocations: 0,
      errors: [
        makeError(
          'canonical-unavailable',
          String(canonicalDir || ''),
          `canonical interpreter directory not found: ${canonicalDir}. ` +
            "Set SINDLISH_CANONICAL_DIR to a Sindlish checkout's interpreter/ directory " +
            '(CI fetches it via fetch-canonical.sh). The gate fails rather than passing silently.'
        ),
      ],
    };
  }

  const bundledManifest = buildManifest(readTreeEntries(bundledDir));
  const canonicalManifest = buildManifest(readTreeEntries(canonicalDir));

  if (canonicalManifest.length === 0) {
    return {
      invocations: 1,
      errors: [
        makeError(
          'canonical-empty',
          canonicalDir,
          `canonical interpreter tree is empty: ${canonicalDir}. ` +
            'Refusing to pass with nothing to compare against.'
        ),
      ],
    };
  }

  const result = compareManifests(bundledManifest, canonicalManifest);
  const errors = [];

  for (const item of result.changed) {
    errors.push(
      makeError(
        'interpreter-drift',
        withPrefix(bundledPrefix, item.path),
        `content differs from the canonical interpreter (bundled ${item.bundledHash.slice(0, 12)}, ` +
          `canonical ${item.canonicalHash.slice(0, 12)})`
      )
    );
  }

  for (const item of result.missing) {
    errors.push(
      makeError(
        'interpreter-missing',
        withPrefix(bundledPrefix, item.path),
        `missing from the bundle; the canonical interpreter has this file (${item.canonicalHash.slice(0, 12)})`
      )
    );
  }

  for (const item of result.added) {
    errors.push(
      makeError(
        'interpreter-extra',
        withPrefix(bundledPrefix, item.path),
        `present in the bundle but not in the canonical interpreter (${item.bundledHash.slice(0, 12)})`
      )
    );
  }

  return { invocations: 1, errors, result };
}

module.exports = { readTreeEntries, validate };
