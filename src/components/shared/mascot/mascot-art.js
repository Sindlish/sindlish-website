/**
 * Mascot art manifest.
 *
 * This is the one seam between the mascot component and the art. Art ships in
 * `public/images/mascot/` as `mascot-<variant>.png`, and a variant is listed in
 * `MASCOT_ART_AVAILABLE` only once that file is really in the repo — dropping
 * art in needs no component change. Variants that are known but still artless
 * keep rendering the clearly labelled placeholder frame.
 *
 * Availability is a static list on purpose. A filesystem check would have to run
 * at module scope, and `next.config.js` aliases `fs` to an empty stub in browser
 * bundles, so `fs.existsSync` is not safe here.
 */

/** Every art variant the site knows about. Variants are decoupled from where they are used. */
export const MASCOT_VARIANTS = Object.freeze([
  'standing-neutral',
  'curious-question',
  'sit',
  'point',
  'thinking-error',
  'icon',
  'celebrate',
]);

/** Variants that have real art in `public/images/mascot/`. */
export const MASCOT_ART_AVAILABLE = Object.freeze([
  'standing-neutral',
  'curious-question',
  'sit',
  'point',
  'thinking-error',
]);

/** Public path an art variant is expected to live at. */
export function mascotArtPath(variant) {
  return `/images/mascot/mascot-${variant}.png`;
}

/** Whether a variant has real art, i.e. whether `<Mascot>` should render an image. */
export function hasMascotArt(variant) {
  return MASCOT_ART_AVAILABLE.includes(variant);
}
