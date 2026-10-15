#!/usr/bin/env node
'use strict';

/**
 * Sindlish grammar drift gate -- CLI entry point.
 *
 * Fails (non-zero) when the committed TextMate grammar at
 * `src/lib/grammars/sindlish.tmLanguage.json` differs from what the
 * interpreter's own generator produces from the bundled interpreter at
 * `public/interpreter/`.
 *
 * Usage:
 *   node scripts/docs-checks/grammar-drift/check.js           # fail on drift
 *   node scripts/docs-checks/grammar-drift/check.js --write   # regenerate it
 *
 * The generator needs Python 3. When Python is missing this exits 2 with
 * instructions -- it never passes silently on an unrun comparison.
 *
 * Set SINDLISH_PYTHON to choose a specific interpreter.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { formatReport } = require('./grammar-drift.js');
const {
  DEFAULT_ARTIFACT,
  DEFAULT_BUNDLED,
  DEFAULT_GENERATOR,
  findPython,
  runGenerator,
  validate,
} = require('./validate.js');

function relativeToRepo(target) {
  return path
    .relative(path.resolve(__dirname, '..', '..', '..'), target)
    .split(path.sep)
    .join('/');
}

function reportPythonMissing() {
  console.error(
    [
      'Sindlish grammar drift gate: Python 3 is required to run the grammar generator.',
      '',
      'The gate re-runs tools/generate_grammar.py against public/interpreter/, so it needs',
      'a Python 3 interpreter on PATH (or in SINDLISH_PYTHON). It cannot verify anything',
      'without one, so it fails rather than passing silently.',
      '',
      '  SINDLISH_PYTHON=/path/to/python3 npm run check:grammar',
      '',
      `  bundled interpreter: ${relativeToRepo(DEFAULT_BUNDLED)}`,
      `  generator:           ${relativeToRepo(DEFAULT_GENERATOR)}`,
    ].join('\n')
  );
  return 2;
}

function write() {
  const python = findPython();
  if (!python) return reportPythonMissing();

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'grammar-drift-'));
  try {
    const generated = runGenerator({
      python,
      bundledDir: DEFAULT_BUNDLED,
      generatorPath: DEFAULT_GENERATOR,
      workDir,
    });

    if (!generated.ok) {
      console.error(
        `Sindlish grammar drift gate: could not generate the grammar (${generated.stage}).`
      );
      console.error(generated.message);
      return 2;
    }

    fs.mkdirSync(path.dirname(DEFAULT_ARTIFACT), { recursive: true });
    fs.writeFileSync(DEFAULT_ARTIFACT, generated.text, 'utf8');
    console.log(`Sindlish grammar drift gate: regenerated ${relativeToRepo(DEFAULT_ARTIFACT)}`);
    return 0;
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

function main(argv = process.argv.slice(2)) {
  if (argv.includes('--write')) {
    return write();
  }

  const { errors, result } = validate();

  if (result) {
    console.log(
      formatReport(result, {
        committedLabel: `committed (${relativeToRepo(DEFAULT_ARTIFACT)})`,
        generatedLabel: `generated (from ${relativeToRepo(DEFAULT_BUNDLED)})`,
      })
    );
  } else {
    console.error('Sindlish grammar drift gate could not run:');
    for (const error of errors) {
      console.error(`  ${error.file}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    if (!result) {
      return 2;
    }
    console.error(`\n${errors.length} grammar drift error(s).`);
    return 1;
  }

  return 0;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = { main };
