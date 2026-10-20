# docs-checks

Validate `content/**/*.md` against authoritative sources. Each check is self-contained in its own subfolder.

## Run

```bash
npm run check            # every deterministic gate below, in one command
npm run check:docs       # all vitest-based checks (specs for every gate)
npm run check:links      # Gate 2: internal links resolve (issue #52)
npm run check:nav        # Gate 5: navigation.yaml ↔ content/docs (issue #52)
npm run check:md-twins   # every page exports a matching markdown twin (issue #52)
npm run check:a11y       # the eight-item manual checklist is intact (issue #52)
npm run check:examples   # run every .sd example against the real interpreter
npm run check:interpreter # fail when the bundled interpreter is stale
npm run check:grammar    # fail when the committed TextMate grammar drifts
```

Exits non-zero on any validation error.

## Checks

- `example-runner/` — runs every ```sd block in `content/docs/**/*.md`
  through the bundled interpreter (`public/interpreter/`), asserts expected
  output where declared, and times out runaway blocks. Wired as
  `npm run check:examples`.
- `interpreter-staleness/` — compares the bundled interpreter
  (`public/interpreter/`) with its canonical source
  ([`Sindlish/Sindlish`](https://github.com/Sindlish/Sindlish) `interpreter/`)
  and fails on any difference. Wired as `npm run check:interpreter`; CI fetches
  the canonical tree with `fetch-canonical.sh`. See its own README.
- `grammar-drift/` — re-runs the interpreter's own grammar generator against
  the bundled interpreter (`public/interpreter/`) and fails when the output
  differs from the committed `src/lib/grammars/sindlish.tmLanguage.json`. Wired
  as `npm run check:grammar`; needs Python 3. See its own README.
- `internal-links/` — Gate 2 (issue #52): every `/`-rooted link in the corpus
  and in `src/constants/links.js` resolves against the docs pages, app routes,
  public files and legacy redirects — no browser, no network. Wired as
  `npm run check:links`. See its own README.
- `docs-references/` — Gate 3 (issue #52): every screenshot, component and
  frontmatter field a page references exists. `npm run check:docs` runs its
  spec (and every other check's) through vitest. See its own README.
- `nav-sync/` — Gate 5 (issue #52): `navigation.yaml` and `content/docs` are
  the same list, checked both directions. Wired as `npm run check:nav`. See
  its own README.
- `md-twins/` — completeness of the markdown exports under `public/md`
  (issue #52, folds in T10); regenerates them before comparing so it works on
  a fresh clone. Wired as `npm run check:md-twins`. See its own README.
- `a11y-checklist/` — keeps `docs/internal/a11y-checklist.md` the eight items
  spec #44 named, each with a live route, selector, steps and enforcement.
  Wired as `npm run check:a11y`. See its own README.

## Add a new check

1. Create `scripts/docs-checks/<name>/` with:

   ```text
   <name>/
     README.md
     links.js or <name>.js    # pure logic (no fs), if the rules allow it
     validate.js             # exports validate() -> { invocations, errors }
     check.js                # CLI: print the report, exit non-zero on errors
     __tests__/
       <name>.test.js        # asserts errors.length === 0
   ```

2. Each error must be `{ kind, file, line, raw, message }`.
3. Add to `package.json`:

   ```json
   "check:docs:<name>": "vitest run scripts/docs-checks/<name>/__tests__/<name>.test.js"
   ```

   `check:docs` picks it up via `vitest run scripts/docs-checks`.

## Shared helpers

`_lib/` holds what two checks now genuinely share: `markdown.js` (fence and
inline-code stripping that preserves line numbers), `errors.js` (the
`file:line [kind] message` report format) and `inventory.js` (the docs pages /
app routes / public files / redirects inventory). Lift new duplication there
rather than copying it into a third check. Don't pre-abstract.
