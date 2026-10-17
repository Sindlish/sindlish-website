'use client';

import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { WorkbenchContext } from 'contexts/workbench-context';

import { DEFAULT_CODE } from './default-code';
import WorkbenchDivider from './workbench-divider';
import WorkbenchEditor from './workbench-editor';
import WorkbenchHeader from './workbench-header';
import WorkbenchTabs from './workbench-tabs';

const DEFAULT_RATIO = 50;

/**
 * The workbench split view (issue #54).
 *
 * This is the client shell shared by every `/workbench*` route. It owns the one
 * editor buffer and the split, and it hands the routed docs pane through as
 * `children` (a server component), so navigating the pane never unmounts the
 * editor or the interpreter it booted.
 */
export const WorkbenchRoot = ({ children }) => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [loadedAt, setLoadedAt] = useState(0);
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  const [activePane, setActivePane] = useState('docs');

  // `?code=` is the preload half of the share mechanism. Read once on mount so
  // the shared program replaces the default buffer.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('code');
    if (shared) setCode(shared);
  }, []);

  // A docs Load fills the buffer and, on a narrow screen, reveals the editor.
  const load = useCallback((source) => {
    setCode(source);
    setLoadedAt(Date.now());
    setActivePane('editor');
  }, []);

  const value = useMemo(() => ({ code, load, loadedAt, setCode }), [code, load, loadedAt]);

  return (
    <WorkbenchContext.Provider value={value}>
      <div className="flex h-dvh flex-col bg-surface-page">
        <WorkbenchHeader />
        <WorkbenchTabs activePane={activePane} onSelect={setActivePane} />
        <main
          className="grid min-h-0 flex-1 lg:flex lg:flex-col"
          data-active-pane={activePane}
          id="main"
          style={{ gridTemplateColumns: `${ratio}fr 0.5rem ${100 - ratio}fr` }}
          tabIndex={-1}
        >
          <section
            aria-label="Documentation"
            className="workbench-docs flex min-h-0 min-w-0 flex-col overflow-hidden"
            id="pane-docs"
            role="tabpanel"
          >
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </section>

          <WorkbenchDivider onChange={setRatio} ratio={ratio} />

          <section
            aria-label="Editor"
            className="workbench-editor flex min-h-0 min-w-0 flex-col overflow-hidden border-l border-border lg:border-t lg:border-l-0"
            id="pane-editor"
            role="tabpanel"
          >
            <WorkbenchEditor />
          </section>
        </main>
      </div>
    </WorkbenchContext.Provider>
  );
};

WorkbenchRoot.propTypes = {
  children: PropTypes.node,
};

WorkbenchRoot.defaultProps = {
  children: null,
};

export default WorkbenchRoot;
