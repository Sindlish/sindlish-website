import { useEffect } from 'react';

import { getFocusable } from './get-focusable';
import { nextFocusTarget } from './trap-focus';

export const useFocusTrap = (containerRef, active) => {
  useEffect(() => {
    if (!active || !containerRef?.current) return undefined;

    const container = containerRef.current;
    const focusable = getFocusable(container);
    // Focus the first focusable element, or the container itself if none
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      container.focus();
    }

    const onKeyDown = (event) => {
      const target = nextFocusTarget(event, container);
      if (target) {
        event.preventDefault();
        target.focus();
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => container.removeEventListener('keydown', onKeyDown);
  }, [active, containerRef]);
};

export default useFocusTrap;
