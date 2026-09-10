'use client';
import { autocompletion, completeFromList } from '@codemirror/autocomplete';
import { StreamLanguage } from '@codemirror/language';
import { githubDark } from '@uiw/codemirror-theme-github';
import CodeMirror from '@uiw/react-codemirror';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

import Container from 'components/shared/container';
import Layout from 'components/shared/layout';
import { runSindlish, initSindlish } from 'lib/sindlish-interpreter';
const DEFAULT_CODE = `# Sindlish Playground
# Welcome to the first Sindhi programming language!
kaam Salam(naalo) {
  likh("Salam, " + naalo + "!")
}
# Variable declarations
lafz name = "Amanat"
adad version = 1
# Multi-line string
lafz intro = """Sindlish is a powerful language.
It is designed for the Sindhi community.
V0.1.1 is here!"""
Salam(name)
agar version == 1 {
  likh(intro)
} warna {
  likh("Unknown version")
}
`;
const SINDLISH_KEYWORDS = [
  { label: 'agar', type: 'keyword', info: 'If condition' },
  { label: 'yawari', type: 'keyword', info: 'Else if condition' },
  { label: 'warna', type: 'keyword', info: 'Else condition' },
  { label: 'jistain', type: 'keyword', info: 'While loop' },
  { label: 'har', type: 'keyword', info: 'For loop' },
  { label: 'mein', type: 'keyword', info: 'In keyword for loops' },
  { label: 'tor', type: 'keyword', info: 'Break statement' },
  { label: 'jari', type: 'keyword', info: 'Continue statement' },
  { label: 'kaam', type: 'keyword', info: 'Function definition' },
  { label: 'wapas', type: 'keyword', info: 'Return statement' },
  { label: 'aen', type: 'keyword', info: 'Logical AND' },
  { label: 'ya', type: 'keyword', info: 'Logical OR' },
  { label: 'nah', type: 'keyword', info: 'Logical NOT' },
  { label: 'sach', type: 'constant', info: 'True boolean' },
  { label: 'koorh', type: 'constant', info: 'False boolean' },
  { label: 'pakko', type: 'constant', info: 'Constant declaration' },
  { label: 'khali', type: 'constant', info: 'Null value' },
  { label: 'adad', type: 'type', info: 'Integer type' },
  { label: 'dahai', type: 'type', info: 'Float type' },
  { label: 'lafz', type: 'type', info: 'String type' },
  { label: 'faislo', type: 'type', info: 'Boolean type' },
  { label: 'fehrist', type: 'type', info: 'List type' },
  { label: 'lughat', type: 'type', info: 'Dictionary type' },
  { label: 'majmuo', type: 'type', info: 'Set type' },
  { label: 'likh', type: 'function', info: 'Print output' },
  { label: 'lambi', type: 'function', info: 'Length of collection' },
  { label: 'puch', type: 'function', info: 'Get user input' },
  { label: 'majmuo', type: 'function', info: 'Set creation' },
];
const sindlishHighlight = StreamLanguage.define({
  startState: () => ({ inBlockComment: false, inTripleString: false }),
  token: (stream, state) => {
    if (state.inBlockComment) {
      while (!stream.eol()) {
        if (stream.match('*/')) {
          state.inBlockComment = false;
          break;
        }
        stream.next();
      }
      return 'comment';
    }
    if (state.inTripleString) {
      while (!stream.eol()) {
        if (stream.match('"""')) {
          state.inTripleString = false;
          break;
        }
        stream.next();
      }
      return 'string';
    }
    if (stream.eatSpace()) return null;
    if (stream.match('#')) {
      stream.skipToEnd();
      return 'comment';
    }
    if (stream.match('/*')) {
      state.inBlockComment = true;
      return 'comment';
    }
    if (stream.match('"""')) {
      state.inTripleString = true;
      return 'string';
    }
    if (stream.match('"') || stream.match("'")) {
      const quote = stream.current();
      while (!stream.eol()) {
        if (stream.next() === quote && stream.current().slice(-2, -1) !== '\\') break;
      }
      return 'string';
    }
    if (stream.match(/^-?\d+(\.\d+)?/)) return 'number';
    if (
      stream.match(
        /^\b(agar|yawari|warna|jistain|har|mein|tor|jari|kaam|wapas|pakko|adad|lafz|dahai|faislo|khali|fehrist|lughat|majmuo|sach|koorh|likh|puch|lambi|aen|ya|nah)\b/
      )
    ) {
      return 'keyword';
    }
    if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) return 'variableName';
    stream.next();
    return null;
  },
});
const PlaygroundPage = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('idle');
  const [loadProgress, setLoadProgress] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    setCode(codeParam ? decodeURIComponent(codeParam) : DEFAULT_CODE);

    // Pre-initialize interpreter
    initSindlish((p) => setLoadProgress(p))
      .then(() => setStatus('ready'))
      .catch(() => setStatus('idle'));
  }, []);
  const handleRun = async () => {
    setStatus('running');
    setResult('');
    try {
      const output = await runSindlish(code, (p) => setLoadProgress(p));
      setResult(output);
      setStatus('ready');
      setLoadProgress('');
    } catch (err) {
      setResult(`Error: ${err.message}`);
      setStatus('ready');
      setLoadProgress('');
    }
  };
  const extensions = useMemo(
    () => [
      sindlishHighlight,
      autocompletion({
        override: [completeFromList(SINDLISH_KEYWORDS)],
      }),
    ],
    []
  );
  return (
    <Layout isHeaderSticky isHeaderStickyOverlay theme="black">
      <LazyMotion features={domAnimation}>
        <section className="relative min-h-screen bg-black-pure safe-paddings text-white">
          <Container className="relative z-10 pt-40 pb-16 xl:pt-32 lg:pt-28 md:pt-24" size="1600">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-end justify-between md:flex-col md:items-start md:gap-4">
                <div>
                  <span className="text-sm font-medium tracking-wider text-[#E02424] uppercase">
                    Playground
                  </span>
                  <h1 className="mt-3 text-[52px] leading-tight font-bold tracking-tighter xl:text-4xl lg:text-[32px] sm:text-[28px]">
                    Try Sindlish
                  </h1>
                </div>
                <button
                  id="run-button"
                  className="flex items-center gap-2 rounded-none border border-gray-new-20 bg-[#E02424] px-6 py-3 text-sm font-bold tracking-widest text-white uppercase transition-all hover:bg-[#c01e1e] active:scale-95 disabled:opacity-50"
                  onClick={handleRun}
                  disabled={status === 'running' || status === 'loading'}
                >
                  {status === 'loading' || status === 'running' ? (
                    <>
                      <span className="size-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {status === 'loading' ? 'Loading...' : 'Running...'}
                    </>
                  ) : (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      Run
                    </>
                  )}
                </button>
              </div>
            </m.div>
            {loadProgress && (
              <m.div
                className="mt-6 flex items-center gap-3 rounded-none border border-gray-new-20 bg-[#0A0A0B] px-5 py-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="size-2 animate-pulse rounded-none bg-[#E02424]" />
                <span className="font-mono text-sm text-gray-new-50">{loadProgress}</span>
              </m.div>
            )}
            <m.div
              className="mt-6 grid h-[600px] grid-cols-2 gap-0 lg:h-auto lg:grid-cols-1"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {/* Editor */}
              <div className="flex flex-col rounded-none border border-gray-new-20 bg-[#0A0A0B]">
                <div className="flex shrink-0 items-center justify-between border-b border-gray-new-20 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="size-3 rounded-none bg-[#E02424]/60" />
                      <span className="size-3 rounded-none bg-[#984A45]/60" />
                      <span className="size-3 rounded-none bg-[#1B3A5C]/60" />
                    </div>
                    <span className="font-mono text-xs tracking-widest text-gray-new-50 uppercase">
                      playground.sd
                    </span>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-gray-new-40 uppercase">
                    Editor
                  </span>
                </div>
                <div className="relative flex flex-1 overflow-hidden font-mono text-sm leading-relaxed text-gray-new-80">
                  <CodeMirror
                    value={code}
                    theme={githubDark}
                    extensions={extensions}
                    onChange={(val) => setCode(val)}
                    className="h-full w-full outline-none [&_.cm-activeLine]:bg-[#E02424]/5 [&_.cm-gutters]:border-r [&_.cm-gutters]:border-gray-new-20 [&_.cm-gutters]:bg-transparent [&_.cm-gutters]:text-gray-new-30 [&_.cm-scroller]:font-mono [&_.cm-scroller]:text-sm [&>.cm-editor]:h-full [&>.cm-editor]:bg-transparent"
                    basicSetup={{
                      lineNumbers: true,
                      highlightActiveLine: true,
                      foldGutter: false,
                    }}
                  />
                </div>
              </div>
              {/* Output */}
              <div className="flex flex-col rounded-none border border-l-0 border-gray-new-20 bg-[#060607] lg:min-h-[300px] lg:border-t-0 lg:border-l">
                <div className="flex shrink-0 items-center justify-between border-b border-gray-new-20 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-2 rounded-none ${status === 'ready' ? 'bg-green-500' : 'bg-gray-new-30'} ${status === 'running' ? 'animate-pulse bg-[#E02424]' : ''}`}
                    />
                    <span className="font-mono text-xs tracking-widest text-gray-new-50 uppercase">
                      Output
                    </span>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-gray-new-40 uppercase">
                    {status === 'idle'
                      ? 'Waiting'
                      : status === 'loading'
                        ? 'Loading'
                        : status === 'running'
                          ? 'Executing'
                          : 'Console'}
                  </span>
                </div>
                <div className="flex-1 overflow-auto p-6">
                  {result ? (
                    <pre
                      className="text-green-400 font-mono text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: result }}
                    />
                  ) : (
                    <p className="font-mono text-sm text-gray-new-30 italic">
                      {status === 'idle'
                        ? 'Click Run to execute your code...'
                        : status === 'loading'
                          ? 'Initializing the Sindlish interpreter...'
                          : 'Waiting for output...'}
                    </p>
                  )}
                </div>
              </div>
            </m.div>
            {/* Info bar */}
            <m.div
              className="mt-6 flex items-center gap-3 rounded-none border border-[#E02424]/20 bg-[#E02424]/5 px-5 py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-[10px] font-bold tracking-widest text-[#E02424] uppercase">
                Language Info
              </span>
              <span className="text-sm text-gray-new-50">
                Sindlish uses <code className="text-[#E02424]">#</code> for single-line comments and{' '}
                <code className="text-[#E02424]">{'/* */'}</code> for multi-line. Try it out!
              </span>
            </m.div>
          </Container>
        </section>
      </LazyMotion>
    </Layout>
  );
};
export default PlaygroundPage;
