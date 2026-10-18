# a11y-checklist

Gate for the manual accessibility checklist (issue #52): the eight-item list
in `docs/internal/a11y-checklist.md` — focus order through the sticky header,
skip link, alt text, read-aloud comprehension, scrollable code blocks, the
workbench panes and divider, colour as a non-sole signal, and 200% zoom /
320px survival (spec #44) — stays structurally intact and points at routes
that still exist.

The items themselves are human work; nothing here pretends to automate a
keyboard or a screen reader. The gate makes the checklist itself verifiable:

- exactly eight numbered items, as the spec fixes them;
- every item states a **Route**, a **Selector**, **How to verify** and
  **Enforcement**;
- every Route is a `/`-rooted path that resolves today, reusing the
  internal-links inventory — a checklist item aimed at a retired route fails
  the build instead of sending someone somewhere dead.

Errors are reported as `file:line [a11y-checklist/...] message`.

Run:

```bash
npm run check:a11y    # this gate, CLI
```

The vitest spec in `__tests__/` runs with the rest of the docs-checks suite
(`npm run check:docs`).
