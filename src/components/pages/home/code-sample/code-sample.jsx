import PropTypes from 'prop-types';

/**
 * A framed program listing. Syntax colouring is deliberately left out here: the
 * token layer carries no syntax palette, and the docs own highlighting (#41), so
 * the homepage shows the code as it reads.
 */
const CodeSample = ({ filename, code, output = null }) => (
  <figure className="overflow-hidden border border-border bg-surface-raised">
    <figcaption className="border-b border-border px-4 py-2 font-mono text-xs tracking-widest text-text-muted uppercase">
      {filename}
    </figcaption>
    <pre className="overflow-x-auto p-6 font-mono text-sm leading-relaxed text-text-primary sm:p-4">
      <code>{code}</code>
    </pre>
    {output && (
      <div className="flex items-center gap-3 border-t border-border px-4 py-2">
        <span className="font-mono text-xs tracking-widest text-text-muted uppercase">Output</span>
        <span className="font-mono text-sm text-text-primary">{output}</span>
      </div>
    )}
  </figure>
);

CodeSample.propTypes = {
  filename: PropTypes.string.isRequired,
  code: PropTypes.string.isRequired,
  output: PropTypes.string,
};

export default CodeSample;
