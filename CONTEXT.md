# Sindlish website glossary

Canonical terms for the Sindlish documentation effort. A glossary only; decisions and specs live on the issue tracker.

## Language and docs

- **Sindlish**: a programming language with Romanized Sindhi keywords, interpreted by a Python VM.
- **The real interpreter**: the authoritative interpreter source at `D:\code\Sindlish` (outside this repo).
- **Bundled interpreter**: the synced copy at `public/interpreter/`. The Run button and the example harness load this copy, so it must match the real interpreter for behavior.
- **Romanized Sindhi keywords**: keyword names transliterated from Sindhi (`likh`, `agar`, `fehrist`, `silsilo`, ...). Backticked in docs; glossed in English on first use.
- **Diátaxis pillars**: the four doc modes used as nav sections — Learn (tutorials), How-to guides, Reference, Concepts (explanation).
- **Tutorial ladder**: the single dependency-ordered sequence of Learn pages, linked by "Next up".

## Example verification

- **Example harness** (also "example runner"): the tool that executes every `.sd` code block in the docs against the bundled interpreter and reports pass/fail. The bar for releasing docs.
- **Run-clean**: the minimum verification tier — `Interpreter.run_source(code, is_repl=True)` completes with no unhandled exception.
- **Asserted output**: the stricter tier — the interpreter's stdout must exactly match a labeled expected-output block following the example.
- **Expected-output block**: a labeled code block after a runnable example, holding the interpreter's real output (or error text) for that example.
- **Illustrative block**: a `.sd` block explicitly marked not-to-run (shape-explanation of the Result model or error classes). Skipped by the harness but reported, so skipping stays a conscious choice.
- **Reference fragment**: a signature snippet in a Reference lookup page (e.g. `fehrist.wadha(x)`). Never run; illustrative by default.
- **The Run button**: the site control that loads the bundled interpreter via pyodide and executes a `.sd` block, showing stdout and stderr in a terminal-style panel.