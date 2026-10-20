/**
 * The fence vocabulary.
 *
 * The entire authoring API for docs code blocks is four fence info strings:
 *
 *   ```sd                     runnable Sindlish example (carries Run)
 *   ```sd illustrative        illustrative shape (never runnable, dashed border)
 *   ```txt filename="Output"  expected output (always visible; Run verifies)
 *   ```bash                   shell
 *
 * Anything else parses as `plain` so a stray language never crashes rendering,
 * but the docs corpus (and the docs-checks gates) hold the corpus to the four.
 *
 * Pure module: no React, no DOM. See fences.test.js.
 */

export const FENCE_KIND = {
  RUNNABLE: 'runnable',
  ILLUSTRATIVE: 'illustrative',
  OUTPUT: 'output',
  SHELL: 'shell',
  PLAIN: 'plain',
};

const OUTPUT_LABEL = 'Expected output';

const parseAttribute = (meta, name) => {
  if (!meta) return null;
  const match = meta.match(new RegExp(`\\b${name}=(?:"([^"]+)"|'([^']+)'|(\\S+))`, 'i'));
  return match ? match[1] || match[2] || match[3] : null;
};

const hasToken = (meta, token) => {
  if (!meta) return false;
  return meta
    .split(/\s+/)
    .filter(Boolean)
    .some((part) => part === token || part.startsWith(`${token}=`));
};

/**
 * Parse a fence's language + meta into a render decision.
 *
 * @param {string} language - language from the code element's `language-*` class
 * @param {string} [meta] - the fence info string after the language
 * @returns {{
 *   kind: 'runnable'|'illustrative'|'output'|'shell'|'plain',
 *   language: string,
 *   filename: string|null,
 *   illustrative: boolean,
 *   runnable: boolean,
 *   isOutput: boolean,
 *   label: string|null,
 *   accessibleName: string|null
 * }}
 */
export function parseFence(language, meta = '') {
  const lang = (language || '').toLowerCase();
  const filename = parseAttribute(meta, 'filename');

  const base = {
    language: lang || 'text',
    filename,
    illustrative: false,
    runnable: false,
    isOutput: false,
    label: null,
    accessibleName: null,
  };

  if (lang === 'sd') {
    const illustrative = hasToken(meta, 'illustrative');
    return {
      ...base,
      kind: illustrative ? FENCE_KIND.ILLUSTRATIVE : FENCE_KIND.RUNNABLE,
      illustrative,
      runnable: !illustrative,
      // Accessible name exists only when an authored filename exists.
      accessibleName: filename,
    };
  }

  if (lang === 'txt') {
    const label =
      !filename || filename.toLowerCase() === 'output'
        ? OUTPUT_LABEL
        : `${OUTPUT_LABEL}: ${filename}`;
    return {
      ...base,
      kind: FENCE_KIND.OUTPUT,
      isOutput: true,
      label,
      accessibleName: label,
    };
  }

  if (lang === 'bash') {
    return {
      ...base,
      kind: FENCE_KIND.SHELL,
      accessibleName: filename,
    };
  }

  return {
    ...base,
    kind: FENCE_KIND.PLAIN,
    accessibleName: filename,
  };
}

export default parseFence;
