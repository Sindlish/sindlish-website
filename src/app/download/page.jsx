'use client';
import { m, LazyMotion, domAnimation } from 'framer-motion';

import Button from 'components/shared/button';
import Container from 'components/shared/container';
import Layout from 'components/shared/layout';
import LINKS from 'constants/links';
const PLATFORMS = [
  {
    name: 'Windows',
    arch: 'x86_64',
    file: 'sindlish-installer-win64.exe',
    instructions: [
      'Download the .exe installer',
      'Run the installer to set up paths',
      'Run sindlish --version',
    ],
  },
  {
    name: 'Linux',
    arch: 'x86_64',
    file: 'sindlish-installer-linux.deb',
    instructions: [
      'Download the .deb package',
      'Run: sudo dpkg -i sindlish-installer-linux.deb',
      'Run sindlish --version',
    ],
  },
  {
    name: 'macOS',
    arch: 'arm64 / x86_64',
    file: 'sindlish-installer-macos.pkg',
    instructions: [
      'Download the .pkg installer',
      'Open the package to run the installer',
      'Run sindlish --version',
    ],
  },
];
const DownloadPage = () => (
  <Layout isHeaderSticky isHeaderStickyOverlay theme="black">
    <LazyMotion features={domAnimation}>
      <section className="relative bg-black-pure safe-paddings text-white">
        <Container
          className="relative z-10 pt-40 pb-32 xl:pt-32 xl:pb-24 lg:pt-28 lg:pb-20 md:pt-24 md:pb-16"
          size="1600"
        >
          {/* Header */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-sm font-medium tracking-wider text-[#E02424] uppercase">
              Download
            </span>
            <h1 className="mt-3 text-[52px] leading-tight font-bold tracking-tighter xl:text-4xl lg:text-[32px] sm:text-[28px]">
              Get Sindlish <span className="text-gray-new-40">v0.1.1</span>
            </h1>
            <p className="mt-4 max-w-xl text-xl leading-snug tracking-extra-tight text-gray-new-60 lg:text-lg">
              The latest release of the Sindlish interpreter. Download the binary for your platform
              and start coding in your mother tongue.
            </p>
          </m.div>
          {/* Alpha Notice */}
          <m.div
            className="mt-10 max-w-2xl rounded-none border border-[#E02424]/30 bg-[#E02424]/5 px-5 py-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <div className="size-2 animate-pulse rounded-none bg-[#E02424]" />
              <span className="font-bold text-[#E02424]">Release Notice</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-gray-new-60">
              This is the current v0.1.1 release. <strong>Important:</strong> These binaries are
              currently unverified by platform vendors (Windows, Apple, etc.), so your system may
              flag them as risky. Rest assured,{' '}
              <strong>all Sindlish source code is completely open-source</strong> and available for
              audit on GitHub. Furthermore, Linux and macOS builds are experimental and may behave
              unexpectedly; we welcome your feedback to help us stabilize them!
            </p>
          </m.div>
          {/* Platform Cards */}
          <div className="mt-16 grid grid-cols-3 gap-6 lg:max-w-lg lg:grid-cols-1">
            {PLATFORMS.map(({ name, arch, file, instructions }, index) => (
              <m.div
                className="group flex flex-col rounded-none border border-gray-new-20 bg-[#0A0A0B] transition-colors hover:border-gray-new-30"
                key={name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-gray-new-20 p-6">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tighter">{name}</h3>
                    <span className="mt-1 block text-xs font-bold tracking-widest text-gray-new-50 uppercase">
                      {arch}
                    </span>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-none bg-[#E02424]/10">
                    <span className="text-lg font-bold text-[#E02424]">↓</span>
                  </div>
                </div>
                {/* Instructions */}
                <div className="flex flex-1 flex-col p-6">
                  <ol className="flex-1 space-y-3">
                    {instructions.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-new-60">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-none border border-gray-new-20 text-[10px] font-bold text-gray-new-40">
                          {i + 1}
                        </span>
                        <span className="font-mono text-xs leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                  <Button
                    className="mt-6 w-full justify-center"
                    to={`https://github.com/Sindlish/Sindlish/releases/latest/download//${file}`}
                    target="_blank"
                    theme="white-filled"
                    size="new"
                  >
                    Download for {name}
                  </Button>
                </div>
              </m.div>
            ))}
          </div>
          {/* Bottom Links */}
          <m.div
            className="mt-16 flex items-center gap-8 border-t border-gray-new-20 pt-8 md:flex-col md:items-start md:gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="flex-1">
              <h4 className="text-lg font-bold tracking-tighter">Need help?</h4>
              <p className="mt-1 text-sm text-gray-new-50">
                Read the docs or check the changelog for the full release notes.
              </p>
            </div>
            <div className="flex gap-4">
              <Button to={LINKS.docsHome} theme="outlined" size="xxs" className="h-9 px-5">
                Documentation
              </Button>
              <Button
                to="https://github.com/Sindlish/Sindlish/releases"
                target="_blank"
                theme="outlined"
                size="xxs"
                className="h-9 px-5"
              >
                GitHub Releases
              </Button>
            </div>
          </m.div>
        </Container>
      </section>
    </LazyMotion>
  </Layout>
);
export default DownloadPage;
