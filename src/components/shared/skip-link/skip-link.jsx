import PropTypes from 'prop-types';

import { cn } from 'utils/cn';

/*
 * Global skip link. It is the first focusable element on every page and jumps
 * to the `#main` landmark (rendered by components/shared/layout). Hidden until
 * focused, then pinned to the top-left so it is visible over any chrome.
 *
 * Colour comes from the token layer so it is legible on the page surface in
 * both light and dark: the page surface is the background, primary text is the
 * label, and the indigo focus colour is the ring.
 */
const SkipLink = ({ className = null }) => (
  <a
    href="#main"
    className={cn(
      'sr-only',
      'focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100]',
      'focus:border focus:border-border focus:bg-surface-page focus:px-4 focus:py-2',
      'focus:text-sm focus:font-medium focus:text-text-primary',
      'focus:outline-2 focus:outline-offset-2 focus:outline-focus',
      className
    )}
  >
    Skip to content
  </a>
);

SkipLink.propTypes = {
  className: PropTypes.string,
};

export default SkipLink;
