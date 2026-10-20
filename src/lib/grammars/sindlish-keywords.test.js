import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  SINDLISH_KEYWORDS,
  SINDLISH_KEYWORD_GLOSSES,
  getSindlishKeyword,
} from './sindlish-keywords.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..');
const KEYWORDS_PY = path.join(REPO_ROOT, 'public', 'interpreter', 'frontend', 'keywords.py');

/** Read the reserved words straight from the interpreter source. */
function interpreterKeywords() {
  const source = fs.readFileSync(KEYWORDS_PY, 'utf8');
  const keys = [];
  for (const match of source.matchAll(/"([a-z_]+)":\s*TokenType\./g)) {
    keys.push(match[1]);
  }
  return keys;
}

describe('sindlish-keywords: the single gloss asset', () => {
  it('covers exactly the interpreter’s reserved words', () => {
    const fromInterpreter = interpreterKeywords().sort();
    const fromAsset = SINDLISH_KEYWORDS.map((entry) => entry.keyword).sort();
    expect(fromAsset).toEqual(fromInterpreter);
  });

  it('has no duplicate keywords', () => {
    const keywords = SINDLISH_KEYWORDS.map((entry) => entry.keyword);
    expect(new Set(keywords).size).toBe(keywords.length);
  });

  it('gives every keyword a non-empty English gloss', () => {
    for (const { keyword, gloss } of SINDLISH_KEYWORDS) {
      expect(gloss, keyword).toBeTruthy();
    }
  });

  it('exposes an O(1) gloss lookup and a finder', () => {
    expect(SINDLISH_KEYWORD_GLOSSES.wapas).toBe('return');
    expect(getSindlishKeyword('wapas').kind).toBe('scope');
    expect(getSindlishKeyword('not-a-keyword')).toBeUndefined();
  });
});
