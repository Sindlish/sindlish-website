import { createRequire } from 'module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const {
  buildManifest,
  compareManifests,
  formatReport,
  hashContent,
  isIgnoredPath,
  toPosixPath,
} = require('../staleness.js');
const { validate } = require('../validate.js');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..', '..');
const BUNDLED_DIR = path.join(REPO_ROOT, 'public', 'interpreter');

// These tests never touch the network. The canonical tree is either the
// bundled tree itself or a temporary copy with a deliberate mutation.

describe('staleness: path normalisation', () => {
  it('collapses Windows separators and duplicate slashes', () => {
    expect(toPosixPath('frontend\\lexer.py')).toBe('frontend/lexer.py');
    expect(toPosixPath('./a//b\\c')).toBe('a/b/c');
  });
});

describe('staleness: ignore rules', () => {
  it('ignores bytecode caches but keeps real sources', () => {
    expect(isIgnoredPath('frontend/__pycache__/lexer.cpython-311.pyc')).toBe(true);
    expect(isIgnoredPath('frontend/lexer.pyc')).toBe(true);
    expect(isIgnoredPath('frontend/lexer.py')).toBe(false);
  });
});

describe('staleness: content hashing', () => {
  it('is insensitive to line endings', () => {
    expect(hashContent('a\r\nb\r\n')).toBe(hashContent('a\nb\n'));
    expect(hashContent('a\rb')).toBe(hashContent('a\nb'));
  });

  it('changes when the content changes', () => {
    expect(hashContent('a\n')).not.toBe(hashContent('b\n'));
  });
});

describe('staleness: manifest building', () => {
  it('sorts paths and drops ignored files', () => {
    const manifest = buildManifest([
      { path: 'b.py', content: 'b' },
      { path: 'a.py', content: 'a' },
      { path: '__pycache__/x.pyc', content: 'x' },
    ]);
    expect(manifest.map((entry) => entry.path)).toEqual(['a.py', 'b.py']);
  });
});

describe('staleness: manifest comparison', () => {
  const manifest = (entries) => buildManifest(entries);

  it('passes identical trees', () => {
    const result = compareManifests(
      manifest([{ path: 'a.py', content: 'a\n' }]),
      manifest([{ path: 'a.py', content: 'a\n' }])
    );
    expect(result.ok).toBe(true);
    expect(result.changed).toEqual([]);
    expect(result.missing).toEqual([]);
    expect(result.added).toEqual([]);
  });

  it('detects changed, missing and extra files', () => {
    const result = compareManifests(
      manifest([
        { path: 'same.py', content: 'same' },
        { path: 'changed.py', content: 'new' },
        { path: 'extra.py', content: 'extra' },
      ]),
      manifest([
        { path: 'same.py', content: 'same' },
        { path: 'changed.py', content: 'old' },
        { path: 'missing.py', content: 'missing' },
      ])
    );
    expect(result.ok).toBe(false);
    expect(result.changed.map((entry) => entry.path)).toEqual(['changed.py']);
    expect(result.missing.map((entry) => entry.path)).toEqual(['missing.py']);
    expect(result.added.map((entry) => entry.path)).toEqual(['extra.py']);
  });

  it('allowlists bundle-only files without failing', () => {
    const result = compareManifests(
      manifest([
        { path: 'a.py', content: 'a' },
        { path: '.gitignore', content: '__pycache__/\n' },
      ]),
      manifest([{ path: 'a.py', content: 'a' }])
    );
    expect(result.ok).toBe(true);
    expect(result.allowedExtras.map((entry) => entry.path)).toEqual(['.gitignore']);
    expect(result.added).toEqual([]);
  });
});

describe('staleness: report', () => {
  it('names the drifting files and does not claim success', () => {
    const report = formatReport(
      compareManifests(
        buildManifest([{ path: 'frontend/lexer.py', content: 'new' }]),
        buildManifest([{ path: 'frontend/lexer.py', content: 'old' }])
      )
    );
    expect(report).toContain('frontend/lexer.py');
    expect(report).not.toContain('OK');
  });

  it('reports success for identical trees', () => {
    const report = formatReport(
      compareManifests(
        buildManifest([{ path: 'frontend/lexer.py', content: 'same' }]),
        buildManifest([{ path: 'frontend/lexer.py', content: 'same' }])
      )
    );
    expect(report).toContain('OK');
  });
});

describe('staleness: validation against the real bundled interpreter', () => {
  /** @type {string|undefined} */
  let tmpDir;

  afterEach(() => {
    if (tmpDir) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      tmpDir = undefined;
    }
  });

  it('reports no drift when the bundled tree is compared with itself', () => {
    const { errors } = validate({ bundledDir: BUNDLED_DIR, canonicalDir: BUNDLED_DIR });
    expect(errors).toEqual([]);
  });

  it('catches a real drift in a vendored copy', () => {
    // Copy the real bundled tree, mutate one file, and compare the two: this is
    // exactly the drift the CI gate must fail on.
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'interpreter-staleness-'));
    fs.cpSync(BUNDLED_DIR, tmpDir, { recursive: true });
    fs.appendFileSync(path.join(tmpDir, 'frontend', 'lexer.py'), '\n# drift\n');

    const { errors } = validate({ bundledDir: BUNDLED_DIR, canonicalDir: tmpDir });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.map((error) => error.file)).toContain('public/interpreter/frontend/lexer.py');
    expect(errors.map((error) => error.kind)).toContain('interpreter-drift');
  });

  it('fails loudly when the canonical tree is unavailable', () => {
    const { errors } = validate({
      bundledDir: BUNDLED_DIR,
      canonicalDir: path.join(os.tmpdir(), 'interpreter-staleness-does-not-exist'),
    });
    expect(errors.map((error) => error.kind)).toContain('canonical-unavailable');
  });

  it('refuses to pass on an empty canonical tree', () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'interpreter-staleness-empty-'));
    const { errors } = validate({ bundledDir: BUNDLED_DIR, canonicalDir: tmpDir });
    expect(errors.map((error) => error.kind)).toContain('canonical-empty');
  });
});
