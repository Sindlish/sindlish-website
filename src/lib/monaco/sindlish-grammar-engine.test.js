import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import vitesseDark from 'shiki/themes/vitesse-dark';
import { describe, expect, it } from 'vitest';

import sindlishGrammar from '../grammars/sindlish.tmLanguage.json';

/**
 * The editor colours Sindlish from the ONE generated TextMate grammar via
 * `@shikijs/monaco` (T9 / issue #56). This test pins the pair together: the
 * artifact must tokenize under the JavaScript regex engine the browser
 * highlighter uses (no wasm download at runtime), through the same shiki
 * core API `lib/monaco/sindlish-monaco` drives.
 */

const SCOPES_OF = (tokens, content) => {
  const token = tokens.flat().find((entry) => entry.content === content);
  return (
    token?.explanation?.flatMap((part) => part.scopes.map((scope) => scope.scopeName)) ?? []
  );
};

const setup = () =>
  createHighlighterCore({
    themes: [vitesseDark],
    // Same id normalisation as lib/shiki.js and lib/monaco/sindlish-monaco.js.
    langs: [{ ...sindlishGrammar, name: 'sindlish', aliases: ['sd'] }],
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  });

describe('sindlish.tmLanguage.json under the editor engine', () => {
  it('registers as sindlish', async () => {
    const highlighter = await setup();
    expect(highlighter.getLoadedLanguages()).toContain('sindlish');
    await highlighter.dispose();
  });

  it('scopes reserved words as keywords and calls as functions', async () => {
    const highlighter = await setup();
    const { tokens } = highlighter.codeToTokens('kaam Salam(naalo) {\n  wapas naalo\n}', {
      lang: 'sindlish',
      theme: 'vitesse-dark',
      includeExplanation: true,
    });

    expect(SCOPES_OF(tokens, 'kaam')).toContain('keyword.control.sindlish');
    expect(SCOPES_OF(tokens, 'wapas')).toContain('keyword.control.sindlish');
    expect(SCOPES_OF(tokens, 'Salam')).toContain('entity.name.function.sindlish');

    await highlighter.dispose();
  });

  it('scopes data types and strings distinctly', async () => {
    const highlighter = await setup();
    const { tokens } = highlighter.codeToTokens('lafz naam = "Salam"', {
      lang: 'sindlish',
      theme: 'vitesse-dark',
      includeExplanation: true,
    });

    expect(SCOPES_OF(tokens, 'lafz')).toContain('support.type.sindlish');
    expect(SCOPES_OF(tokens, '"Salam"')).toContain('string.quoted.double.sindlish');

    await highlighter.dispose();
  });
});
