/**
 * Pure reference logic for Gate 3, docs object to nothing absent (issue #52).
 *
 * The gate answers one question per docs page: does everything the page
 * references exist? That splits into four checks, all here as pure functions
 * over strings so they unit-test without touching the tree; `validate.js`
 * resolves the "exists" half against the filesystem.
 */

/**
 * Frontmatter fields a page may declare: the set documented in
 * `content/docs/README.md` plus `noindex`, which `api-docs.js` reads.
 */
const ALLOWED_FRONTMATTER_FIELDS = [
  'enableTableOfContents',
  'isDraft',
  'noindex',
  'ogImage',
  'redirectFrom',
  'summary',
  'tag',
  'title',
];

/** Pages without these render with no title or no meta description. */
const REQUIRED_FRONTMATTER_FIELDS = ['summary', 'title'];

/**
 * Parse the leading frontmatter block.
 *
 * @param {string[]} lines File lines.
 * @returns {{keys: {name: string, value: string, line: number}[], bodyStartLine: number}|null} Parsed block, or null when the file has none.
 */
function parseFrontmatterBlock(lines) {
  if (lines[0] !== '---') return null;

  let closingIndex = -1;
  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index] === '---' || lines[index] === '...') {
      closingIndex = index;
      break;
    }
  }

  if (closingIndex === -1) return null;

  const keys = [];
  for (let index = 1; index < closingIndex; index += 1) {
    const match = lines[index].match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (match) {
      keys.push({ name: match[1], value: match[2].trim(), line: index + 1 });
    }
  }

  return { keys, bodyStartLine: closingIndex + 1 };
}

/**
 * Image references in a markdown body.
 *
 * Remote and `data:` sources are skipped: whether `https://...` still serves
 * an image is a network question, and Gate 2's linkinator crawl owns those.
 *
 * @param {string[]} lines Markdown body lines (code already stripped).
 * @returns {{src: string, line: number}[]} References with their 1-based lines.
 */
function extractImageRefs(lines) {
  const refs = [];
  const MARKDOWN_IMAGE = /!\[[^\]]*\]\(\s*(<[^>]*>|[^)\s]+)/g;
  const HTML_SRC = /\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)')/g;

  lines.forEach((line, index) => {
    let match;

    MARKDOWN_IMAGE.lastIndex = 0;
    while ((match = MARKDOWN_IMAGE.exec(line)) !== null) {
      refs.push({ src: match[1].replace(/^<|>$/g, ''), line: index + 1 });
    }

    HTML_SRC.lastIndex = 0;
    while ((match = HTML_SRC.exec(line)) !== null) {
      refs.push({ src: match[1] ?? match[2], line: index + 1 });
    }
  });

  return refs.filter((ref) => !/^(?:https?:|data:|\/\/)/i.test(ref.src));
}

/**
 * MDX component references in a markdown body: uppercase JSX tags.
 *
 * @param {string[]} lines Markdown body lines (code already stripped).
 * @returns {{name: string, line: number}[]} References with their 1-based lines.
 */
function extractComponentRefs(lines) {
  const refs = [];
  const COMPONENT = /<([A-Z][A-Za-z0-9]*)[\s/>]/g;

  lines.forEach((line, index) => {
    let match;

    COMPONENT.lastIndex = 0;
    while ((match = COMPONENT.exec(line)) !== null) {
      refs.push({ name: match[1], line: index + 1 });
    }
  });

  return refs;
}

/**
 * The authored component surface, parsed from the MDX component map in
 * `src/components/shared/content/content.jsx`. Deriving it from the map — the
 * single source of truth — means adding a component to the surface needs no
 * gate change, and removing one starts failing the moment a page uses it.
 *
 * @param {string} source File contents of content.jsx.
 * @returns {string[]} Capitalised component names the map renders.
 */
function parseComponentSurface(source) {
  const start = source.indexOf('getComponents');
  if (start === -1) return [];

  const end = source.indexOf('\n});', start);
  if (end === -1) return [];

  const body = source.slice(start, end);
  const names = [];

  for (const match of body.matchAll(/^\s*([A-Z][A-Za-z0-9]*)\s*,?\s*$/gm)) {
    if (!names.includes(match[1])) {
      names.push(match[1]);
    }
  }

  return names;
}

/**
 * Validate one page's frontmatter keys.
 *
 * @param {{name: string, line: number}[]} keys Parsed frontmatter keys.
 * @returns {{kind: string, line: number, raw: string, message: string}[]} Errors.
 */
function validateFrontmatter(keys) {
  const errors = [];
  const names = keys.map((key) => key.name);

  for (const field of REQUIRED_FRONTMATTER_FIELDS) {
    if (!names.includes(field)) {
      errors.push({
        kind: 'docs-references/missing-frontmatter',
        line: 1,
        raw: field,
        message: `frontmatter is missing the required "${field}" field`,
      });
    }
  }

  for (const key of keys) {
    if (!ALLOWED_FRONTMATTER_FIELDS.includes(key.name)) {
      errors.push({
        kind: 'docs-references/unknown-frontmatter',
        line: key.line,
        raw: key.name,
        message: `frontmatter field "${key.name}" is not one of the fields the site renders (${ALLOWED_FRONTMATTER_FIELDS.join(', ')})`,
      });
    }
  }

  return errors;
}

/**
 * Validate one page's component references against the MDX surface.
 *
 * @param {{name: string, line: number}[]} refs Parsed component references.
 * @param {string[]} allowed Surface names from the MDX component map.
 * @returns {{kind: string, line: number, raw: string, message: string}[]} Errors.
 */
function validateComponents(refs, allowed) {
  return refs
    .filter((ref) => !allowed.includes(ref.name))
    .map((ref) => ({
      kind: 'docs-references/unknown-component',
      line: ref.line,
      raw: ref.name,
      message: `<${ref.name}> is not in the MDX component surface (${allowed.join(', ')}); see content.jsx and content/docs/README.md`,
    }));
}

/**
 * Validate one page's image references for paths that cannot be served.
 *
 * Existence of `/`-rooted paths is checked in `validate.js` against `public/`;
 * here only the shape is validated.
 *
 * @param {{src: string, line: number}[]} refs Parsed image references.
 * @returns {{kind: string, line: number, raw: string, message: string}[]} Errors.
 */
function validateImageRefs(refs) {
  return refs
    .filter((ref) => !ref.src.startsWith('/'))
    .map((ref) => ({
      kind: 'docs-references/relative-image',
      line: ref.line,
      raw: ref.src,
      message: `image "${ref.src}" is not a /-rooted path, so nothing serves it; put the file under public/ and link it as "/..."`,
    }));
}

module.exports = {
  ALLOWED_FRONTMATTER_FIELDS,
  REQUIRED_FRONTMATTER_FIELDS,
  extractComponentRefs,
  extractImageRefs,
  parseComponentSurface,
  parseFrontmatterBlock,
  validateComponents,
  validateFrontmatter,
  validateImageRefs,
};
