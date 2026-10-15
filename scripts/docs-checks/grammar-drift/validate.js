'use strict';

/**
 * Sindlish grammar drift gate -- filesystem + generator wrapper.
 *
 * Reads the committed grammar, runs the interpreter's own grammar generator
 * against the site's bundled interpreter, and maps the comparison onto the
 * docs-check error shape (`{ kind, file, line, raw, message }`) so the same
 * check can be asserted in Vitest and printed by `check.js`.
 *
 * The generator (`generate_grammar.py`) is the canonical script, vendored
 * verbatim from github.com/Sindlish/Sindlish `tools/generate_grammar.py`. It
 * imports `interpreter` from its parent directory, so we stage a throwaway
 * tree of the shape it expects:
 *
 *   <workDir>/tools/generate_grammar.py
 *   <workDir>/interpreter/            (a copy of public/interpreter)
 *
 * and run it there. The generator writes to `<workDir>/vscode-extension/...`;
 * we read that and compare. The generator is never edited.
 */

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { compareGrammars } = require('./grammar-drift.js');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const DEFAULT_ARTIFACT = path.join(REPO_ROOT, 'src', 'lib', 'grammars', 'sindlish.tmLanguage.json');
const DEFAULT_BUNDLED = path.join(REPO_ROOT, 'public', 'interpreter');
const DEFAULT_GENERATOR = path.join(__dirname, 'generate_grammar.py');

const GENERATOR_OUTPUT_RELATIVE = path.join(
  'vscode-extension',
  'syntaxes',
  'sindlish.tmLanguage.json'
);

function makeError(kind, file, message) {
  return { kind, file, line: null, raw: null, message };
}

function relativeToRepo(target) {
  const relative = path.relative(REPO_ROOT, target);
  return relative && !relative.startsWith('..') ? relative.split(path.sep).join('/') : target;
}

/** Find a working Python 3 interpreter, or `null`. Honours `SINDLISH_PYTHON`. */
function findPython(explicit) {
  const envPython = process.env.SINDLISH_PYTHON;
  const candidates = explicit
    ? [explicit]
    : envPython
      ? [envPython]
      : process.platform === 'win32'
        ? ['python', 'python3', 'py']
        : ['python3', 'python'];

  for (const candidate of candidates) {
    const probe = spawnSync(candidate, ['--version'], { encoding: 'utf8' });
    if (!probe.error && probe.status === 0) return candidate;
  }
  return null;
}

/**
 * Run the vendored generator in a staged tree and return the generated text.
 * Exported so tests can exercise the staging without a real interpreter.
 *
 * @returns {{ ok: true, text: string, outputPath: string } | { ok: false, stage: string, message: string }}
 */
function runGenerator({ python, bundledDir, generatorPath, workDir }) {
  const toolsDir = path.join(workDir, 'tools');
  fs.mkdirSync(toolsDir, { recursive: true });
  fs.cpSync(bundledDir, path.join(workDir, 'interpreter'), { recursive: true });
  fs.copyFileSync(generatorPath, path.join(toolsDir, 'generate_grammar.py'));

  const result = spawnSync(python, [path.join(toolsDir, 'generate_grammar.py')], {
    cwd: workDir,
    encoding: 'utf8',
  });

  if (result.error) {
    return { ok: false, stage: 'spawn', message: result.error.message };
  }
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    return {
      ok: false,
      stage: 'run',
      message: `generator exited with code ${result.status}${detail ? `:\n${detail}` : ''}`,
    };
  }

  const outputPath = path.join(workDir, GENERATOR_OUTPUT_RELATIVE);
  if (!fs.existsSync(outputPath)) {
    return {
      ok: false,
      stage: 'output',
      message: `generator ran but produced no grammar at ${GENERATOR_OUTPUT_RELATIVE}`,
    };
  }

  return { ok: true, text: fs.readFileSync(outputPath, 'utf8'), outputPath };
}

/**
 * @param {{
 *   artifactPath?: string,
 *   bundledDir?: string,
 *   generatorPath?: string,
 *   python?: string,
 *   workDir?: string,
 *   generate?: (options: {workDir: string}) => ReturnType<typeof runGenerator>,
 * }} [options]
 * @returns {{ invocations: number, errors: Array<{kind: string, file: string, line: null, raw: null, message: string}>, result?: object }}
 */
function validate(options = {}) {
  const artifactPath = options.artifactPath || DEFAULT_ARTIFACT;
  const bundledDir = options.bundledDir || DEFAULT_BUNDLED;
  const generatorPath = options.generatorPath || DEFAULT_GENERATOR;
  const generate = options.generate;

  if (!fs.existsSync(artifactPath)) {
    return {
      invocations: 0,
      errors: [
        makeError(
          'artifact-unavailable',
          relativeToRepo(artifactPath),
          `committed grammar not found: ${artifactPath}`
        ),
      ],
    };
  }

  if (!fs.existsSync(bundledDir)) {
    return {
      invocations: 0,
      errors: [
        makeError(
          'bundled-unavailable',
          relativeToRepo(bundledDir),
          `bundled interpreter not found: ${bundledDir}`
        ),
      ],
    };
  }

  if (!generate && !fs.existsSync(generatorPath)) {
    return {
      invocations: 0,
      errors: [
        makeError(
          'generator-unavailable',
          relativeToRepo(generatorPath),
          `grammar generator not found: ${generatorPath}`
        ),
      ],
    };
  }

  const python = generate ? null : findPython(options.python);
  if (!generate && !python) {
    return {
      invocations: 0,
      errors: [
        makeError(
          'python-unavailable',
          'python',
          'Python 3 is required to run tools/generate_grammar.py. Install Python, or set ' +
            'SINDLISH_PYTHON to an interpreter. This gate fails rather than passing silently ' +
            'when the generator cannot be executed.'
        ),
      ],
    };
  }

  const workDir = options.workDir || fs.mkdtempSync(path.join(os.tmpdir(), 'grammar-drift-'));
  const ownsWorkDir = !options.workDir;

  try {
    const generated = generate
      ? generate({ workDir })
      : runGenerator({ python, bundledDir, generatorPath, workDir });

    if (!generated.ok) {
      return {
        invocations: 1,
        errors: [
          makeError(
            'generator-failed',
            relativeToRepo(generatorPath),
            `could not generate the grammar (${generated.stage}): ${generated.message}`
          ),
        ],
      };
    }

    const committedText = fs.readFileSync(artifactPath, 'utf8');
    const result = compareGrammars(committedText, generated.text);

    if (!result.ok) {
      const detail =
        result.reason === 'drift'
          ? `the committed grammar differs from generator output at ${result.path}`
          : `the grammar could not be compared: ${result.reason} (${result.error?.message})`;
      return {
        invocations: 1,
        errors: [
          makeError(
            'grammar-drift',
            relativeToRepo(artifactPath),
            `${detail}. Run \`npm run check:grammar -- --write\` to regenerate it.`
          ),
        ],
        result,
      };
    }

    return { invocations: 1, errors: [], result };
  } finally {
    if (ownsWorkDir) {
      fs.rmSync(workDir, { recursive: true, force: true });
    }
  }
}

module.exports = {
  DEFAULT_ARTIFACT,
  DEFAULT_BUNDLED,
  DEFAULT_GENERATOR,
  GENERATOR_OUTPUT_RELATIVE,
  findPython,
  runGenerator,
  validate,
};
