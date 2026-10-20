/**
 * The five locked Romanised Sindhi mascot lines (map #31).
 *
 * The mascot speaks only these lines. Each entry pairs the line it says with a
 * short English gloss; the gloss is exposed as a tooltip so a reader who does
 * not yet read Sindhi can still follow the joke. Do not invent new lines here
 * without going back to the placement decision.
 */
const MASCOT_LINES = Object.freeze({
  hero: { sd: 'Salam, duniya!', gloss: 'Hello, world!' },
  empty: {
    sd: 'Jaga na milyo. Cha tawaan sahi likhyo aahe?',
    gloss: 'Place not found. Did you write it correctly?',
  },
  notFound: { sd: 'He jaga na milyo.', gloss: 'This place was not found.' },
  error: { sd: 'HalndeVaktGhalti thi.', gloss: 'A right-now mistake happened.' },
  download: { sd: 'Shuru karyo', gloss: 'Started, your line' },
});

export default MASCOT_LINES;
