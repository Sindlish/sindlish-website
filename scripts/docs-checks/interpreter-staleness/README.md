# interpreter-staleness

The build gate that keeps the bundled interpreter honest.

`public/interpreter/` is a copy of the canonical interpreter package in the
language repository. If that copy drifts, the example runner and the
in-browser Run button execute last month's language while the pages describe
this month's. This check compares the two trees and fails on any difference.

## Canonical source

|              |                                                                      |
| ------------ | -------------------------------------------------------------------- |
| Repository   | [`Sindlish/Sindlish`](https://github.com/Sindlish/Sindlish) (public) |
| Ref          | `main` by default; override with `SINDLISH_CANONICAL_REF`            |
| Package      | `interpreter/` in that repository                                    |
| Bundled copy | `public/interpreter/` in this repository                             |

The mapping is one directory to one directory: every file under
`Sindlish/Sindlish/interpreter/` must exist, unchanged, under
`public/interpreter/`. The bundle may additionally contain `.gitignore`
(allowlisted), because the website repository tracks it and the language
package does not.

## Run

```bash
# CI does this automatically; locally, point at your Sindlish checkout:
SINDLISH_CANONICAL_DIR=/path/to/Sindlish/interpreter npm run check:interpreter
```

`check.js` fails (exit `1`) on drift and also fails (exit `2`) with
instructions when `SINDLISH_CANONICAL_DIR` is unset. It never passes when the
comparison did not actually run.

### How CI fetches the canonical tree

`.github/workflows/docs-examples.yml` runs a `check-interpreter-staleness` job:

1. `fetch-canonical.sh` shallowly and sparsely clones the canonical
   `interpreter/` package and prints its path (stdout only; git talks on
   stderr).
2. `SINDLISH_CANONICAL_DIR` is set to that path and `check.js` runs.

If the fetch fails, the job fails before the comparison -- loudly, not by
accident.

## Shape

- `staleness.js` -- pure logic: path normalisation, per-file SHA-256 (CRLF
  normalised so Windows and Linux agree), manifest comparison, report
  formatting. No filesystem, no network.
- `validate.js` -- reads both trees from disk, maps a drift report onto the
  docs-check error shape `{ kind, file, line, raw, message }`.
- `check.js` -- CLI entry point (`npm run check:interpreter`).
- `fetch-canonical.sh` -- the thin CI step that materialises the canonical tree.
- `__tests__/interpreter-staleness.test.js` -- Vitest coverage of the pure
  logic plus a real-file drift demonstration. **No network.**

## Note on the ref

Comparing against `main` is intentional: a new upstream commit should fail the
site build until the bundle is re-synced. Pin `SINDLISH_CANONICAL_REF` to a
tag or commit when a reproducible run is needed.
