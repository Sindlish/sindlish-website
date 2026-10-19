'use client';

import { useEffect, useRef, useState } from 'react';

import { MascotArt } from 'components/shared/mascot';
import { useWorkbench } from 'contexts/workbench-context';
import useCopyToClipboard from 'hooks/use-copy-to-clipboard';
import { initSindlish, looksLikeError, runSindlish } from 'lib/sindlish-interpreter';
import { cn } from 'utils/cn';

import { DEFAULT_CODE } from './default-code';
import WorkbenchMonaco from './workbench-monaco';

const NARROW_QUERY = '(max-width: 63.9375rem)';

/**
 * The editor pane: Monaco over the real Sindlish language server (T9 /
 * issue #56), hosted by WorkbenchMonaco. Everything the run needs — boot,
 * run, output, reset and share — is here; the code surface itself lazy-loads
 * and falls back to a plain textarea, so this pane never goes dead.
 */
export const WorkbenchEditor = () => {
  const { code, setCode, loadedAt } = useWorkbench();
  const { isCopied, handleCopy } = useCopyToClipboard(3000);
  const editorRef = useRef(null);

  // boot is a real state: the bundled interpreter can load, be loading, or fail.
  const [bootStatus, setBootStatus] = useState('loading'); // loading | ready | error
  const [bootError, setBootError] = useState('');
  const [bootProgress, setBootProgress] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null); // { kind: 'ok'|'error'|'notice', html }

  useEffect(() => {
    let alive = true;

    initSindlish((progress) => {
      if (alive) setBootProgress(progress);
    })
      .then(() => {
        if (!alive) return;
        setBootStatus('ready');
        setBootProgress('');
      })
      .catch((err) => {
        if (!alive) return;
        setBootStatus('error');
        setBootProgress('');
        setBootError(err?.message || 'The interpreter bundle could not be loaded.');
      });

    return () => {
      alive = false;
    };
  }, []);

  // A Load from a docs code block fills the editor. On a narrow screen the
  // editor was hidden when Load was pressed, so move focus into it; side by
  // side, leave the reading position alone and just announce it.
  useEffect(() => {
    if (!loadedAt) return;
    setOutput({ kind: 'notice', html: 'Loaded into the editor. Press Run.' });
    if (typeof window !== 'undefined' && window.matchMedia(NARROW_QUERY).matches) {
      editorRef.current?.focus();
    }
  }, [loadedAt]);

  const handleRun = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setOutput(null);
    try {
      const result = await runSindlish(code, (progress) => setBootProgress(progress));
      setBootStatus('ready');
      setBootError('');
      setOutput({ kind: looksLikeError(result) ? 'error' : 'ok', html: result });
    } catch (err) {
      const message = err?.message || 'Run failed.';
      setBootStatus('error');
      setBootError(message);
      setOutput({ kind: 'error', html: `Error: ${message}` });
    } finally {
      setIsRunning(false);
      setBootProgress('');
    }
  };

  const handleReset = () => {
    setCode(DEFAULT_CODE);
    setOutput(null);
  };

  const handleShare = () => {
    const { origin, pathname } = window.location;
    const url = `${origin}${pathname}?code=${encodeURIComponent(code)}`;
    window.history.replaceState(null, '', url);
    handleCopy(url);
  };

  const runDisabled = isRunning || bootStatus === 'loading';
  const runLabel = bootStatus === 'loading' ? 'Loading' : isRunning ? 'Running' : 'Run';

  const runFailed = output?.kind === 'error';
  const bootFailed = bootStatus === 'error' && !output;
  const failed = runFailed || bootFailed;

  let stateLabel = 'Waiting';
  let stateName = 'idle';
  if (bootStatus === 'loading') {
    stateLabel = 'Loading';
    stateName = 'busy';
  } else if (isRunning) {
    stateLabel = 'Executing';
    stateName = 'busy';
  } else if (failed) {
    stateLabel = 'Error';
    stateName = 'error';
  } else if (output?.kind === 'notice') {
    stateLabel = 'Loaded';
    stateName = 'ready';
  } else if (output) {
    stateLabel = 'Console';
    stateName = 'ok';
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-border px-3">
        <span className="font-mono text-[13px] text-text-secondary">main.sd</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
            onClick={handleShare}
            type="button"
          >
            {isCopied ? 'Link copied' : 'Share'}
          </button>
          <button
            className="border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
            onClick={handleReset}
            type="button"
          >
            Reset
          </button>
          <button
            className="inline-flex items-center gap-2 border border-text-primary bg-text-primary px-3 py-1.5 text-xs font-semibold tracking-wide text-surface-page uppercase transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={runDisabled}
            id="run-button"
            onClick={handleRun}
            type="button"
          >
            {runLabel}
          </button>
        </div>
      </div>

      <div className="min-h-[140px] flex-1">
        <WorkbenchMonaco onChange={setCode} ref={editorRef} value={code} />
      </div>

      <div className="flex h-[240px] min-h-0 shrink-0 flex-col border-t border-border">
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2.5">
          <span
            aria-hidden="true"
            className={cn(
              'size-1.5 shrink-0',
              stateName === 'ok' && 'bg-ok',
              stateName === 'error' && 'bg-err',
              stateName === 'busy' && 'bg-text-secondary',
              stateName === 'idle' && 'bg-border-strong'
            )}
            data-state={stateName}
          />
          <span className="text-[11px] font-semibold tracking-widest text-text-muted uppercase">
            Output
          </span>
          <span className="ml-auto text-[11px] tracking-widest text-text-muted uppercase">
            {stateLabel}
          </span>
        </div>

        <div
          aria-atomic="true"
          aria-live="polite"
          className="min-h-0 flex-1 overflow-auto p-4 font-mono text-sm leading-[1.7]"
          role="status"
        >
          {failed && (
            <div className="workbench-error-mascot mb-3">
              <MascotArt alt="" size={48} variant="thinking-error" />
            </div>
          )}

          {bootStatus === 'loading' && !output && (
            <p className="text-text-muted italic">{bootProgress || 'Loading the interpreter…'}</p>
          )}

          {!failed && output && output.kind === 'notice' && (
            <p className="text-text-muted italic">{output.html}</p>
          )}

          {!failed && output && output.kind !== 'notice' && (
            <pre className="whitespace-pre" dangerouslySetInnerHTML={{ __html: output.html }} />
          )}

          {bootFailed && <p className="whitespace-pre-wrap text-err">Error: {bootError}</p>}

          {runFailed && (
            <pre
              className="whitespace-pre text-err"
              dangerouslySetInnerHTML={{ __html: output.html }}
            />
          )}

          {!output && bootStatus === 'ready' && (
            <p className="text-text-muted italic">Run the code to see output.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkbenchEditor;
