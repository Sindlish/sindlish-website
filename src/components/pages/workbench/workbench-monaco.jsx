'use client';

import PropTypes from 'prop-types';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

/**
 * The workbench's code surface (T9 / issue #56): Monaco over the real
 * Sindlish language server, lazy-loaded so docs pages never pay for Monaco.
 *
 * Until Monaco's chunk resolves — and should it ever fail to — the surface
 * stays the plain textarea issue #54 shipped: fully labelled, fully
 * keyboard-operable, so the editor is never dead. Monaco then takes its
 * place; the buffer lives in the workbench context either way, so typing in
 * either face is the same program.
 *
 * Focus never moves when Monaco mounts. Monaco itself never traps focus:
 * Escape (or Ctrl+M) switches it to tab-focus mode, so Tab leaves the
 * editor — the same contract VS Code has — and focus is visible throughout.
 */
export const WorkbenchMonaco = forwardRef(function WorkbenchMonaco({ onChange, value }, ref) {
  const containerRef = useRef(null);
  const textareaRef = useRef(null);
  const editorHandleRef = useRef(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const [isMounted, setIsMounted] = useState(false);

  valueRef.current = value;
  onChangeRef.current = onChange;

  useImperativeHandle(
    ref,
    () => ({
      focus() {
        if (editorHandleRef.current) editorHandleRef.current.editor.focus();
        else textareaRef.current?.focus();
      },
    }),
    []
  );

  useEffect(() => {
    let disposed = false;
    let handle = null;

    import('lib/monaco/sindlish-monaco')
      .then(({ createSindlishEditor }) =>
        createSindlishEditor(containerRef.current, {
          value: valueRef.current,
          onChange: (next) => onChangeRef.current(next),
        })
      )
      .then((created) => {
        handle = created;
        if (disposed) {
          created.dispose();
          return;
        }
        editorHandleRef.current = created;
        setIsMounted(true);
      })
      .catch((error) => {
        // Monaco failing must not break the workbench: the textarea stays.
        console.error('Monaco failed to load; keeping the plain editor.', error);
      });

    return () => {
      disposed = true;
      handle?.dispose();
      editorHandleRef.current = null;
    };
  }, []);

  // External fills — docs-pane Load, the ?code= preload, Reset — arrive as a
  // new value from the context; push them into the model without clobbering
  // what is being typed.
  useEffect(() => {
    const editor = editorHandleRef.current?.editor;
    if (editor && editor.getValue() !== value) editor.setValue(value);
  }, [value]);

  return (
    <>
      {!isMounted && (
        <>
          <label className="sr-only" htmlFor="workbench-code">
            Sindlish code
          </label>
          <textarea
            autoCapitalize="off"
            autoCorrect="off"
            className="h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-sm leading-[1.7] whitespace-pre text-text-primary outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
            id="workbench-code"
            onChange={(event) => onChange(event.target.value)}
            ref={textareaRef}
            spellCheck={false}
            value={value}
            wrap="off"
          />
        </>
      )}
      <div className={isMounted ? 'h-full w-full' : 'hidden'} ref={containerRef} />
    </>
  );
});

WorkbenchMonaco.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

export default WorkbenchMonaco;
