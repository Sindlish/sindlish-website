/**
 * Map language-server completion items to Monaco suggestions (T9 / issue #56).
 *
 * The server owns the vocabulary — keywords, built-ins, local symbols and the
 * native methods after a dot (see the language-service section of
 * `lib/sindlish-interpreter`). This module owns only presentation: each
 * keyword suggestion is paired with its English gloss from the ONE gloss
 * asset (`lib/grammars/sindlish-keywords`), which is the website content
 * asset the spec keeps separate from the language repo.
 *
 * Pure on purpose: no Monaco import, so it is unit-testable, and the kind
 * names are Monaco's `CompletionItemKind` member names, resolved by the
 * provider at the boundary.
 */

import { SINDLISH_KEYWORDS, SINDLISH_KEYWORD_GLOSSES } from '../grammars/sindlish-keywords';

const KEYWORD_NOTES = new Map(SINDLISH_KEYWORDS.map(({ keyword, note }) => [keyword, note]));

/**
 * @param {{ label: string, kind: string, detail?: string }[]} serverItems
 *   Items as the language server returns them.
 * @returns {{ label: string, kind: string, detail?: string,
 *   documentation?: string, sortText: string }[]} Monaco-ready suggestions
 *   (kind resolved by name at the provider boundary).
 */
export function buildSindlishCompletionItems(serverItems = []) {
  return serverItems.map((item, index) => {
    const gloss = item.kind === 'Keyword' ? SINDLISH_KEYWORD_GLOSSES[item.label] : undefined;
    const note = gloss ? KEYWORD_NOTES.get(item.label) : undefined;
    return {
      label: item.label,
      kind: item.kind,
      detail: gloss ? `${gloss}${item.detail ? ` — ${item.detail}` : ''}` : item.detail,
      documentation: note,
      // Server order is meaningful (keywords first); keep it through Monaco.
      sortText: String(index).padStart(4, '0'),
    };
  });
}

export default buildSindlishCompletionItems;
