# nav-sync

Gate 5 of the five blocking gates (issue #44/#52): **navigation stays in sync
with the corpus**. `content/docs/navigation.yaml` and the markdown files under
`content/docs` are the same list, checked both ways.

Both failure modes are invisible at runtime: `src/app/docs/[...slug]` renders
*some* page for any `/docs/...` URL, so a typo'd slug 404s politely and an
orphaned page simply never appears in the docs index or the sidebar. This gate
compares the two lists directly instead.

Rules:

- every navigation leaf slug has a matching `content/docs/<slug>.md`;
- every corpus page appears in the navigation at least once;
- a slug appearing more than once in the navigation is **allowed** — the
  content pipeline scores multiple locations per page to pick its canonical
  one (`process-md-for-llms.js`), so cross-referencing a page from two pillars
  is a feature;
- pillar-level `slug:` fields (next to `nav:`) are not page leaves and are not
  diffed; the shell renders pillars as headings, not links.

Errors are reported as `file:line [nav-sync/...] message`, pointing either at
the offending `slug:` line in `navigation.yaml` or at the orphaned page.

Run:

```bash
npm run check:nav      # this gate, CLI
```

The vitest spec in `__tests__/` runs with the rest of the docs-checks suite
(`npm run check:docs`).
