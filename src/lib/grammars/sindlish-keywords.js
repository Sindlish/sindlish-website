/**
 * The English glosses for Sindlish's reserved words -- a website content asset.
 *
 * This is the ONE place the site keeps keyword -> English explanations. The
 * docs keyword reference and the workbench editor's completion dropdown (T9)
 * both import this file; nothing else may hard-code a Sindlish keyword gloss.
 *
 * The keyword SET is not invented here: it mirrors `KEYWORDS` in the real
 * interpreter (`public/interpreter/frontend/keywords.py`), which the drift
 * gate keeps current. `src/lib/grammars/sindlish-keywords.test.js` fails if the
 * two ever disagree, so this list cannot silently grow or shrink.
 *
 * Colour and structure come from the generated TextMate grammar
 * (`sindlish.tmLanguage.json`), not from here. This file is vocabulary only.
 *
 * `kind` groups a keyword for presentation:
 *   type      - names a data type, used in declarations/annotations
 *   literal   - a keyword that is also a value
 *   control   - control flow
 *   scope     - function/scope declarations
 *   result    - Result and error construction
 *   operator  - an operator spelled as a word
 *   reserved  - reserved but not implemented
 */

export const SINDLISH_KEYWORDS = Object.freeze([
  // Data types
  { keyword: 'adad', kind: 'type', gloss: 'number', note: 'Whole numbers like 0, 5, -3' },
  { keyword: 'dahai', kind: 'type', gloss: 'decimal', note: 'Decimal numbers like 3.14, -0.5' },
  { keyword: 'lafz', kind: 'type', gloss: 'word', note: 'Text strings like "Salam"' },
  {
    keyword: 'faislo',
    kind: 'type',
    gloss: 'decision',
    note: 'Boolean: sach (true) or koorh (false)',
  },
  { keyword: 'khali', kind: 'type', gloss: 'empty', note: 'Nothing at all' },
  { keyword: 'fehrist', kind: 'type', gloss: 'list', note: 'Ordered collection: [1, 2]' },
  { keyword: 'lughat', kind: 'type', gloss: 'dictionary', note: 'Key-value pairs: {"a": 1}' },
  { keyword: 'majmuo', kind: 'type', gloss: 'set', note: 'Unique values: {1, 2}' },

  // Literals
  { keyword: 'sach', kind: 'literal', gloss: 'true', note: 'The true value' },
  { keyword: 'koorh', kind: 'literal', gloss: 'false', note: 'The false value' },

  // Control flow
  { keyword: 'agar', kind: 'control', gloss: 'if', note: 'Start a conditional branch' },
  { keyword: 'yawari', kind: 'control', gloss: 'else if', note: 'Another conditional branch' },
  { keyword: 'warna', kind: 'control', gloss: 'otherwise', note: 'The else branch' },
  { keyword: 'jistain', kind: 'control', gloss: 'while', note: 'Repeat while a condition holds' },
  { keyword: 'har', kind: 'control', gloss: 'each', note: 'For-each loop over a collection' },
  { keyword: 'tor', kind: 'control', gloss: 'break', note: 'Break out of a loop' },
  { keyword: 'jari', kind: 'control', gloss: 'continue', note: 'Skip to the next iteration' },

  // Functions and scope
  { keyword: 'kaam', kind: 'scope', gloss: 'function', note: 'Declare a function' },
  { keyword: 'wapas', kind: 'scope', gloss: 'return', note: 'Return a value from a function' },
  { keyword: 'mein', kind: 'scope', gloss: 'in', note: 'Pairs with har: "each ... in ..."' },
  {
    keyword: 'bahari',
    kind: 'scope',
    gloss: 'nonlocal',
    note: 'Bind to the enclosing function scope',
  },
  { keyword: 'aalmi', kind: 'scope', gloss: 'global', note: 'Bind to the module scope' },

  // Results and errors
  { keyword: 'ok', kind: 'result', gloss: 'ok', note: 'Wrap a value in an OK Result' },
  {
    keyword: 'ghalti',
    kind: 'result',
    gloss: 'error',
    note: 'Create an error Result, or raise one',
  },

  // Operators written as words
  { keyword: 'aen', kind: 'operator', gloss: 'and', note: 'Logical and' },
  { keyword: 'ya', kind: 'operator', gloss: 'or', note: 'Logical or' },
  { keyword: 'nah', kind: 'operator', gloss: 'not', note: 'Logical not' },
  { keyword: 'pakko', kind: 'operator', gloss: 'const', note: 'Make a variable read-only' },

  // Reserved
  {
    keyword: 'match',
    kind: 'reserved',
    gloss: 'match',
    note: 'Reserved for pattern matching; not implemented yet',
  },
]);

/** Keyword -> short English gloss, for O(1) lookup (e.g. a hover or a tooltip). */
export const SINDLISH_KEYWORD_GLOSSES = Object.freeze(
  Object.fromEntries(SINDLISH_KEYWORDS.map(({ keyword, gloss }) => [keyword, gloss]))
);

/** Return the gloss entry for a keyword, or `undefined` if it is not reserved. */
export function getSindlishKeyword(keyword) {
  return SINDLISH_KEYWORDS.find((entry) => entry.keyword === keyword);
}

export default SINDLISH_KEYWORDS;
