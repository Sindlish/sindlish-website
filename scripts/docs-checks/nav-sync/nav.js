/**
 * Pure navigation logic for Gate 5, navigation ↔ corpus (issue #52).
 *
 * `navigation.yaml` and the files under `content/docs` are two views of the
 * same list; this module diffs them. Pure over parsed data so the rules unit
 * test without reading the tree.
 */

/**
 * Flatten the navigation tree into leaf entries.
 *
 * The shape is pillar → section → page:
 *
 * ```yaml
 * - nav: Learn
 *   slug: introduction      # pillar-level, unused by the shell
 *   items:
 *     - section: The Basics
 *       items:
 *         - title: Variables
 *           slug: basics/variables
 * ```
 *
 * Only `title`-bearing leaves are pages; `section` nodes are groupings.
 *
 * @param {object[]} navigation Parsed navigation.yaml.
 * @returns {{slug: string, title: string, navPath: string}[]} Leaf entries.
 */
function collectNavEntries(navigation) {
  const entries = [];

  const visit = (items, navPath) => {
    for (const item of items || []) {
      const label = item.title || item.nav || item.section || '';

      if (item.slug && item.title) {
        entries.push({ slug: item.slug, title: item.title, navPath });
      }

      if (Array.isArray(item.items)) {
        const nextPath = navPath ? `${navPath} > ${label}` : label;
        visit(item.items, nextPath);
      }
    }
  };

  visit(navigation, '');

  return entries;
}

/**
 * Diff navigation leaves against corpus page slugs, both directions.
 *
 * A slug appearing more than once in the navigation is legitimate — the
 * content pipeline scores multiple locations per page to pick a canonical one
 * (see `process-md-for-llms.js`), so cross-referencing a page from two
 * pillars is allowed. Only pages the corpus does not have, and pages the
 * navigation never mentions, are errors.
 *
 * @param {{slug: string, title: string, navPath: string}[]} navEntries Flattened leaves.
 * @param {string[]} pageSlugs Corpus slugs, e.g. `basics/variables`.
 * @returns {{brokenNav: {slug: string, title: string, navPath: string}[], orphanPages: string[]}} Diffs.
 */
function diffNavAgainstCorpus(navEntries, pageSlugs) {
  const pages = new Set(pageSlugs);
  const navSlugs = new Set(navEntries.map((entry) => entry.slug));

  return {
    brokenNav: navEntries.filter((entry) => !pages.has(entry.slug)),
    orphanPages: pageSlugs.filter((slug) => !navSlugs.has(slug)),
  };
}

/**
 * Map every `slug:` line in the raw YAML to its 1-based line number, so an
 * error can name the line to edit.
 *
 * @param {string} rawYaml File contents of navigation.yaml.
 * @returns {Map<string, number[]>} Slug → line numbers.
 */
function findSlugLines(rawYaml) {
  const lines = new Map();

  rawYaml.split(/\r?\n/).forEach((line, index) => {
    const match = line.match(/^\s*-?\s*slug:\s*(\S+)\s*$/);
    if (!match) return;

    const list = lines.get(match[1]) || [];
    list.push(index + 1);
    lines.set(match[1], list);
  });

  return lines;
}

module.exports = { collectNavEntries, diffNavAgainstCorpus, findSlugLines };
