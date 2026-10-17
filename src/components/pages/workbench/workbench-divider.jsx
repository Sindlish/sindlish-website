'use client';

import PropTypes from 'prop-types';

/**
 * The split-view divider between the docs pane and the editor (issue #54).
 *
 * It is a `role="separator"` with `aria-orientation="vertical"` and a roving
 * value, and it is operable by pointer and by keyboard (Left/Right, Home/End).
 * It is deliberately NOT a keyboard trap: it is a single focusable control and
 * Tab moves on past it in both directions.
 */
const MIN_RATIO = 25;
const MAX_RATIO = 75;
const STEP = 2;
const STEP_BIG = 10;

const clampRatio = (value) => Math.min(MAX_RATIO, Math.max(MIN_RATIO, value));

export const WorkbenchDivider = ({ ratio, onChange }) => {
  const handleKeyDown = (event) => {
    const step = event.shiftKey ? STEP_BIG : STEP;
    let next = ratio;

    if (event.key === 'ArrowLeft') next = ratio - step;
    else if (event.key === 'ArrowRight') next = ratio + step;
    else if (event.key === 'Home') next = MIN_RATIO;
    else if (event.key === 'End') next = MAX_RATIO;
    else return;

    event.preventDefault();
    onChange(clampRatio(next));
  };

  const handlePointerDown = (event) => {
    event.preventDefault();
    const container = event.currentTarget.parentElement;
    if (!container) return;

    const move = (moveEvent) => {
      const rect = container.getBoundingClientRect();
      const percent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      onChange(clampRatio(Math.round(percent)));
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
  };

  return (
    <div
      aria-label="Resize documentation and editor panes"
      aria-orientation="vertical"
      aria-valuemax={MAX_RATIO}
      aria-valuemin={MIN_RATIO}
      aria-valuenow={ratio}
      className="workbench-divider group relative z-10 -mx-1 w-2 cursor-col-resize touch-none bg-surface-page lg:hidden"
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      role="separator"
      // A focusable separator is an interactive widget (ARIA APG), and the
      // ticket requires it to be keyboard operable without being a tab trap.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
    >
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-border-strong transition-colors group-hover:bg-text-primary group-focus-visible:bg-text-primary"
      />
    </div>
  );
};

WorkbenchDivider.propTypes = {
  onChange: PropTypes.func.isRequired,
  ratio: PropTypes.number.isRequired,
};

export default WorkbenchDivider;
