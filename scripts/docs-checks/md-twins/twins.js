/**
 * Pure logic for the markdown-twin completeness check (issue #52, folds in
 * T10).
 *
 * Every docs page is exported as a markdown twin under `public/md` so AI
 * agents and `Accept: text/markdown` requests get the same corpus. This
 * module diffs the source set against the twin set and checks each twin's
 * title and summary match its page's frontmatter — pure over paths and
 * strings, so the rules unit-test without the tree.
 */

/**
 * Diff source files against generated twins, both directions.
 *
 * @param {string[]} sourcePaths Content-relative paths, e.g. `docs/basics/variables.md`.
 * @param {string[]} twinPaths The same relative form, e.g. `docs/basics/variables.md` (the file itself lives under `public/md/`).
 * @returns {{missing: string[], stale: string[]}} Pages without a twin, twins without a page.
 */
function compareSets(sourcePaths, twinPaths) {
  const sources = new Set(sourcePaths);
  const twins = new Set(twinPaths);

  return {
    missing: sourcePaths.filter((file) => !twins.has(file)),
    stale: twinPaths.filter((file) => !sources.has(file)),
  };
}

/**
 * Find the frontmatter-derived `# title` heading in a twin.
 *
 * @param {string[]} twinLines Twin lines.
 * @param {string} title Frontmatter `title`.
 * @returns {number} 1-based line, or -1 when absent.
 */
function findTwinTitleLine(twinLines, title) {
  const index = twinLines.findIndex((line) => line.trim() === `# ${title}`);

  return index === -1 ? -1 : index + 1;
}

/**
 * Find the frontmatter-derived `> summary` blockquote in a twin.
 *
 * This is the summary's second of three homes (frontmatter, twin, and the
 * rendered meta description, which has no other source); a twin missing the
 * line means the export and the page disagree.
 *
 * @param {string[]} twinLines Twin lines.
 * @param {string} summary Frontmatter `summary`.
 * @returns {number} 1-based line, or -1 when absent.
 */
function findTwinSummaryLine(twinLines, summary) {
  const index = twinLines.findIndex((line) => line.trim() === `> ${summary}`);

  return index === -1 ? -1 : index + 1;
}

module.exports = { compareSets, findTwinSummaryLine, findTwinTitleLine };
