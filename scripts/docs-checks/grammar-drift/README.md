# grammar-drift

The build gate that keeps the site's one TextMate grammar honest.

Sindlish syntax is defined once, in the interpreter. The interpreter's own
generator (`tools/generate_grammar.py`) compiles `frontend/keywords.py`, the
builtins and the object methods into `sindlish.tmLanguage.json`. This website
commits that generated artifact at
[`src/lib/grammars/sindlish.tmLanguage.json`](../../../src/lib/grammars/sindlish.tmLanguage.json)
and colours both the docs (Shiki) and the workbench editor (Monaco) from it.

This check re-runs the generator against the site's **bundled** interpreter
(`public/interpreter/` -- the very copy the in-browser Run button executes) and
fails when the output differs from the committed artifact. Without it the docs
could highlight a keyword the language dropped, or miss one it gained.

## Canonical source

|                  |                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Repository       | [`Sindlish/Sindlish`](https://github.com/Sindlish/Sindlish) (public)                       |
| Generator        | `tools/generate_grammar.py` (upstream git blob `ecb6797f4a12d5558d0a8b04a5afaed773821d13`) |
| Interpreter      | `interpreter/` in that repository                                                          |
| Bundled copy     | `public/interpreter/` (kept current by `npm run check:interpreter`)                        |
| Committed output | `src/lib/grammars/sindlish.tmLanguage.json`                                                |

The generator is vendored **verbatim** at `generate_grammar.py`. It imports
`interpreter` from its parent directory and writes to `../vscode-extension/`,
so the gate stages a throwaway tree of exactly that shape and runs it there;
the vendored copy is never edited.

## Run

```bash
npm run check:grammar            # fail on drift
npm run check:grammar -- --write # regenerate the committed artifact
```

`check.js`:

- exits `1` on drift, naming the first differing path;
- exits `2` when it cannot run at all (Python missing, generator failure) --
  it never passes silently on an unrun comparison.

Python 3 is required (the generator is Python). Set `SINDLISH_PYTHON` to pick a
specific interpreter.

## Shape

- `grammar-drift.js` -- pure logic: JSON parsing, key-order-insensitive
  canonicalisation, first-difference path, report formatting. No filesystem, no
  network, no process spawning.
- `validate.js` -- reads disk, stages the generator tree, spawns Python, maps a
  drift report onto the docs-check error shape `{ kind, file, line, raw,
message }`. Accepts an injected `generate` function so it is testable without
  Python.
- `check.js` -- CLI entry point (`npm run check:grammar`).
- `generate_grammar.py` -- the canonical generator, vendored verbatim.
- `__tests__/grammar-drift.test.js` -- Vitest coverage of the pure logic plus a
  real-file drift demonstration. The Python-backed run is skipped when Python
  is unavailable, so the Node-only unit-test job stays green.

## Note on `--write` and the ref

The gate proves the committed grammar matches **the bundle**, not upstream
`main`. The bundle is kept current by the interpreter-staleness gate (#46), so
the two together mean: bundled == canonical, and committed == bundled output.
