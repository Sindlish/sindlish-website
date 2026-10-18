# md-twins

Markdown-twin completeness check (issue #52, folds in T10): every docs page
has a generated markdown twin under `public/md`, and the twin's title and
summary match the page's frontmatter.

The twins are build artifacts (`postbuild` runs
`src/scripts/copy-md-content.js`), gitignored and absent on a fresh clone —
so this check **regenerates them itself** before comparing. That makes it
self-sufficient on any checkout, reports a generator crash as a gate failure
instead of a wall of "missing twin" noise, and never compares stale artifacts
against fresh sources.

Rules:

- every `content/**/*.md` file (with the pipeline's ignore rules) has a twin
  at the same relative path under `public/md` — **missing**;
- every twin has a source page — **stale**;
- the twin carries the page's frontmatter `title` as its `# heading` and its
  `summary` as its `> blockquote` — the summary's second of three homes, after
  frontmatter and before the rendered meta description (see
  `docs-references/` for the first).

Deliberately out of scope: `llms.txt` membership (the index generator excludes
`index.md` files, so `content/docs/how-to/index.md` is currently absent from
it — a real gap, but a fix to the llms processor, not to twin completeness).

Errors are reported as `file:line [md-twins/...] message`.

Run:

```bash
npm run check:md-twins   # this gate, CLI (regenerates public/md first)
```

The vitest spec in `__tests__/` runs with the rest of the docs-checks suite
(`npm run check:docs`).
