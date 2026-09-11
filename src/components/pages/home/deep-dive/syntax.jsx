'use client';
import { m, LazyMotion, domAnimation, AnimatePresence, useScroll } from 'framer-motion';
import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';

import Container from 'components/shared/container';
import SectionLabel from 'components/shared/section-label';
import { runSindlish } from 'lib/sindlish-interpreter';
const Comment = ({ children }) => <span className="text-gray-new-50 italic">{children}</span>;
const Keyword = ({ children }) => <span className="font-bold text-[#E02424]">{children}</span>;
const String = ({ children }) => <span className="text-[#FFED9C]">{children}</span>;
const Number = ({ children }) => <span className="text-[#94B5F7]">{children}</span>;
const Punctuation = ({ children }) => <span className="text-white">{children}</span>;
const Function = ({ children }) => <span className="text-[#F7B983]">{children}</span>;
Comment.propTypes = { children: PropTypes.node.isRequired };
Keyword.propTypes = { children: PropTypes.node.isRequired };
String.propTypes = { children: PropTypes.node.isRequired };
Number.propTypes = { children: PropTypes.node.isRequired };
Punctuation.propTypes = { children: PropTypes.node.isRequired };
Function.propTypes = { children: PropTypes.node.isRequired };
const SYNTAX_CONTEXTS = [
  {
    title: 'Variables',
    description: 'Sindlish uses Roman Sindhi keywords like lafz for strings and adad for numbers.',
    code: `# Variables
lafz naalo = "Amanat"
adad umar = 25
likh(naalo + " is " + umar)`,
    content: (
      <pre className="font-mono text-lg leading-relaxed">
        <code>
          <Comment>{'# Variables'}</Comment>
          {'\n'}
          <Keyword>lafz</Keyword> naalo = <String>&quot;Amanat&quot;</String>
          {'\n'}
          <Keyword>adad</Keyword> umar = <Number>25</Number>
          {'\n'}
          <Function>likh</Function>
          <Punctuation>(</Punctuation>naalo + <String>&quot; is &quot;</String> + umar
          <Punctuation>)</Punctuation>
        </code>
      </pre>
    ),
  },
  {
    title: 'Functions',
    description: 'Functions are defined with the kaam keyword. Logic flows naturally.',
    code: `# Functions
kaam Salam(naalo) {
  likh("Bhale kare aya, " + naalo)
}
Salam("Sindlish")`,
    content: (
      <pre className="font-mono text-lg leading-relaxed">
        <code>
          <Comment>{'# Functions'}</Comment>
          {'\n'}
          <Keyword>kaam</Keyword> <Function>Salam</Function>
          <Punctuation>(</Punctuation>naalo<Punctuation>)</Punctuation> &#123;{'\n'}
          {'  '}
          <Keyword>likh</Keyword>
          <Punctuation>(</Punctuation>
          <String>&quot;Bhale kare aya, &quot;</String> + naalo<Punctuation>)</Punctuation>
          {'\n'}
          &#125;{'\n\n'}
          <Function>Salam</Function>
          <Punctuation>(</Punctuation>
          <String>&quot;Sindlish&quot;</String>
          <Punctuation>)</Punctuation>
        </code>
      </pre>
    ),
  },
  {
    title: 'Conditionals',
    description: 'Use agar and ya for logical branches. Romanized Sindhi maps perfectly to logic.',
    code: `# Conditionals
adad umar = 20
agar (umar > 18) {
  likh("Wado ahay")
} warna {
  likh("Nandho ahay")
}`,
    content: (
      <pre className="font-mono text-base leading-snug">
        <code>
          <Comment>{'# Conditionals'}</Comment>
          {'\n'}
          <Keyword>agar</Keyword> <Punctuation>(</Punctuation>umar {'>'} <Number>18</Number>
          <Punctuation>)</Punctuation> &#123;{'\n'}
          {'  '}
          <Keyword>likh</Keyword>
          <Punctuation>(</Punctuation>
          <String>&quot;Wado ahay&quot;</String>
          <Punctuation>)</Punctuation>
          {'\n'}
          &#125; <Keyword>warna</Keyword> &#123;{'\n'}
          {'  '}
          <Keyword>likh</Keyword>
          <Punctuation>(</Punctuation>
          <String>&quot;Nandho ahay&quot;</String>
          <Punctuation>)</Punctuation>
          {'\n'}
          &#125;
        </code>
      </pre>
    ),
  },
  {
    title: 'Hybrid Typing',
    description:
      'Enjoy a dynamic typing experience, or enforce complete strict typing using postfix annotations for maximum safety.',
    code: `# Dynamic Inference
naalo = "Sindlish"
# Postfix Type Annotation
count: adad = 100
# Typed Collections
fehrist[adad] nums = [1, 2, 3]
likh(naalo, count, nums)`,
    content: (
      <pre className="font-mono text-base leading-snug">
        <code>
          <Comment>{'# Dynamic Inference'}</Comment>
          {'\n'}
          naalo = <String>&quot;Sindlish&quot;</String>
          {'\n\n'}
          <Comment>{'# Postfix Type Annotation'}</Comment>
          {'\n'}
          count<Punctuation>:</Punctuation> <Keyword>adad</Keyword> = <Number>100</Number>
          {'\n\n'}
          <Comment>{'# Typed Collections'}</Comment>
          {'\n'}
          <Keyword>fehrist</Keyword>
          <Punctuation>[</Punctuation>
          <Keyword>adad</Keyword>
          <Punctuation>]</Punctuation> nums = <Punctuation>[</Punctuation>
          <Number>1</Number>, <Number>2</Number>, <Number>3</Number>
          <Punctuation>]</Punctuation>
        </code>
      </pre>
    ),
  },
  {
    title: 'Safe Results',
    description:
      'Inspired by Rust, our native Result system makes error handling predictable and prevents hidden crashes—designed to be easy for beginners.',
    code: `kaam vind(a, b) {
  agar b == 0 { wapas ghalti("zero") }
  wapas a / b
}
# Soft Fallback (?) avoids crashes
val = vind(5, 0)?
likh("Safe result:", val)`,
    content: (
      <pre className="font-mono text-base leading-snug">
        <code>
          <Comment>{'# Soft Fallback (?) avoids crashes'}</Comment>
          {'\n'}
          val = <Function>vind</Function>
          <Punctuation>(</Punctuation>
          <Number>5</Number>, <Number>0</Number>
          <Punctuation>)</Punctuation>
          <Keyword>?</Keyword>
          {'\n\n'}
          <Comment>{'# Custom Fallback (.bachao)'}</Comment>
          {'\n'}
          val = <Function>vind</Function>
          <Punctuation>(</Punctuation>
          <Number>5</Number>, <Number>0</Number>
          <Punctuation>)</Punctuation>.<Keyword>bachao</Keyword>
          <Punctuation>(</Punctuation>
          <Number>0</Number>
          <Punctuation>)</Punctuation>
          {'\n\n'}
          <Comment>{'# Critical Requirement (.lazmi)'}</Comment>
          {'\n'}b = <Function>vind</Function>
          <Punctuation>(</Punctuation>
          <Number>5</Number>, <Number>2</Number>
          <Punctuation>)</Punctuation>.<Keyword>lazmi</Keyword>
          <Punctuation>(</Punctuation>
          <String>&quot;Must work!&quot;</String>
          <Punctuation>)</Punctuation>
        </code>
      </pre>
    ),
  },
];
const Syntax = () => {
  const containerRef = useRef(null);
  const [activeSub, setActiveSub] = useState(0);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState('');
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      if (latest < 0.2) setActiveSub(0);
      else if (latest < 0.4) setActiveSub(1);
      else if (latest < 0.6) setActiveSub(2);
      else if (latest < 0.8) setActiveSub(3);
      else setActiveSub(4);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);
  useEffect(() => {
    setResult(null);
  }, [activeSub]);
  const handleRun = async () => {
    if (status === 'running') return;
    setStatus('running');
    setResult(null);
    setProgress('Initializing...');

    try {
      const output = await runSindlish(SYNTAX_CONTEXTS[activeSub].code, (p) => setProgress(p));
      setResult(output);
      setStatus('idle');
    } catch (err) {
      setResult(`Error: ${err.message}`);
      setStatus('idle');
    }
  };
  return (
    <LazyMotion features={domAnimation}>
      <section
        ref={containerRef}
        id="syntax"
        className="syntax relative h-[500vh] border-t border-gray-new-10"
      >
        <div className="sticky top-0 flex h-screen w-full items-center justify-center pt-20">
          <Container
            className="relative grid grid-cols-[224px_1fr] items-center gap-x-32 xl:grid-cols-1 xl:gap-y-12"
            size="1600"
          >
            <div className="xl:hidden" /> {/* Spacer for TOC */}
            <div className="flex w-full flex-col gap-y-12">
              <div className="max-w-2xl">
                <SectionLabel theme="white" className="mb-4">
                  Language Syntax
                </SectionLabel>
                <h2 className="text-5xl font-bold tracking-tight text-white xl:text-4xl lg:text-3xl">
                  Code in your <span className="text-[#E02424]">mother tongue</span>.
                </h2>
              </div>
              <div className="relative grid min-h-[400px] grid-cols-[1fr_1.5fr] items-center gap-24 xl:gap-12 lg:grid-cols-1">
                {/* Text Side */}
                <div className="flex flex-col gap-y-8">
                  <AnimatePresence mode="wait">
                    <m.div
                      key={activeSub}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="flex flex-col gap-y-6"
                    >
                      <h3 className="text-4xl font-bold tracking-tighter text-white italic">
                        {SYNTAX_CONTEXTS[activeSub].title}
                      </h3>
                      <p className="max-w-md text-xl leading-relaxed text-gray-new-50">
                        {SYNTAX_CONTEXTS[activeSub].description}
                      </p>
                    </m.div>
                  </AnimatePresence>
                </div>
                {/* Card Side */}
                <div className="group relative flex h-full flex-col">
                  <m.div
                    className="relative min-h-[320px] w-full overflow-hidden rounded-none border border-gray-new-20 bg-[#0A0A0B] shadow-2xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                  >
                    <div className="absolute top-0 right-0 size-48 bg-[#E02424]/5 blur-[80px]" />
                    <div className="absolute top-0 flex h-10 w-full items-center justify-between border-b border-gray-new-20 bg-white/5 px-6">
                      <span className="font-mono text-[10px] tracking-widest text-gray-new-40 uppercase">
                        Syntax_Guide.sd
                      </span>
                      <button
                        onClick={handleRun}
                        disabled={status === 'running'}
                        className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-gray-new-50 uppercase transition-colors hover:text-[#E02424] disabled:opacity-50"
                      >
                        {status === 'running' ? (
                          <span className="size-2 animate-spin rounded-full border border-current border-t-transparent" />
                        ) : (
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="inline-block"
                          >
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        )}
                        {status === 'running' ? 'Running' : 'Run'}
                      </button>
                    </div>

                    <div className="flex h-full items-start justify-start p-12 pt-16 xl:p-10 lg:p-8">
                      <AnimatePresence mode="wait">
                        <m.div
                          key={activeSub}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.4 }}
                          className="w-full text-white"
                        >
                          {SYNTAX_CONTEXTS[activeSub].content}
                        </m.div>
                      </AnimatePresence>
                    </div>
                  </m.div>
                  {/* Result Panel */}
                  <AnimatePresence>
                    {(result || status === 'running') && (
                      <m.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-4 rounded-none border border-[#E02424]/20 bg-[#E02424]/5 p-6 shadow-xl"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-bold tracking-widest text-[#E02424] uppercase">
                            {status === 'running' ? 'Executing...' : 'Output'}
                          </span>
                          {result && (
                            <button
                              onClick={() => setResult(null)}
                              className="text-[10px] font-bold text-gray-new-40 uppercase transition-colors hover:text-white"
                            >
                              Close
                            </button>
                          )}
                        </div>
                        {status === 'running' ? (
                          <div className="font-mono text-sm text-gray-new-40 italic">
                            {progress}
                          </div>
                        ) : (
                          <pre
                            className="text-green-400 font-mono text-sm whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: result }}
                          />
                        )}
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </section>
    </LazyMotion>
  );
};
export default Syntax;
