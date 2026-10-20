import { createRequire } from 'module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const {
  canonicalize,
  compareGrammars,
  firstDifference,
  formatReport,
  normalizeNewlines,
  parseGrammar,
} = require('../grammar-drift.js');
const {
  DEFAULT_ARTIFACT,
  DEFAULT_BUNDLED,
  DEFAULT_GENERATOR,
  findPython,
  validate,
} = require('../validate.js');

// Pure logic runs everywhere. The generator itself needs Python; those tests
// are skipped when it is unavailable so the Node-only unit job stays green.
const python = findPython();

describe('grammar-drift: normalisation', () => {
  it('collapses CRLF and lone CR to LF', () => {
    expect(normalizeNewlines('a\r\nb\rc\n')).toBe('a\nb\nc\n');
  });

  it('canonicalises object key order but preserves array order', () => {
    expect(canonicalize({ b: 1, a: 2 })).toBe(canonicalize({ a: 2, b: 1 }));
    expect(canonicalize([1, 2])).not.toBe(canonicalize([2, 1]));
  });
});

describe('grammar-drift: parsing', () => {
  it('parses valid JSON and reports invalid JSON', () => {
    expect(parseGrammar('{"a":1}').ok).toBe(true);
    expect(parseGrammar('{not json').ok).toBe(false);
  });
});

describe('grammar-drift: first difference', () => {
  it('locates a nested path', () => {
    const expected = { repository: { keywords: { patterns: [{ match: 'x' }] } } };
    const actual = { repository: { keywords: { patterns: [{ match: 'y' }] } } };
    expect(firstDifference(expected, actual)).toBe('repository.keywords.patterns[0].match');
  });

  it('returns null for identical values', () => {
    expect(firstDifference({ a: [1, 2] }, { a: [1, 2] })).toBeNull();
  });

  it('returns null for deeply equal structures (no false positive path)', () => {
    const grammar = {
      patterns: [{ include: '#comments' }],
      repository: { types: { match: 'adad|lafz' } },
    };
    expect(firstDifference(grammar, structuredClone(grammar))).toBeNull();
  });
});

describe('grammar-drift: comparison', () => {
  it('passes when the grammars are equal modulo formatting and key order', () => {
    const committed = '{ "name": "Sindlish", "scopeName": "source.sindlish" }';
    const generated = '{\n  "scopeName": "source.sindlish",\n  "name": "Sindlish"\n}\n';
    expect(compareGrammars(committed, generated).ok).toBe(true);
  });

  it('fails on a real content change and names the path', () => {
    const committed = JSON.stringify({ keywords: ['agar', 'warna'] });
    const generated = JSON.stringify({ keywords: ['agar', 'warna', 'naya'] });
    const result = compareGrammars(committed, generated);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('drift');
    expect(result.path).toBe('keywords[2]');
  });

  it('flags an unparsable committed artifact', () => {
    expect(compareGrammars('{oops', '{}').reason).toBe('committed-unparsable');
  });
});

describe('grammar-drift: report', () => {
  it('does not claim success on drift', () => {
    const report = formatReport(compareGrammars('{"a":1}', '{"a":2}'));
    expect(report).not.toContain('OK');
    expect(report).toContain('a');
  });

  it('reports success for identical grammars', () => {
    expect(formatReport(compareGrammars('{"a":1}', '{"a":1}'))).toContain('OK');
  });
});

describe('grammar-drift: validate', () => {
  /** @type {string|undefined} */
  let tmpDir;

  afterEach(() => {
    if (tmpDir) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      tmpDir = undefined;
    }
  });

  it('passes when the injected generator output matches the committed artifact', () => {
    const committed = fs.readFileSync(DEFAULT_ARTIFACT, 'utf8');
    const { errors } = validate({ generate: () => ({ ok: true, text: committed }) });
    expect(errors).toEqual([]);
  });

  it('fails on drift in a vendored artifact copy, naming the file', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'grammar-drift-artifact-'));
    const artifactCopy = path.join(tmpDir, 'sindlish.tmLanguage.json');
    const committed = JSON.parse(fs.readFileSync(DEFAULT_ARTIFACT, 'utf8'));
    committed.repository.keywords.patterns[0].match = '\\b(?:agar)\\b';
    fs.writeFileSync(artifactCopy, JSON.stringify(committed, null, 2));

    const { errors } = validate({
      artifactPath: artifactCopy,
      generate: () => ({ ok: true, text: fs.readFileSync(DEFAULT_ARTIFACT, 'utf8') }),
    });

    expect(errors.map((error) => error.kind)).toContain('grammar-drift');
    expect(errors[0].message).toContain('repository.keywords.patterns[0].match');
  });

  it('fails loudly when the artifact is missing', () => {
    const { errors } = validate({ artifactPath: path.join(os.tmpdir(), 'nope.json') });
    expect(errors.map((error) => error.kind)).toContain('artifact-unavailable');
  });

  it('fails loudly when the bundled interpreter is missing', () => {
    const { errors } = validate({
      bundledDir: path.join(os.tmpdir(), 'no-interpreter-here'),
    });
    expect(errors.map((error) => error.kind)).toContain('bundled-unavailable');
  });

  it('fails loudly when the generator is missing', () => {
    const { errors } = validate({
      generatorPath: path.join(os.tmpdir(), 'no-generator-here.py'),
    });
    expect(errors.map((error) => error.kind)).toContain('generator-unavailable');
  });

  it('reports a generator failure rather than passing silently', () => {
    const { errors } = validate({
      generate: () => ({ ok: false, stage: 'run', message: 'boom' }),
    });
    expect(errors.map((error) => error.kind)).toContain('generator-failed');
  });

  it('fails loudly when Python is unavailable', () => {
    const { errors } = validate({ python: 'definitely-not-a-python-interpreter-xyz' });
    expect(errors.map((error) => error.kind)).toContain('python-unavailable');
  });
});

describe.skipIf(!python)('grammar-drift: real generator', () => {
  it('confirms the committed artifact is exactly the generator output', () => {
    const { errors, result } = validate();
    expect(result?.ok).toBe(true);
    expect(errors).toEqual([]);
  });

  it('detects a perturbed interpreter as drift', () => {
    // A keyword added to the bundled interpreter's KEYWORDS dict changes the
    // generated grammar; the gate must fail on it. This is the drift the CI
    // gate exists to catch.
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'grammar-drift-interpreter-'));
    try {
      const bundled = path.join(tmpDir, 'interpreter');
      fs.cpSync(DEFAULT_BUNDLED, bundled, { recursive: true });
      const keywordsPath = path.join(bundled, 'frontend', 'keywords.py');
      const source = fs.readFileSync(keywordsPath, 'utf8');
      const marker = '    "mein": TokenType.MEIN,';
      expect(source).toContain(marker);
      fs.writeFileSync(
        keywordsPath,
        source.replace(marker, `${marker}\n    "naya": TokenType.MEIN,`)
      );

      const { errors } = validate({ bundledDir: bundled });
      expect(errors.map((error) => error.kind)).toContain('grammar-drift');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('grammar-drift: canonical artifact is present', () => {
  it('commits the artifact under src/lib/grammars', () => {
    expect(fs.existsSync(DEFAULT_ARTIFACT)).toBe(true);
    const grammar = JSON.parse(fs.readFileSync(DEFAULT_ARTIFACT, 'utf8'));
    expect(grammar.name).toBe('Sindlish');
    expect(grammar.scopeName).toBe('source.sindlish');
  });

  it('vendors the canonical generator', () => {
    expect(fs.existsSync(DEFAULT_GENERATOR)).toBe(true);
    expect(fs.readFileSync(DEFAULT_GENERATOR, 'utf8')).toContain('def generate_grammar():');
  });
});
