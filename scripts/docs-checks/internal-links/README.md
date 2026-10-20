# internal-links

Gate 2 of the five blocking gates (issue #44/#52): **internal links resolve**.

Every `/`-rooted link in `content/**` and every route literal in
`src/constants/links.js` must resolve, without a browser and without the
network, against four sources of truth:

| Source | Resolves |
| --- | --- |
| the docs corpus (`content/docs/**`, same ignore rules as `api-content.js`) | `/docs/<slug>` |
| the app router tree (`src/app/**`) | static routes exactly, dynamic routes as prefixes |
| `public/**` | `/images/...`, `/favicon.ico`, anything static |
| `src/lib/legacy-redirects.js` | redirect sources such as `/playground` |

Deliberate decisions:

- **Docs links never fall through to the `[...slug]` catch-all.** The router
  renders *some* page for any `/docs/...` URL, so resolving against the router
  would bless every typo. The corpus is the authority: a docs link that names
  no page fails, even though the 404 page exists.
- **The linkinator crawl keeps its job** (`npm run check:broken-links`,
  scheduled, internal-only after `linkinator.config.json` was narrowed). It
  checks the HTML the build emits; this gate checks the authored sources.
  Neither replaces the other — the rendered layer can drift from the sources,
  and the sources can be broken before a build exists at all.
- **Only site-absolute links are validated.** Relative links
  (`../../README.md`) are repository navigation for contributors, not site
  URLs. Fragments (`#anchor`) are skipped: no authored docs link uses one, and
  anchor-id generation lives in the renderer.
- **Images belong to Gate 3** (`docs-references`), which checks the referenced
  asset actually exists in `public/`.

Errors are reported as `file:line [internal-links] message`.

Run:

```bash
npm run check:links     # this gate, CLI
npm run check:docs      # this gate's spec, via the docs-checks vitest suite
```
