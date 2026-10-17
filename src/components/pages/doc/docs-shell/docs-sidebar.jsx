'use client';

import { usePathname } from 'next/navigation';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

import { cn } from 'utils/cn';

import DocsNav from './docs-nav';

const SCROLL_KEY = 'sindlish-docs-sidebar-scroll';

export const DocsSidebar = ({ navigation, isNavOpen, navRef, onNavigate }) => {
  const pathname = usePathname();

  // The reader's place in the nav survives a trip to a page and back.
  useEffect(() => {
    const el = navRef?.current;
    if (!el) return undefined;

    try {
      const saved = sessionStorage.getItem(SCROLL_KEY);
      if (saved !== null && saved !== '') {
        el.scrollTop = Number(saved);
      }
    } catch (_err) {
      // sessionStorage may be unavailable (private mode); nothing to restore.
    }

    const onScroll = () => {
      try {
        sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop));
      } catch (_err) {
        // ignore
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [navRef]);

  return (
    <nav
      aria-label="Documentation"
      className={cn(
        'sticky top-[60px] h-[calc(100vh-60px)] w-[268px] self-start overflow-y-auto overscroll-contain border-r border-border',
        'lg:invisible lg:fixed lg:top-0 lg:bottom-0 lg:left-0 lg:z-[90] lg:h-dvh lg:w-[min(320px,86vw)] lg:-translate-x-full lg:[scrollbar-width:thin] lg:border-border-strong lg:bg-surface-page lg:transition-[transform,visibility] lg:duration-200 lg:ease-out',
        isNavOpen && 'lg:visible lg:translate-x-0'
      )}
      id="sidebar"
      ref={navRef}
    >
      <DocsNav currentPath={pathname} navigation={navigation} onNavigate={onNavigate} />
    </nav>
  );
};

DocsSidebar.propTypes = {
  isNavOpen: PropTypes.bool,
  navRef: PropTypes.shape({ current: PropTypes.any }),
  navigation: PropTypes.arrayOf(PropTypes.shape({})),
  onNavigate: PropTypes.func,
};

DocsSidebar.defaultProps = {
  isNavOpen: false,
  navRef: null,
  navigation: [],
  onNavigate: undefined,
};

export default DocsSidebar;
