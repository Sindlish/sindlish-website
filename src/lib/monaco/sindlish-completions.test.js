import { describe, expect, it } from 'vitest';

import { SINDLISH_KEYWORD_GLOSSES } from '../grammars/sindlish-keywords';

import { buildSindlishCompletionItems } from './sindlish-completions';

describe('buildSindlishCompletionItems', () => {
  it('pairs keyword suggestions with their English gloss from the gloss asset', () => {
    const [item] = buildSindlishCompletionItems([{ label: 'wapas', kind: 'Keyword' }]);

    expect(item.detail).toBe(SINDLISH_KEYWORD_GLOSSES.wapas);
    expect(item.detail).toBe('return');
    expect(item.documentation).toBe('Return a value from a function');
  });

  it('keeps the server detail on non-keyword items and adds no gloss', () => {
    const [item] = buildSindlishCompletionItems([
      { label: 'likh', kind: 'Function', detail: 'Built-in Function' },
    ]);

    expect(item.detail).toBe('Built-in Function');
    expect(item.documentation).toBeUndefined();
  });

  it('preserves server order through Monaco via sortText', () => {
    const items = buildSindlishCompletionItems([
      { label: 'wapas', kind: 'Keyword' },
      { label: 'likh', kind: 'Function', detail: 'Built-in Function' },
      { label: 'kaam', kind: 'Keyword' },
    ]);

    expect(items.map((item) => item.label)).toEqual(['wapas', 'likh', 'kaam']);
    expect(items.map((item) => item.sortText)).toEqual(['0000', '0001', '0002']);
  });

  it('tolerates an empty or missing item list', () => {
    expect(buildSindlishCompletionItems([])).toEqual([]);
    expect(buildSindlishCompletionItems()).toEqual([]);
  });
});
