'use client';

/**
 * Monaco wired for Sindlish (T9 / issue #56).
 *
 * This module is the ONLY place the workbench imports Monaco, and it is
 * loaded through a dynamic import, so docs pages never pay for the editor.
 *
 * - Colouring: the ONE generated TextMate grammar artifact
 *   (`lib/grammars/sindlish.tmLanguage.json`, kept honest by
 *   `npm run check:grammar`) bridged into Monaco by `@shikijs/monaco`. There
 *   is no hand-written tokenizer anywhere.
 * - Semantics: diagnostics, completions, hover and definition all come from
 *   the real interpreter through the single seam
 *   (`lib/sindlish-interpreter`), mirroring the canonical pygls language
 *   server — see the language-service section there for the finding.
 * - Glosses: keyword suggestions and keyword hovers read the ONE gloss asset
 *   (`lib/grammars/sindlish-keywords`), never a hard-coded list.
 */

import { shikiToMonaco } from '@shikijs/monaco';
import * as monaco from 'monaco-editor/editor/editor.api';
import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import vitesseDark from 'shiki/themes/vitesse-dark';
import vitesseLight from 'shiki/themes/vitesse-light';

import { getSindlishKeyword } from '../grammars/sindlish-keywords';
import generatedSindlishGrammar from '../grammars/sindlish.tmLanguage.json';
import {
  sindlishAnalyze,
  sindlishCompletions,
  sindlishDefinition,
  sindlishHover,
} from '../sindlish-interpreter';

import { buildSindlishCompletionItems } from './sindlish-completions';

const LANGUAGE_ID = 'sindlish';
const MARKERS_OWNER = 'sindlish';
const DIAGNOSTICS_DEBOUNCE_MS = 300;
const DARK_QUERY = '(prefers-color-scheme: dark)';

// The base editor worker (word suggestions, links, diff). Bundled by Next from
// the monaco-editor package; never fetched from a CDN.
if (typeof self !== 'undefined' && !self.MonacoEnvironment) {
  self.MonacoEnvironment = {
    getWorker: () =>
      new Worker(new URL('monaco-editor/editor/editor.worker', import.meta.url)),
  };
}

let prepared = null;

const applyTheme = () => {
  monaco.editor.setTheme(window.matchMedia(DARK_QUERY).matches ? 'vitesse-dark' : 'vitesse-light');
};

const toMarker = (diagnostic) => ({
  startLineNumber: diagnostic.range.start.line + 1,
  startColumn: diagnostic.range.start.character + 1,
  endLineNumber: diagnostic.range.end.line + 1,
  endColumn: diagnostic.range.end.character + 1,
  message: diagnostic.message,
  severity: monaco.MarkerSeverity.Error,
  source: diagnostic.source || 'Sindlish',
});

const attachDiagnostics = (editor) => {
  let alive = true;
  let generation = 0;
  let timer = null;

  const refresh = async () => {
    const model = editor.getModel();
    if (!model || model.getLanguageId() !== LANGUAGE_ID) return;
    const mine = ++generation;
    try {
      const result = await sindlishAnalyze(model.getValue());
      // A stale response must never overwrite newer markers.
      if (!alive || mine !== generation) return;
      monaco.editor.setModelMarkers(
        model,
        MARKERS_OWNER,
        (result?.diagnostics || []).map(toMarker)
      );
    } catch {
      // The language service is best-effort; editing must survive its failure.
    }
  };

  const listener = editor.onDidChangeModelContent(() => {
    clearTimeout(timer);
    timer = setTimeout(refresh, DIAGNOSTICS_DEBOUNCE_MS);
  });

  refresh();

  return () => {
    alive = false;
    clearTimeout(timer);
    listener.dispose();
  };
};

const registerLanguageFeatures = () => {
  monaco.languages.registerCompletionItemProvider(LANGUAGE_ID, {
    triggerCharacters: ['.'],
    async provideCompletionItems(model, position) {
      const result = await sindlishCompletions(model.getValue(), position);
      const suggestions = buildSindlishCompletionItems(result?.items || []).map((item) => ({
        label: item.label,
        kind:
          monaco.languages.CompletionItemKind[item.kind] ??
          monaco.languages.CompletionItemKind.Text,
        detail: item.detail,
        documentation: item.documentation ? { value: item.documentation } : undefined,
        sortText: item.sortText,
      }));
      return { suggestions };
    },
  });

  monaco.languages.registerHoverProvider(LANGUAGE_ID, {
    async provideHover(model, position) {
      const contents = [];
      let range;

      // The server hovers symbols (name, kind, type)...
      const symbol = await sindlishHover(model.getValue(), position);
      if (symbol?.content) contents.push({ value: symbol.content });

      // ...and keywords hover with their English gloss from the gloss asset.
      const word = model.getWordAtPosition(position);
      if (word) {
        const entry = getSindlishKeyword(word.word);
        if (entry) {
          contents.push({ value: `**${entry.keyword}** — ${entry.gloss}\n\n${entry.note}` });
          range = new monaco.Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn
          );
        }
      }

      if (!contents.length) return null;
      return { contents, range };
    },
  });

  monaco.languages.registerDefinitionProvider(LANGUAGE_ID, {
    async provideDefinition(model, position) {
      const definition = await sindlishDefinition(model.getValue(), position);
      if (!definition) return null;
      return {
        uri: model.uri,
        range: new monaco.Range(
          definition.line + 1,
          definition.character + 1,
          definition.line + 1,
          definition.character + 1 + definition.length
        ),
      };
    },
  });
};

const prepare = () => {
  if (prepared) return prepared;

  prepared = (async () => {
    monaco.languages.register({
      id: LANGUAGE_ID,
      aliases: ['sd', 'Sindlish'],
      extensions: ['.sd'],
    });

    // Comment toggling and brace matching are part of registering a language;
    // everything semantic stays with the interpreter.
    monaco.languages.setLanguageConfiguration(LANGUAGE_ID, {
      comments: { lineComment: '#', blockComment: ['/*', '*/'] },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"', notIn: ['string', 'comment'] },
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
      ],
    });

    // The shiki highlighter runs on the JavaScript regex engine: the grammar
    // artifact uses no oniguruma-only constructs, and this keeps the editor
    // free of a wasm download at runtime.
    const highlighter = await createHighlighterCore({
      themes: [vitesseDark, vitesseLight],
      // Same id normalisation as lib/shiki.js: the artifact must stay
      // byte-for-byte generator output, so the aliases live here.
      langs: [{ ...generatedSindlishGrammar, name: LANGUAGE_ID, aliases: ['sd'] }],
      engine: createJavaScriptRegexEngine({ forgiving: true }),
    });
    shikiToMonaco(highlighter, monaco);

    registerLanguageFeatures();

    return highlighter;
  })();

  return prepared;
};

/**
 * Mount a Sindlish editor into `container`. Resolves `{ editor, dispose }`;
 * disposal releases the content listener, the diagnostics loop and the
 * colour-scheme listener.
 */
export const createSindlishEditor = async (container, { value = '', onChange } = {}) => {
  await prepare();

  const colorScheme = window.matchMedia(DARK_QUERY);
  applyTheme();
  const schemeListener = () => applyTheme();
  colorScheme.addEventListener('change', schemeListener);

  const editor = monaco.editor.create(container, {
    value,
    language: LANGUAGE_ID,
    theme: colorScheme.matches ? 'vitesse-dark' : 'vitesse-light',
    ariaLabel: 'Sindlish code',
    automaticLayout: true,
    fontFamily: getComputedStyle(container).getPropertyValue('--font-mono').trim() || 'monospace',
    fontSize: 14,
    lineHeight: 24,
    tabSize: 2,
    minimap: { enabled: false },
    wordWrap: 'off',
    scrollBeyondLastLine: false,
    padding: { top: 12, bottom: 12 },
    renderWhitespace: 'none',
    overviewRulerLanes: 0,
    // The suggest and hover widgets must not be clipped by the pane's
    // overflow; they attach to the body instead.
    fixedOverflowWidgets: true,
  });

  const changeListener = editor.onDidChangeModelContent(() => {
    onChange?.(editor.getValue());
  });
  const detachDiagnostics = attachDiagnostics(editor);

  return {
    editor,
    dispose() {
      changeListener.dispose();
      detachDiagnostics();
      colorScheme.removeEventListener('change', schemeListener);
      editor.dispose();
    },
  };
};

export default createSindlishEditor;
