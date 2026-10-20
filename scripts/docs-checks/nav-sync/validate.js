/**
 * Gate 5, navigation ↔ corpus (issue #52): the sidebar and the files under
 * `content/docs` are the same list, in both directions.
 *
 * The docs index and the sidebar render from `navigation.yaml` alone, so a
 * page the navigation forgets is unreachable, and a slug the navigation names
 * that no file backs is a dead entry. `src/app/docs/[...slug]` masks both
 * failures at runtime — every URL renders something — which is exactly why
 * they need a gate.
 */

const fs = require('fs');
const path = require('path');

const jsYaml = require('js-yaml');

const { collectDocsPages } = require('../_lib/inventory');

const { collectNavEntries, diffNavAgainstCorpus, findSlugLines } = require('./nav');

const NAVIGATION_FILE = 'content/docs/navigation.yaml';

/**
 * Run the gate over the real tree.
 *
 * @param {string} [projectRoot=process.cwd()] Repository root.
 * @returns {{invocations: number, errors: {kind: string, file: string, line: number, raw: string, message: string}[]}} Report.
 */
function validate(projectRoot = process.cwd()) {
  const navPath = path.join(projectRoot, NAVIGATION_FILE);
  const rawYaml = fs.readFileSync(navPath, 'utf8');
  const navigation = jsYaml.load(rawYaml);

  const navEntries = collectNavEntries(navigation);
  const pageSlugs = collectDocsPages(projectRoot);
  const { brokenNav, orphanPages } = diffNavAgainstCorpus(navEntries, pageSlugs);
  const slugLines = findSlugLines(rawYaml);

  const errors = [];

  for (const entry of brokenNav) {
    const [line] = slugLines.get(entry.slug) || [1];

    errors.push({
      kind: 'nav-sync/missing-page',
      file: NAVIGATION_FILE,
      line,
      raw: entry.slug,
      message: `navigation entry "${entry.title}" (${entry.navPath}) points at "${entry.slug}", but content/docs/${entry.slug}.md does not exist`,
    });
  }

  for (const slug of orphanPages) {
    errors.push({
      kind: 'nav-sync/missing-nav-entry',
      file: `content/docs/${slug}.md`,
      line: 1,
      raw: slug,
      message: `page "${slug}" exists in the corpus but appears nowhere in ${NAVIGATION_FILE}, so the docs index and sidebar never link to it`,
    });
  }

  return { invocations: navEntries.length, errors };
}

module.exports = { validate };
