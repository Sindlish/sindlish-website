/**
 * Shared markdown helpers for the build gates (issue #52).
 *
 * Lifted into `_lib/` per the rule in scripts/docs-checks/README.md: once a
 * second check needed fence-stripping, the copy moved here instead of being
 * duplicated per check.
 *
 * Everything is line-based and line numbers are preserved: blanked lines keep
 * their position, so an error reported against the stripped view points at the
 * same line in the source file.
 */

/**
 * Split file text into lines, tolerating CRLF and a trailing newline.
 *
 * @param {string} text File contents.
 * @returns {string[]} The lines, without line terminators.
 */
function splitLines(text) {
  return text.replace(/\r\n/g, '\n').split('\n');
}

/**
 * Blank out fenced code blocks (``` or ~~~, three or more markers) in place.
 *
 * A fence opened inside a fence only closes on a matching marker of at least
 * the opening length, mirroring CommonMark. Fence marker lines themselves are
 * blanked too — they cannot contain links, images or components.
 *
 * @param {string[]} lines Source lines of a markdown file.
 * @returns {string[]} The same lines with every fence region replaced by ''.
 */
function stripFencedCode(lines) {
  const result = [];
  let fence = null;

  for (const line of lines) {
    const match = line.match(/^(\s{0,3})(`{3,}|~{3,})/);

    if (match) {
      const marker = match[2][0];
      const length = match[2].length;

      if (!fence) {
        fence = { marker, length };
      } else if (marker === fence.marker && length >= fence.length) {
        fence = null;
      }

      result.push('');
      continue;
    }

    result.push(fence ? '' : line);
  }

  return result;
}

/**
 * Blank out inline code spans (`` `like this` ``) so their contents are never
 * mistaken for real syntax. Blanked runs keep their length.
 *
 * @param {string} line A single line of markdown.
 * @returns {string} The line with inline code spans replaced by spaces.
 */
function stripInlineCode(line) {
  return line.replace(/`[^`]*`/g, (match) => ' '.repeat(match.length));
}

/**
 * Strip fences and inline code in one pass, keeping line numbers aligned.
 *
 * @param {string} text File contents.
 * @returns {string[]} Lines with code regions blanked.
 */
function stripCode(text) {
  return stripFencedCode(splitLines(text)).map(stripInlineCode);
}

module.exports = { splitLines, stripFencedCode, stripInlineCode, stripCode };
