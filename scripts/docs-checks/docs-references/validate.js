/**
 * Gate 3, docs references (issue #52): every screenshot, component and
 * frontmatter field a docs page references exists.
 *
 * Scope is the rendered corpus — the same files `api-content.js` turns into
 * pages. `content/docs/README.md` is excluded on purpose: it is a contributor
 * guide, never a page, and its fenced examples are already invisible to the
 * extractor.
 */

const fs = require('fs');
const path = require('path');

const { splitLines, stripCode } = require('../_lib/markdown');

const {
  extractComponentRefs,
  extractImageRefs,
  parseComponentSurface,
  parseFrontmatterBlock,
  validateComponents,
  validateFrontmatter,
  validateImageRefs,
} = require('./references');

const PAGE_IGNORE = ['README.md', 'GUIDE_TEMPLATE.md'];
const PAGE_IGNORE_DIRS = ['unused', 'shared-content'];

const COMPONENT_SURFACE = 'src/components/shared/content/content.jsx';

/**
 * Collect every docs page as a repo-relative path.
 *
 * @param {string} dir Directory to walk.
 * @param {string} projectRoot Repository root.
 * @returns {string[]} Repo-relative page paths, forward-slashed.
 */
function collectPages(dir, projectRoot) {
  const pages = [];

  if (!fs.existsSync(dir)) return pages;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (PAGE_IGNORE_DIRS.includes(entry.name)) continue;
      pages.push(...collectPages(fullPath, projectRoot));
    } else if (/\.mdx?$/.test(entry.name) && !PAGE_IGNORE.includes(entry.name)) {
      pages.push(path.relative(projectRoot, fullPath).split(path.sep).join('/'));
    }
  }

  return pages;
}

/**
 * Run the gate over the real tree.
 *
 * @param {string} [projectRoot=process.cwd()] Repository root.
 * @returns {{invocations: number, errors: {kind: string, file: string, line: number, raw: string, message: string}[]}} Report.
 */
function validate(projectRoot = process.cwd()) {
  const errors = [];
  let invocations = 0;

  const surfacePath = path.join(projectRoot, COMPONENT_SURFACE);
  const surface = parseComponentSurface(fs.readFileSync(surfacePath, 'utf8'));

  if (surface.length === 0) {
    errors.push({
      kind: 'docs-references/unreadable-surface',
      file: COMPONENT_SURFACE,
      line: 1,
      raw: 'getComponents',
      message: `no authored components parsed from the MDX component map; the gate cannot verify <Component> references and refuses to pass silently`,
    });

    return { invocations, errors };
  }

  for (const file of collectPages(path.join(projectRoot, 'content', 'docs'), projectRoot)) {
    const lines = splitLines(fs.readFileSync(path.join(projectRoot, file), 'utf8'));
    const frontmatter = parseFrontmatterBlock(lines);
    const bodyStartLine = frontmatter ? frontmatter.bodyStartLine : 0;
    const bodyLines = stripCode(lines.slice(bodyStartLine).join('\n'));

    invocations += 1;

    if (!frontmatter) {
      errors.push({
        kind: 'docs-references/missing-frontmatter',
        file,
        line: 1,
        raw: '---',
        message: 'page has no frontmatter block at all',
      });
      continue;
    }

    for (const error of validateFrontmatter(frontmatter.keys)) {
      errors.push({ file, ...error });
    }

    for (const error of validateComponents(extractComponentRefs(bodyLines), surface)) {
      errors.push({ file, ...error });
    }

    const imageRefs = extractImageRefs(bodyLines);
    for (const error of validateImageRefs(imageRefs)) {
      errors.push({ file, ...error });
    }

    for (const ref of imageRefs.filter((imageRef) => imageRef.src.startsWith('/'))) {
      if (!fs.existsSync(path.join(projectRoot, 'public', ref.src.slice(1)))) {
        errors.push({
          kind: 'docs-references/missing-image',
          file,
          line: ref.line + bodyStartLine,
          raw: ref.src,
          message: `image "${ref.src}" is referenced but public${ref.src} does not exist`,
        });
      }
    }

    const ogImage = frontmatter.keys.find((key) => key.name === 'ogImage');
    if (ogImage && ogImage.value.startsWith('/')) {
      const assetPath = ogImage.value.replace(/^["']|["']$/g, '');
      if (!fs.existsSync(path.join(projectRoot, 'public', assetPath.slice(1)))) {
        errors.push({
          kind: 'docs-references/missing-image',
          file,
          line: ogImage.line,
          raw: assetPath,
          message: `frontmatter ogImage "${assetPath}" is referenced but public${assetPath} does not exist`,
        });
      }
    }
  }

  return { invocations, errors };
}

module.exports = { collectPages, validate };
