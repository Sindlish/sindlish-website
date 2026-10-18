/**
 * Markdown-twin completeness check (issue #52, folds in T10): every docs page
 * has a generated markdown twin whose title and summary match the page's
 * frontmatter.
 *
 * The twins under `public/md` are build artifacts — gitignored, produced by
 * `src/scripts/copy-md-content.js` in `postbuild`. This check regenerates them
 * before comparing so it works on a fresh clone, reports generator crashes as
 * gate failures, and never compares stale artifacts against fresh sources.
 */

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const { splitLines } = require('../_lib/markdown');
const { parseFrontmatterBlock } = require('../docs-references/references');

const { compareSets, findTwinSummaryLine, findTwinTitleLine } = require('./twins');

const SOURCE_DIR = 'content';
const TWIN_DIR = 'public/md';
const GENERATOR = 'src/scripts/copy-md-content.js';

/** Files the content pipeline exports but never treats as pages. */
const SOURCE_IGNORE_DIRS = ['unused', 'shared-content'];
const SOURCE_IGNORE_FILES = ['GUIDE_TEMPLATE.md'];

/**
 * Collect markdown files under `dir`, as paths relative to `base`.
 *
 * @param {string} dir Directory to walk.
 * @param {string} base Directory paths are made relative to.
 * @returns {string[]} Forward-slashed relative paths.
 */
function collectMarkdown(dir, base) {
  const found = [];

  if (!fs.existsSync(dir)) return found;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (SOURCE_IGNORE_DIRS.includes(entry.name)) continue;
      found.push(...collectMarkdown(fullPath, base));
    } else if (entry.name.endsWith('.md') && !SOURCE_IGNORE_FILES.includes(entry.name)) {
      found.push(path.relative(base, fullPath).split(path.sep).join('/'));
    }
  }

  return found;
}

/**
 * Run the check over the real tree, regenerating the twins first.
 *
 * @param {string} [projectRoot=process.cwd()] Repository root.
 * @returns {{invocations: number, errors: {kind: string, file: string, line: number, raw: string, message: string}[]}} Report.
 */
function validate(projectRoot = process.cwd()) {
  const generated = spawnSync(process.execPath, [path.join(projectRoot, GENERATOR)], {
    cwd: projectRoot,
    stdio: 'pipe',
    encoding: 'utf8',
  });

  if (generated.status !== 0) {
    return {
      invocations: 0,
      errors: [
        {
          kind: 'md-twins/generator-failed',
          file: GENERATOR,
          line: 1,
          raw: `exit ${generated.status}`,
          message: `the markdown twin generator failed, so no twin can be verified: ${(
            generated.stderr || generated.stdout || ''
          )
            .trim()
            .split('\n')
            .slice(-3)
            .join(' ')}`,
        },
      ],
    };
  }

  // Only `content/docs` is a content route (`CONTENT_ROUTES`); `content/README.md`
  // and friends are contributor guides, never exported.
  const sourceFiles = collectMarkdown(
    path.join(projectRoot, SOURCE_DIR, 'docs'),
    path.join(projectRoot, SOURCE_DIR)
  );
  const twinFiles = collectMarkdown(path.join(projectRoot, TWIN_DIR), path.join(projectRoot, TWIN_DIR));
  const { missing, stale } = compareSets(sourceFiles, twinFiles);

  const errors = [];
  for (const file of missing) {
    errors.push({
      kind: 'md-twins/missing-twin',
      file: `${SOURCE_DIR}/${file}`,
      line: 1,
      raw: file,
      message: `page has no markdown twin at ${TWIN_DIR}/${file}; run "${GENERATOR}" and investigate if it fails`,
    });
  }

  for (const file of stale) {
    errors.push({
      kind: 'md-twins/stale-twin',
      file: `${TWIN_DIR}/${file}`,
      line: 1,
      raw: file,
      message: `twin has no source page at ${SOURCE_DIR}/${file}; the export is stale`,
    });
  }

  for (const file of sourceFiles) {
    const sourceLines = splitLines(
      fs.readFileSync(path.join(projectRoot, SOURCE_DIR, file), 'utf8')
    );
    const frontmatter = parseFrontmatterBlock(sourceLines);

    if (!frontmatter) continue;

    const twinPath = path.join(projectRoot, TWIN_DIR, file);
    if (!fs.existsSync(twinPath)) continue; // already reported as missing

    const twinLines = splitLines(fs.readFileSync(twinPath, 'utf8'));
    const titleKey = frontmatter.keys.find((key) => key.name === 'title');
    const summaryKey = frontmatter.keys.find((key) => key.name === 'summary');

    if (titleKey && findTwinTitleLine(twinLines, titleKey.value.replace(/^["']|["']$/g, '')) === -1) {
      errors.push({
        kind: 'md-twins/title-mismatch',
        file: `${SOURCE_DIR}/${file}`,
        line: titleKey.line,
        raw: titleKey.value,
        message: `frontmatter title "${titleKey.value}" does not appear as the "# ..." heading of ${TWIN_DIR}/${file}`,
      });
    }

    if (
      summaryKey &&
      findTwinSummaryLine(twinLines, summaryKey.value.replace(/^["']|["']$/g, '')) === -1
    ) {
      errors.push({
        kind: 'md-twins/summary-mismatch',
        file: `${SOURCE_DIR}/${file}`,
        line: summaryKey.line,
        raw: summaryKey.value,
        message: `frontmatter summary "${summaryKey.value}" does not appear as the "> ..." line of ${TWIN_DIR}/${file}; the twin and the page disagree`,
      });
    }
  }

  return { invocations: sourceFiles.length, errors };
}

module.exports = { collectMarkdown, validate };
