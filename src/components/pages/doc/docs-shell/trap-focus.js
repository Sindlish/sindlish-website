import { getFocusable } from './get-focusable';

export const nextFocusTarget = (event, container) => {
  if (event.key !== 'Tab') return null;
  const focusable = getFocusable(container);
  if (focusable.length === 0) return null;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = container.ownerDocument?.activeElement;

  if (event.shiftKey) {
    if (active === first || !container.contains(active)) return last;
    return null;
  }

  if (active === last || !container.contains(active)) return first;
  return null;
};

export default nextFocusTarget;
