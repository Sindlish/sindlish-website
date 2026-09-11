'use client';
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import PropTypes from 'prop-types';
import { useState } from 'react';

import Container from 'components/shared/container';
import GitHubIcon from 'icons/github.inline.svg';
import boltIcon from 'icons/home/features/bolt-lightning.svg';
import clockIcon from 'icons/home/features/clock.svg';
import connectionsIcon from 'icons/home/features/connections.svg';
import { runSindlish } from 'lib/sindlish-interpreter';
import { cn } from 'utils/cn';
import githubStars from 'utils/data/github-stars.generated.json';
const Keyword = ({ children }) => <span className="font-bold text-[#E02424]">{children}</span>;
const String = ({ children }) => <span className="text-[#FFED9C]">{children}</span>;
const Punctuation = ({ children }) => <span className="text-white">{children}</span>;
const Function = ({ children }) => <span className="text-[#F7B983]">{children}</span>;
Keyword.propTypes = { children: PropTypes.node.isRequired };
String.propTypes = { children: PropTypes.node.isRequired };
Punctuation.propTypes = { children: PropTypes.node.isRequired };
Function.propTypes = { children: PropTypes.node.isRequired };
const ReasonContent = ({ code, children }) => {
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle');
  const handleRun = async () => {
    if (status === 'running') return;
    setStatus('running');
    setResult(null);
    try {
      const output = await runSindlish(code);
      setResult(output);
      setStatus('idle');
    } catch (err) {
      setResult(`Error: ${err.message}`);
      setStatus('idle');
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="group/card relative rounded-none border border-gray-new-20 bg-[#0A0A0B] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="size-3 rounded-none bg-[#E02424]/40" />
            <div className="size-3 rounded-none bg-[#984A45]/40" />
            <div className="size-3 rounded-none bg-[#1B3A5C]/40" />
          </div>
          <button
            onClick={handleRun}
            disabled={status === 'running'}
            className="text-[10px] font-bold tracking-widest text-gray-new-40 uppercase opacity-0 transition-opacity group-hover/card:opacity-100 hover:text-[#E02424] disabled:opacity-50"
          >
            {status === 'running' ? 'Running...' : 'Run →'}
          </button>
        </div>
        <pre className="text-sm leading-relaxed text-gray-new-80">
          <code>{children}</code>
        </pre>
      </div>

      <AnimatePresence>
        {result && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-green-500/20 bg-green-500/5 mt-2 rounded-none border p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-green-500 text-[10px] font-bold tracking-widest uppercase">
                  Output
                </span>
                <button
                  onClick={() => setResult(null)}
                  className="text-[10px] font-bold text-gray-new-40 uppercase hover:text-white"
                >
                  Clear
                </button>
              </div>
              <pre
                className="text-green-400 font-mono text-xs whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: result }}
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
ReasonContent.propTypes = {
  code: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
const REASONS = [
  {
    title: 'Code in Sindhi',
    subtitle: 'Write in your tongue',
    description:
      'Sindlish uses Roman Sindhi keywords like likh (print) and agar (if). Write your logic in the language you think in, removing the cognitive overhead of translating thought to code.',
    icon: connectionsIcon,
    content: (
      <ReasonContent
        code={`kaam salam() {\n  likh("Bhale Kare Aya!")\n}\n\nagar (sach) {\n  salam()\n}`}
      >
        <Keyword>kaam</Keyword> <Function>salam</Function>
        <Punctuation>()</Punctuation> &#123;{'\n'}
        {'  '}
        <Keyword>likh</Keyword>
        <Punctuation>(</Punctuation>
        <String>&quot;Bhale Kare Aya!&quot;</String>
        <Punctuation>)</Punctuation>
        {'\n'}
        &#125;{'\n'}
        {'\n'}
        <Keyword>agar</Keyword> <Punctuation>(</Punctuation>sach<Punctuation>)</Punctuation> &#123;
        {'\n'}
        {'  '}
        <Function>salam</Function>
        <Punctuation>()</Punctuation>
        {'\n'}
        &#125;
      </ReasonContent>
    ),
  },
  {
    title: 'Learn & Teach',
    subtitle: 'Education first',
    description:
      'Designed explicitly for education. Sindlish removes the English barrier from programming, making advanced software concepts accessible to Sindhi-speaking students globally.',
    icon: clockIcon,
    content: (
      <div className="flex flex-col gap-4 rounded-none border border-gray-new-20 bg-[#0A0A0B] p-8 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-new-20 pb-4">
          <span className="text-xs font-semibold tracking-widest text-gray-new-50 uppercase">
            English
          </span>
          <span className="text-xs font-semibold tracking-widest text-[#E02424] uppercase">
            Sindlish
          </span>
        </div>
        <div className="space-y-4">
          <div className="group flex cursor-default items-center justify-between">
            <span className="text-sm text-gray-new-70 italic transition-colors group-hover:text-gray-new-90">
              print(&quot;Hi&quot;)
            </span>
            <div className="mx-4 h-px flex-1 bg-gray-new-10" />
            <span className="text-sm font-bold text-white transition-colors group-hover:text-[#E02424]">
              likh(&quot;Hi&quot;)
            </span>
          </div>
          <div className="group flex cursor-default items-center justify-between">
            <span className="text-sm text-gray-new-70 italic transition-colors group-hover:text-gray-new-90">
              if (condition)
            </span>
            <div className="mx-4 h-px flex-1 bg-gray-new-10" />
            <span className="text-sm font-bold text-white transition-colors group-hover:text-[#E02424]">
              agar (faislo)
            </span>
          </div>
          <div className="group flex cursor-default items-center justify-between">
            <span className="text-sm text-gray-new-70 italic transition-colors group-hover:text-gray-new-90">
              return x
            </span>
            <div className="mx-4 h-px flex-1 bg-gray-new-10" />
            <span className="text-sm font-bold text-white transition-colors group-hover:text-[#E02424]">
              wapas x
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Open Source',
    subtitle: 'Built for the community',
    description:
      'Sindlish is fully open source. Built with a high-performance bytecode VM, a native object model, and seamless integration through a dedicated VS Code extension.',
    icon: boltIcon,
    content: (
      <div className="group overflow-hidden rounded-none border border-gray-new-20 bg-[#0A0A0B] p-0 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-new-20 bg-gray-new-10/10 p-6">
          <div className="flex items-center gap-3">
            <GitHubIcon className="size-5 text-white" />
            <span className="text-sm font-bold text-white">
              Sindlish / <span className="text-[#E02424]">Sindlish</span>
            </span>
          </div>
          <div className="border border-gray-new-20 px-2 py-0.5 text-[10px] font-bold tracking-tighter text-gray-new-50 uppercase">
            Public
          </div>
        </div>
        <div className="space-y-6 p-6">
          <p className="text-xs leading-relaxed text-gray-new-50 italic">
            &quot;The first Roman Sindhi programming language. Empowering 30M+ speakers.&quot;
          </p>
          <div className="flex gap-6">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white transition-colors group-hover:text-[#E02424]">
                33
              </span>
              <span className="text-[10px] font-bold tracking-widest text-gray-new-50 uppercase">
                Commits
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white transition-colors group-hover:text-[#E02424]">
                {githubStars.stargazers_count}
              </span>
              <span className="text-[10px] font-bold tracking-widest text-gray-new-50 uppercase">
                Star
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white transition-colors group-hover:text-[#E02424]">
                30+
              </span>
              <span className="text-[10px] font-bold tracking-widest text-gray-new-50 uppercase">
                Files
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold tracking-tighter text-gray-new-60 uppercase">
              <span>Main Language</span>
              <span className="text-white">Python 98.5%</span>
            </div>
            <div className="flex h-1.5 w-full overflow-hidden rounded-none bg-gray-new-10">
              <div className="h-full bg-[#E02424]" style={{ width: '98.5%' }} />
              <div className="h-full bg-[#1B3A5C]" style={{ width: '1.5%' }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['interpreter', 'vscode-extension', 'bytecode-vm', 'sindhi-grammar'].map((tag) => (
              <span
                key={tag}
                className="border border-gray-new-20 bg-gray-new-10 px-2 py-1 font-mono text-[10px] text-gray-new-70"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-gray-new-10 pt-4">
            <div className="flex items-center gap-2">
              <div className="bg-green-500 size-2 animate-pulse rounded-none" />
              <span className="text-[10px] font-bold tracking-widest text-gray-new-40 uppercase">
                Active Development
              </span>
            </div>
            <span className="cursor-pointer text-[11px] font-bold text-[#E02424] group-hover:underline">
              View Repo →
            </span>
          </div>
        </div>
      </div>
    ),
  },
];
const WhySindlish = () => (
  <LazyMotion features={domAnimation}>
    <m.section
      id="why-sindlish"
      className="why-sindlish scroll-mt-20 py-32 safe-paddings xl:py-24 lg:py-20 md:py-16"
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20%' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <Container
        className="relative grid grid-cols-[224px_1fr] items-center gap-x-32 pt-[180px] pb-20 xl:grid-cols-1 xl:gap-y-12"
        size="1600"
      >
        <div className="xl:hidden" /> {/* Spacer for TOC */}
        <div className="flex flex-col gap-y-24">
          <div className="text-left">
            <span className="text-sm font-medium tracking-wider text-[#E02424] uppercase">
              Cho Sindlish?
            </span>
            <h2 className="mt-3 text-[52px] leading-tight font-bold tracking-tighter xl:text-4xl lg:text-[32px] sm:text-[28px]">
              Why Sindlish?
            </h2>
            <p className="mt-4 max-w-xl text-xl leading-snug tracking-extra-tight text-gray-new-60 lg:text-lg">
              Sindlish brings programming to 30+ million Sindhi speakers by letting them write code
              in their mother tongue.
            </p>
          </div>
          <div className="space-y-40 xl:space-y-32 lg:space-y-24 md:space-y-20">
            {REASONS.map(({ title, subtitle, description, icon, content }, index) => (
              <m.div
                className={cn(
                  'flex items-center gap-x-24 xl:gap-x-16 lg:gap-x-12 md:flex-col md:items-start md:gap-y-12',
                  index % 2 !== 0 && 'flex-row-reverse md:flex-col'
                )}
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex-1">
                  <div className="mb-6 flex size-12 items-center justify-center rounded-none bg-[#E02424]/10 transition-colors group-hover:bg-[#E02424]/20">
                    <Image
                      className="opacity-90"
                      src={icon}
                      width={24}
                      height={24}
                      loading="lazy"
                      alt=""
                    />
                  </div>
                  <h3 className="text-4xl leading-dense font-bold tracking-tighter text-white xl:text-3xl sm:text-2xl">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm font-medium tracking-widest text-[#E02424] uppercase">
                    {subtitle}
                  </p>
                  <p className="mt-6 text-xl leading-snug tracking-extra-tight text-gray-new-60 lg:text-lg">
                    {description}
                  </p>
                </div>
                <div className="flex-1 xl:w-full">
                  <div className="group relative">
                    <div className="absolute -inset-4 rounded-none bg-[#E02424]/5 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_50px_-12px_rgba(224,36,36,0.3)]">
                      {content}
                    </div>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </Container>
    </m.section>
  </LazyMotion>
);
export default WhySindlish;
