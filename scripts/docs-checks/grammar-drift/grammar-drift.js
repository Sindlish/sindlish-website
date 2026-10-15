'use strict';

/**
 * Grammar drift gate -- pure comparison logic.
 *
 * The committed TextMate grammar (`src/lib/grammars/sindlish.tmLanguage.json`)
 * must stay exactly equal to what the interpreter's own generator produces
 * from the bundled interpreter (`public/interpreter/`). If they diverge the
 * site highlights keywords the language no longer runs (or misses new ones).
 *
 * This module only normalises and compares grammar objects. Reading files and
 * running the generator (which needs Python) live in `validate.js`; the CLI
 * entry point is `check.js`. Nothing here touches the filesystem or the
 * network, so the behaviour is unit-testable.
 */

/** Collapse CRLF and lone CR to LF so Windows and Linux agree. */
function normalizeNewlines(text) {
  return String(text).replace(/\r\n?/g, '\n');
}

/**
 * Serialise a JSON value with object keys sorted at every level, so two
 * grammars compare equal regardless of key order. Arrays keep their order:
 * order is meaningful in a TextMate `patterns` list.
 */
function canonicalize(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(',')}]`;
  }
  if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

/** Parse grammar JSON, returning `{ ok, value }` or `{ ok: false, error }`. */
function parseGrammar(text) {
  try {
    return { ok: true, value: JSON.parse(normalizeNewlines(text)) };
  } catch (error) {
    return { ok: false, error };
  }
}

/**
 * Find the first structural difference between two parsed values.
 * Returns a dotted path such as `repository.keywords.patterns[0].match`,
 * or `null` when the values are equal.
 */
function firstDifference(expected, actual, path = '') {
  if (expected === actual) return null;

  const expectedIsArray = Array.isArray(expected);
  const actualIsArray = Array.isArray(actual);
  if (expectedIsArray || actualIsArray) {
    if (!expectedIsArray || !actualIsArray) return path || '<root>';
    const length = Math.max(expected.length, actual.length);
    for (let index = 0; index < length; index += 1) {
      if (index >= expected.length || index >= actual.length) {
        return `${path}[${index}]`;
      }
      const difference = firstDifference(expected[index], actual[index], `${path}[${index}]`);
      if (difference) return difference;
    }
    return null;
  }

  const expectedIsObject = expected !== null && typeof expected === 'object';
  const actualIsObject = actual !== null && typeof actual === 'object';
  if (expectedIsObject || actualIsObject) {
    if (!expectedIsObject || !actualIsObject) return path || '<root>';
    const keys = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort();
    for (const key of keys) {
      const keyPath = path ? `${path}.${key}` : key;
      if (!(key in expected) || !(key in actual)) return keyPath;
      const difference = firstDifference(expected[key], actual[key], keyPath);
      if (difference) return difference;
    }
    return null;
  }

  return path || '<root>';
}

/**
 * Compare the committed grammar text against freshly generated text.
 *
 * @param {string} committedText
 * @param {string} generatedText
 * @returns {{
 *   ok: boolean,
 *   reason?: 'committed-unparsable'|'generated-unparsable'|'drift',
 *   path?: string|null,
 *   error?: Error,
 * }}
 */
function compareGrammars(committedText, generatedText) {
  const committed = parseGrammar(committedText);
  if (!committed.ok) {
    return { ok: false, reason: 'committed-unparsable', error: committed.error };
  }

  const generated = parseGrammar(generatedText);
  if (!generated.ok) {
    return { ok: false, reason: 'generated-unparsable', error: generated.error };
  }

  if (canonicalize(committed.value) === canonicalize(generated.value)) {
    return { ok: true };
  }

  return {
    ok: false,
    reason: 'drift',
    path: firstDifference(committed.value, generated.value),
  };
}

/**
 * Render a human-readable report for a comparison result.
 *
 * @param {ReturnType<typeof compareGrammars>} result
 * @param {{committedLabel?: string, generatedLabel?: string}} [options]
 * @returns {string}
 */
function formatReport(result, options = {}) {
  const committedLabel = options.committedLabel || 'committed grammar';
  const generatedLabel = options.generatedLabel || 'generated grammar';
  const lines = ['Sindlish grammar drift gate', `  ${committedLabel}`, `  ${generatedLabel}`, ''];

  if (result.ok) {
    lines.push('  OK  the committed grammar matches the generator output.');
    return lines.join('\n');
  }

  if (result.reason === 'committed-unparsable') {
    lines.push(`  FAIL  the committed grammar is not valid JSON: ${result.error.message}`);
    return lines.join('\n');
  }

  if (result.reason === 'generated-unparsable') {
    lines.push(`  FAIL  the generator produced invalid JSON: ${result.error.message}`);
    return lines.join('\n');
  }

  lines.push(`  DRIFT  first difference at: ${result.path}`);
  lines.push('  The committed grammar no longer matches the interpreter.');
  lines.push('  Regenerate it: npm run check:grammar -- --write');
  return lines.join('\n');
}

module.exports = {
  canonicalize,
  compareGrammars,
  firstDifference,
  formatReport,
  normalizeNewlines,
  parseGrammar,
};
