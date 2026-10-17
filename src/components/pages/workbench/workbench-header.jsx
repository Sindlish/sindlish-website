import Image from 'next/image';
import NextLink from 'next/link';

import ThemeToggle from 'components/pages/doc/docs-shell/theme-toggle';
import LINKS from 'constants/links';

/**
 * The workbench chrome (issue #54). It mirrors the docs header but the
 * workbench is the current page and there is no docs search here — the editor
 * is the point of this screen.
 */
export const WorkbenchHeader = () => (
  <header className="flex h-[60px] shrink-0 items-center gap-x-4 gap-y-2.5 border-b border-border bg-surface-page px-6 lg:h-auto lg:flex-wrap lg:py-2.5 sm:px-4">
    <NextLink className="flex items-center gap-2 text-text-primary" href="/">
      <Image
        alt="Sindlish logo"
        height={18}
        src="/images/sindlish-logo.svg"
        unoptimized
        width={18}
      />
      <span>Sindlish</span>
    </NextLink>

    <nav
      aria-label="Site"
      className="ml-auto flex items-center gap-5 lg:ml-0 lg:min-w-0 lg:flex-1 lg:flex-wrap lg:gap-x-4 lg:gap-y-1"
    >
      <NextLink
        className="text-sm text-text-secondary transition-colors hover:text-text-primary"
        href={LINKS.docs}
      >
        Docs
      </NextLink>
      <NextLink aria-current="page" className="text-sm text-text-primary" href={LINKS.workbench}>
        Workbench
      </NextLink>
      <NextLink
        className="text-sm text-text-secondary transition-colors hover:text-text-primary"
        href={LINKS.download}
      >
        Download
      </NextLink>
      <NextLink
        className="text-sm text-text-secondary transition-colors hover:text-text-primary"
        href={LINKS.creator}
      >
        Creator
      </NextLink>
      <ThemeToggle />
      <a
        aria-label="Sindlish on GitHub"
        className="flex size-8 items-center justify-center rounded-sm border border-transparent text-text-secondary transition-colors hover:border-border hover:text-text-primary"
        href={LINKS.github}
        rel="noopener noreferrer"
        target="_blank"
      >
        <svg
          aria-hidden="true"
          className="size-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9 19c-4 1.2-4-2.2-6-2.7m12 5.2v-3.6a3.1 3.1 0 0 0-.9-2.4c2.9-.3 6-1.4 6-6.4a5 5 0 0 0-1.4-3.4 4.6 4.6 0 0 0-.1-3.5s-1.1-.3-3.6 1.4a12.3 12.3 0 0 0-6.4 0C6.4 1.9 5.3 2.2 5.3 2.2a4.6 4.6 0 0 0-.1 3.5A5 5 0 0 0 3.8 9.1c0 5 3 6.1 5.9 6.4a3.1 3.1 0 0 0-.9 2.4V21" />
        </svg>
      </a>
    </nav>
  </header>
);

export default WorkbenchHeader;
