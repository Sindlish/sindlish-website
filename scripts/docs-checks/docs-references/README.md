# docs-references

Gate 3 of the five blocking gates (issue #44/#52): **docs object to nothing
absent**. Every screenshot, component and frontmatter field a docs page
references exists.

Per page (the rendered corpus: `content/docs/**` with the `api-content.js`
ignore rules — `content/docs/README.md` is a contributor guide, never a page):

| Check | Rule |
| --- | --- |
| frontmatter | `title` and `summary` present; every key in the documented set (`content/docs/README.md` plus `noindex`, which `api-docs.js` reads) |
| components | every uppercase JSX tag is in the MDX component surface |
| images | every `![...](...)` / `src="..."` reference is a `/`-rooted path that exists under `public/` |
| `ogImage` | when declared, the `/`-rooted file exists under `public/` |

Deliberate decisions:

- **The component surface is parsed from the map**, not restated here:
  `src/components/shared/content/content.jsx` `getComponents()` is the single
  source of truth (currently `Admonition` and `Steps`). If the map cannot be
  parsed the gate fails loudly rather than passing vacuously — a flaky gate is
  worse than none.
- **Remote images are not checked.** Whether `https://...` still serves an
  image is a network question; the linkinator crawl owns those.
- **Code fences and inline code never count.** `<Admonition>` in a fenced
  example is prose about the component, not a reference to it.
- **The competing-summary habit is the target of the frontmatter rule.** The
  spec notes a three-way `summary` mismatch as a repository habit to catch on
  reintroduction: a second summary-ish field (`description`, `excerpt`,
  `subtitle`) is an unknown key and fails here; the twin's `> summary` line is
  checked by `md-twins/`; the rendered meta description has no other source.

Errors are reported as `file:line [docs-references/...] message`.

Run:

```bash
npm run check:docs      # this gate's spec, via the docs-checks vitest suite
```

The `check.js` CLI (`node scripts/docs-checks/docs-references/check.js`) makes
the same assertion outside vitest.
