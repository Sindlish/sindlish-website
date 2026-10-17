'use client';

import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';

import LINKS from 'constants/links';
import { cn } from 'utils/cn';

import DocsHeader from './docs-header';
import DocsSidebar from './docs-sidebar';
import { useFocusTrap } from './use-focus-trap';
import { useMediaQuery } from './use-media-query';

const WIDE_VIEWPORT_QUERY = '(min-width: 1024px)';

export const DocsShell = ({ navigation = [], children }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const navRef = useRef(null);
  const isWideViewport = useMediaQuery(WIDE_VIEWPORT_QUERY);

  const closeNav = useCallback(() => {
    setIsNavOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  // The drawer is a narrow-viewport concept: if the viewport grows back to the
  // desktop grid, reset the state so nothing is left stuck open.
  useEffect(() => {
    if (isWideViewport) {
      setIsNavOpen(false);
    }
  }, [isWideViewport]);

  useFocusTrap(navRef, isNavOpen && !isWideViewport);

  useEffect(() => {
    if (!isNavOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeNav();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isNavOpen, closeNav]);

  return (
    <>
      <DocsHeader
        isNavOpen={isNavOpen}
        menuButtonRef={menuButtonRef}
        onMenuClick={() => setIsNavOpen((open) => !open)}
      />
      <div className="grid grid-cols-[268px_minmax(0,1fr)] items-start lg:grid-cols-1">
        <DocsSidebar
          isNavOpen={isNavOpen}
          navRef={navRef}
          navigation={navigation}
          onNavigate={closeNav}
        />
        <main className="min-w-0 px-6 pt-11 pb-24 lg:pt-7 sm:px-4" id="main" tabIndex={-1}>
          <div className="docs-measure">{children}</div>
        </main>
      </div>
      <div
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-[80] hidden bg-black/40 dark:bg-black/60',
          isNavOpen && 'lg:block'
        )}
        onClick={closeNav}
      />
      <footer className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border px-6 py-7 text-[13px] text-text-muted sm:px-4">
        <span>Sindlish</span>
        <a
          className="text-text-secondary transition-colors hover:text-text-primary"
          href={LINKS.github}
          rel="noopener noreferrer"
          target="_blank"
        >
          Source on GitHub
        </a>
        <a
          className="text-text-secondary transition-colors hover:text-text-primary"
          href="/docs/llms.txt"
        >
          llms.txt
        </a>
      </footer>
    </>
  );
};

DocsShell.propTypes = {
  children: PropTypes.node,
  navigation: PropTypes.arrayOf(PropTypes.shape({})),
};

DocsShell.defaultProps = {
  children: null,
  navigation: [],
};

export default DocsShell;
