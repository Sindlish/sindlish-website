/**
 * Shared error reporting for the build gates (issue #52).
 *
 * Every check follows the docs-checks contract: `validate()` returns
 * `{ invocations, errors }` where each error is `{ kind, file, line, raw,
 * message }`, and the `check.js` CLI prints one readable line per error and
 * exits non-zero.
 */

/**
 * Render one error as a `file:line [kind] message` line.
 *
 * @param {{file: string, line: number, kind: string, message: string}} error Error to format.
 * @returns {string} Human-readable single line.
 */
function formatError({ file, line, kind, message }) {
  return `${file}:${line} [${kind}] ${message}`;
}

/**
 * Sort errors by file, then line, then kind, so output is deterministic
 * regardless of directory walk order.
 *
 * @param {{file: string, line: number, kind: string}[]} errors Errors to sort.
 * @returns {{file: string, line: number, kind: string}[]} A new, sorted array.
 */
function sortErrors(errors) {
  return [...errors].sort(
    (a, b) =>
      a.file.localeCompare(b.file) || a.line - b.line || (a.kind || '').localeCompare(b.kind || '')
  );
}

/**
 * Print the standard pass/fail report for a gate.
 *
 * @param {{name: string, invocations: number, errors: {file: string, line: number, kind: string, message: string}[]}} report Gate report.
 * @returns {void}
 */
function printReport({ name, invocations, errors }) {
  const sorted = sortErrors(errors);

  if (sorted.length === 0) {
    console.log(`\u2705 ${name}: ${invocations} invocations, no errors.`);
    return;
  }

  console.error(`\u274c ${name}: ${sorted.length} error(s) in ${invocations} invocations.`);
  for (const error of sorted) {
    console.error(`   ${formatError(error)}`);
  }
}

module.exports = { formatError, sortErrors, printReport };
