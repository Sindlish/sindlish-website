/**
 * Shared action styles for the quiet-page buttons and links.
 *
 * The layer is fully square: borders only, no radius, no shadow, no gradient.
 * Brand red never carries text, so every variant uses token text and the Ajrak
 * indigo link colour.
 */
export const ACTION_STYLES = {
  primary:
    'inline-flex items-center justify-center border border-border-strong bg-surface-raised px-5 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-overlay focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
  secondary:
    'inline-flex items-center justify-center border border-border px-5 py-3 text-sm font-medium text-text-primary transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
  link: 'text-link underline decoration-link/40 underline-offset-4 transition-colors hover:text-link-hover hover:decoration-link-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
};

export default ACTION_STYLES;
