'use client';
import PropTypes from 'prop-types';
import { useState } from 'react';

import { useWorkbench } from 'contexts/workbench-context';
import useCopyToClipboard from 'hooks/use-copy-to-clipboard';
import { FENCE_KIND } from 'lib/fences';
import { looksLikeError, runSindlish } from 'lib/sindlish-interpreter';
import { cn } from 'utils/cn';

import CheckIcon from './images/check.inline.svg';
import CopyIcon from './images/copy.inline.svg';

/**
 * The frame around one fenced code block.
 *
 * Contract (issue #50):
 * - the code region scrolls horizontally and is keyboard reachable
 *   (tabindex=0 on the scroll container, WCAG G202);
 * - it carries role="region" + an accessible name only when an authored
 *   filename exists — no invented chrome;
 * - `sd` blocks get Run, which reports the ACTUAL output in a live region.
 *   The expected output is a separate, always-visible block; Run verifies,
 *   it never reveals;
 * - `sd illustrative` blocks get a dashed border and an explicit text label,
 *   and never a Run control, so the difference needs no colour or icon.
 */
const CodeBlockWrapper = ({
  fence,
  code,
  className = '',
  copyButtonClassName = '',
  children,
  as: Tag = 'figure',
  ...otherProps
}) => {
  const { isCopied, handleCopy } = useCopyToClipboard(3000);
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [loadProgress, setLoadProgress] = useState('');
  // Inside the workbench's docs pane, a runnable example loads into the editor
  // instead of running in place: full docs pages keep Run, the pane shows Load.
  // The run contract is still one seam (lib/sindlish-interpreter).
  const workbench = useWorkbench();
  const inWorkbench = Boolean(workbench);

  const headerLabel = fence.isOutput
    ? fence.label
    : fence.illustrative
      ? 'Illustrative (not runnable)'
      : fence.filename;
  const accessibleName = fence.accessibleName;

  const handleRun = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setResult(null);
    setLoadProgress('Starting run...');
    try {
      // One run contract for the whole site: the seam T8 (workbench) and T56
      // build on. Do not fork it.
      const output = await runSindlish(code, (progress) => setLoadProgress(progress));
      setResult(output);
    } catch (err) {
      setResult(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
      setLoadProgress('');
    }
  };

  const actions = (
    <>
      {fence.kind === FENCE_KIND.RUNNABLE && !inWorkbench && (
        <button
          className="border border-border bg-surface-raised px-3 py-1.5 text-xs font-semibold tracking-wide text-text-primary uppercase transition-colors hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={handleRun}
          disabled={isRunning}
        >
          {isRunning ? 'Running' : 'Run'}
        </button>
      )}
      {fence.kind === FENCE_KIND.RUNNABLE && inWorkbench && (
        <button
          className="border border-border bg-surface-raised px-3 py-1.5 text-xs font-semibold tracking-wide text-text-primary uppercase transition-colors hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={() => workbench.load(code)}
        >
          Load
        </button>
      )}
      <button
        className={cn(
          'border border-border bg-surface-raised p-1.5 text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary disabled:opacity-50',
          copyButtonClassName
        )}
        type="button"
        aria-label={isCopied ? 'Copied' : 'Copy'}
        disabled={isCopied}
        onClick={() => handleCopy(code)}
      >
        {isCopied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
      </button>
    </>
  );

  return (
    <Tag
      className={cn(
        'code-block relative flex flex-col border border-border',
        fence.illustrative && 'border-dashed',
        className
      )}
      data-fence={fence.kind}
      data-has-filename={fence.filename ? 'true' : 'false'}
      {...otherProps}
    >
      {headerLabel && (
        <div className="flex h-11 items-center justify-between gap-3 border-b border-border px-4">
          <span className="truncate font-mono text-[13px] leading-none font-medium tracking-tight text-text-secondary">
            {headerLabel}
          </span>
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        </div>
      )}

      <div className="relative min-w-0">
        <div
          className="overflow-x-auto [&>pre]:my-0 [&>pre]:rounded-none [&>pre]:bg-surface-page! [&>pre]:py-4"
          tabIndex={0}
          role={accessibleName ? 'region' : undefined}
          aria-label={accessibleName || undefined}
        >
          {children}
        </div>
        {!headerLabel && (
          <div className="absolute top-3 right-3 flex items-center gap-2">{actions}</div>
        )}
      </div>

      {(result !== null || loadProgress) && (
        <div
          className="border-t border-border bg-surface-raised px-4 py-3"
          role="status"
          aria-live="polite"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold tracking-wide text-text-muted uppercase">
              Actual output
            </span>
            {result && (
              <button
                className="border border-border px-2 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
                type="button"
                onClick={() => setResult(null)}
              >
                Clear
              </button>
            )}
          </div>
          {loadProgress && !result && (
            <p className="font-mono text-[13px] text-text-muted">{loadProgress}</p>
          )}
          {result && (
            <pre
              className={cn(
                'overflow-x-auto font-mono text-sm whitespace-pre',
                looksLikeError(result) ? 'text-err' : 'text-text-primary'
              )}
              dangerouslySetInnerHTML={{ __html: result }}
            />
          )}
        </div>
      )}
    </Tag>
  );
};

export default CodeBlockWrapper;

CodeBlockWrapper.propTypes = {
  fence: PropTypes.shape({
    kind: PropTypes.oneOf([
      FENCE_KIND.RUNNABLE,
      FENCE_KIND.ILLUSTRATIVE,
      FENCE_KIND.OUTPUT,
      FENCE_KIND.SHELL,
      FENCE_KIND.PLAIN,
    ]).isRequired,
    filename: PropTypes.string,
    illustrative: PropTypes.bool.isRequired,
    runnable: PropTypes.bool.isRequired,
    isOutput: PropTypes.bool.isRequired,
    label: PropTypes.string,
    accessibleName: PropTypes.string,
    language: PropTypes.string.isRequired,
  }).isRequired,
  code: PropTypes.string.isRequired,
  className: PropTypes.string,
  copyButtonClassName: PropTypes.string,
  children: PropTypes.node,
  as: PropTypes.string,
};
