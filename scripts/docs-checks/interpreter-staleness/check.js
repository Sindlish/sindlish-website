#!/usr/bin/env node
'use strict';

/**
 * Interpreter staleness gate -- CLI entry point.
 *
 * Fails (non-zero) when the bundled interpreter at `public/interpreter/`
 * differs from the canonical interpreter package in the language repository.
 * The canonical tree must be supplied by the caller:
 *
 *   * CI fetches it with `fetch-canonical.sh` and exports
 *     `SINDLISH_CANONICAL_DIR`;
 *   * locally, point `SINDLISH_CANONICAL_DIR` at a Sindlish checkout's
 *     `interpreter/` directory.
 *
 * When the canonical tree is missing this exits non-zero with instructions --
 * the gate never passes silently on an unrun comparison.
 */

const fs = require('node:fs');
const path = require('node:path');

const { formatReport } = require('./staleness.js');
const { validate } = require('./validate.js');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const BUNDLED_DIR = path.join(REPO_ROOT, 'public', 'interpreter');
const CANONICAL_REPO = 'https://github.com/Sindlish/Sindlish (interpreter/ package)';

function main() {
  const canonicalDir = process.env.SINDLISH_CANONICAL_DIR;

  if (!canonicalDir) {
    console.error(
      [
        'Interpreter staleness gate: no canonical source configured.',
        '',
        'Set SINDLISH_CANONICAL_DIR to a checkout of the canonical interpreter package.',
        `  canonical repository: ${CANONICAL_REPO}`,
        '',
        '  SINDLISH_CANONICAL_DIR=/path/to/Sindlish/interpreter npm run check:interpreter',
        '',
        'CI fetches the canonical tree with scripts/docs-checks/interpreter-staleness/fetch-canonical.sh.',
        'This check fails rather than passing silently when the canonical tree is unavailable.',
      ].join('\n')
    );
    return 2;
  }

  const resolvedCanonical = path.resolve(canonicalDir);
  if (!fs.existsSync(path.join(resolvedCanonical, '__init__.py'))) {
    console.error(
      `Interpreter staleness gate: SINDLISH_CANONICAL_DIR does not look like the interpreter package ` +
        `(no __init__.py): ${resolvedCanonical}`
    );
    return 2;
  }

  const { errors, result } = validate({ bundledDir: BUNDLED_DIR, canonicalDir: resolvedCanonical });

  if (result) {
    console.log(
      formatReport(result, {
        bundledLabel: `bundled (${BUNDLED_DIR})`,
        canonicalLabel: `canonical (${resolvedCanonical})`,
      })
    );
  } else {
    console.error('Interpreter staleness gate could not run:');
    for (const error of errors) {
      console.error(`  ${error.file}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    if (result) {
      console.error(
        `\n${errors.length} difference(s) between the bundled and canonical interpreter.`
      );
    }
    return 1;
  }

  return 0;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = { main, BUNDLED_DIR };
