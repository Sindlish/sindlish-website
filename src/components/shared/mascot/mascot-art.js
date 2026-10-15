/**
 * Mascot art manifest.
 *
 * This is the one seam between the mascot component and the art. The repo
 * currently ships no mascot PNGs, so every placement renders a clearly labelled
 * placeholder. When an art variant lands it is dropped into
 * `public/images/mascot/` and its name is added to `MASCOT_ART_AVAILABLE`; no
 * component change is needed.
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
]);

/** Variants that have real art in `public/images/mascot/`. Empty until art lands. */
export const MASCOT_ART_AVAILABLE = Object.freeze([]);

/** Public path an art variant is expected to live at. */
export function mascotArtPath(variant) {
  return `/images/mascot/mascot-${variant}.png`;
}

/** Whether a variant has real art, i.e. whether `<Mascot>` should render an image. */
export function hasMascotArt(variant) {
  return MASCOT_ART_AVAILABLE.includes(variant);
}
