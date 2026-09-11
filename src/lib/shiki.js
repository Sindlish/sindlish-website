/* eslint-disable import/namespace */
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from '@shikijs/transformers';
import { getHighlighter, createCssVariablesTheme, bundledLanguages } from 'shiki';
const customTheme = createCssVariablesTheme({
  name: 'css-variables',
  variablePrefix: '--shiki-',
  variableDefaults: {},
  fontStyle: true,
});
let highlighter;

const sindlishGrammar = {
  name: 'sindlish',
  scopeName: 'source.sindlish',
  aliases: ['sd'],
  patterns: [
    { include: '#comments' },
    { include: '#strings' },
    { include: '#numbers' },
    { include: '#keywords' },
    { include: '#types' },
    { include: '#builtins' },
    { include: '#function-defs' },
    { include: '#function-calls' },
    { include: '#operators' },
    { include: '#punctuation' },
    { include: '#variables' },
  ],
  repository: {
    comments: {
      patterns: [
        { begin: '/\\*', end: '\\*/', name: 'comment.block.sindlish' },
        { match: '#.*$', name: 'comment.line.number-sign.sindlish' },
      ],
    },
    strings: {
      patterns: [
        { begin: '"""', end: '"""', name: 'string.quoted.triple.sindlish' },
        {
          begin: '"',
          end: '"',
          name: 'string.quoted.double.sindlish',
          patterns: [{ match: '\\\\.', name: 'constant.character.escape.sindlish' }],
        },
        {
          begin: "'",
          end: "'",
          name: 'string.quoted.single.sindlish',
          patterns: [{ match: '\\\\.', name: 'constant.character.escape.sindlish' }],
        },
      ],
    },
    numbers: {
      match: '\\b[0-9]+(?:\\.[0-9]+)?\\b|\\B\\.[0-9]+\\b',
      name: 'constant.numeric.sindlish',
    },
    types: {
      match: '\\b(?:adad|lafz|dahai|faislo|khali|fehrist|lughat|majmuo)\\b',
      name: 'support.type.sindlish',
    },
    keywords: {
      patterns: [
        {
          match:
            '\\b(?:agar|yawari|warna|jistain|har|mein|tor|jari|kaam|wapas|pakko|bahari|aalmi|match)\\b',
          name: 'keyword.control.sindlish',
        },
        { match: '\\b(?:sach|koorh|khali|ok)\\b', name: 'constant.language.sindlish' },
        { match: '\\b(?:ghalti|kharabi)\\b', name: 'keyword.other.sindlish' },
        { match: '\\b(?:aen|ya|nah)\\b', name: 'keyword.operator.logical.sindlish' },
      ],
    },
    operators: {
      match: '(\\+|\\-|\\*|\\/|%|==|!=|<=|>=|<|>|=)',
      name: 'keyword.operator.sindlish',
    },
    punctuation: {
      match: '(\\(|\\)|\\{|\\}|\\[|\\]|,|:|\\.)',
      name: 'punctuation.separator.sindlish',
    },
    builtins: {
      patterns: [
        { match: '\\b(?:majmuo|lambi|likh|puch|range)\\b', name: 'support.function.sindlish' },
        {
          match:
            '\\.\\s*(?:addkar|alaghahe|bade|cabeyon|chad|defaultrakh|farq|garn|hasil|hata|index|kadh|milap|nakal|nandohisoahe|raqamon|saf|symmetric_farq|syon|syonkadh|tarteeb|ulto|update|wadha|wadhayo|wadohisoahe|wajh|bachao|lazmi)\\b',
          name: 'entity.name.function.sindlish',
        },
      ],
    },
    'function-defs': {
      match: '\\b(kaam)\\s+([a-zA-Z_][a-zA-Z0-9_]*)\\b',
      captures: {
        1: { name: 'keyword.control.sindlish' },
        2: { name: 'entity.name.function.sindlish' },
      },
    },
    'function-calls': {
      match: '\\b([a-zA-Z_][a-zA-Z0-9_]*)\\s*(?=\\()',
      name: 'entity.name.function.sindlish',
    },
    variables: {
      patterns: [
        { match: '\\b([a-zA-Z_][a-zA-Z0-9_]*)\\s*(?==)', name: 'variable.other.sindlish' },
      ],
    },
  },
};
export default async function highlight(code, lang = 'bash', meta = '', theme = customTheme) {
  let language = lang.toLocaleLowerCase();
  if (language === 'sd' || language === 'sindlish') language = 'sindlish';
  // check if language is supported
  if (
    !Object.keys(bundledLanguages).includes(language) &&
    language !== 'text' &&
    language !== 'sindlish'
  ) {
    language = 'bash';
  }
  if (!highlighter) {
    highlighter = await getHighlighter({
      langs: [language === 'sindlish' ? sindlishGrammar : language],
      themes: [theme],
    });
  } else {
    if (language === 'sindlish') {
      await highlighter.loadLanguage(sindlishGrammar);
    } else {
      await highlighter.loadLanguage(language);
    }
  }
  const html = highlighter.codeToHtml(code, {
    lang: language,
    theme: 'css-variables',
    transformers: [
      {
        pre(node) {
          node.properties['data-language'] = language;
        },
        code(node) {
          node.properties.class = 'grid';
        },
        line(node, line) {
          node.properties['data-line'] = line;
          if (meta) {
            const parseHighlightLines = (meta) => {
              const metaArray = meta.split(' ').filter(Boolean);
              let highlightLines = [];
              const highlightToken = metaArray.find(
                (token) => token.includes('{') && token.includes('}')
              );
              if (highlightToken) {
                const highlightStringArray = highlightToken.split('{')[1].split('}')[0].split(',');
                highlightLines = highlightStringArray.reduce((result, item) => {
                  if (item.includes('-')) {
                    const range = item.split('-');
                    const start = parseInt(range[0], 10);
                    const end = parseInt(range[1], 10);
                    for (let i = start; i <= end; i++) result.push(i);
                  } else {
                    result.push(parseInt(item, 10));
                  }
                  return result;
                }, []);
              }
              return highlightLines;
            };
            const highlightedLines = parseHighlightLines(meta);
            highlightedLines.forEach((item) => {
              if (item === line) {
                node.properties['data-highlighted-line'] = true;
              }
            });
          }
        },
      },
      transformerNotationDiff(),
      transformerNotationHighlight(),
      transformerNotationWordHighlight(),
    ],
  });
  return html;
}

export const getHighlightedCodeArray = async (items) => {
  let highlightedItems = [];
  try {
    highlightedItems = await Promise.all(
      items.map(async (item) => {
        let codeContent = item?.code;
        if (typeof codeContent === 'object') {
          codeContent = JSON.stringify(codeContent, null, 2);
        }
        // item.highlight in blog post component CodeTabs
        const highlightedCode = await highlight(codeContent, item.language, `{${item.highlight}}`);
        return highlightedCode;
      })
    );
  } catch (error) {
    console.error('Error highlighting code:', error);
  }
  return highlightedItems;
};
