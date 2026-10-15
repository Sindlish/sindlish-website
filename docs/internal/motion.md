# Motion and reduced motion

Every animation on the site has a reduced-motion path. This is a convention, not
a per-component choice: an animation must not have to remember to opt in.

## How it is wired

- **CSS keyframes and transitions** are neutralised globally in
  `src/styles/motion.css` under `@media (prefers-reduced-motion: reduce)`.
- **framer-motion** is neutralised once, at the root, by
  `<MotionConfig reducedMotion="user">` in `src/app/motion-provider.jsx`
  (mounted in `src/app/layout.jsx`). Under it, motion components skip transform
  and layout animations and keep opacity changes.
- **Anything framer-motion cannot infer** — a canvas draw loop, a Web Animations
  API call, a manual `requestAnimationFrame`, a third-party animation library —
  must read the preference itself with framer-motion's `useReducedMotion()` and
  render the static end state when it is true.

## Rules

1. New animation must be built with framer-motion, not a new animation library.
2. A CSS-only transition or keyframe is allowed; it is covered by the media
   query in `motion.css`.
3. Mascot motion is limited to a brief (~120 ms) opacity swap on run failure and
   is instant under reduced motion (spec #44, story 69).
4. Do not use `!important` on `animation` or `transition` longhands in
   components in a way that defeats the root media query; if a component must
   animate under reduced motion, that is a deliberate exception and belongs in
   review, not in a utility class.
