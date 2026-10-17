'use client';

import PropTypes from 'prop-types';
import { useRef } from 'react';

import { cn } from 'utils/cn';

const TABS = [
  { id: 'docs', label: 'Docs', panelId: 'pane-docs' },
  { id: 'editor', label: 'Editor', panelId: 'pane-editor' },
];

/**
 * The narrow-viewport pane switch (issue #54).
 *
 * Above the `lg` (max-width) breakpoint both panes are visible and this control
 * is hidden; below it, only the selected pane is shown, so this is the only way
 * to move between them. It is a standard tablist with roving tabindex so arrow
 * keys move between the tabs without adding every tab to the Tab order.
 */
export const WorkbenchTabs = ({ activePane, onSelect }) => {
  const buttonsRef = useRef({});

  const handleKeyDown = (event) => {
    const index = TABS.findIndex((tab) => tab.id === activePane);
    let nextIndex = index;

    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === 'ArrowRight') nextIndex = (index + 1) % TABS.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = TABS.length - 1;
    else return;

    event.preventDefault();
    const next = TABS[nextIndex];
    onSelect(next.id);
    buttonsRef.current[next.id]?.focus();
  };

  return (
    <div
      aria-label="Workbench panes"
      className="hidden shrink-0 border-b border-border bg-surface-page lg:flex"
      role="tablist"
    >
      {TABS.map((tab) => {
        const selected = tab.id === activePane;

        return (
          <button
            aria-controls={tab.panelId}
            aria-selected={selected}
            className={cn(
              'flex-1 border-b-2 border-transparent px-2 py-3 text-sm font-medium text-text-secondary transition-colors',
              selected && 'border-link font-semibold text-text-primary'
            )}
            id={`tab-${tab.id}`}
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            onKeyDown={handleKeyDown}
            ref={(node) => {
              buttonsRef.current[tab.id] = node;
            }}
            role="tab"
            tabIndex={selected ? 0 : -1}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

WorkbenchTabs.propTypes = {
  activePane: PropTypes.oneOf(['docs', 'editor']).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default WorkbenchTabs;
