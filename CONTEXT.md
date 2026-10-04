# Sindlish website glossary

Canonical terms for the Sindlish documentation effort. A glossary only; decisions and specs live on the issue tracker.

## Language and docs

- **Sindlish**: a programming language with Romanized Sindhi keywords, interpreted by a Python VM.
- **The real interpreter**: the authoritative interpreter source at `D:\code\Sindlish` (outside this repo).
- **Bundled interpreter**: the synced copy at `public/interpreter/`. The Run button and the example harness load this copy, so it must match the real interpreter for behavior.
- **Romanized Sindhi keywords**: keyword names transliterated from Sindhi (`likh`, `agar`, `fehrist`, `silsilo`, ...). Backticked in docs; glossed in English on first use.
- **Diátaxis pillars**: the four doc modes used as nav sections — Learn (tutorials), How-to guides, Reference, Concepts (explanation).
- **Tutorial ladder**: the single dependency-ordered sequence of Learn pages, linked by "Next up".

## Brand

- **Ajrak**: the Sindhi resist-printed textile whose palette grounds the site's colours. Its indigo is the link and interactive colour, in a light and a dark value.
- **Brand red**: Sindlish red, reserved for the logo, the mascot, and the homepage hero. Never a text colour, and never the colour of a link: on a dark surface it does not carry enough contrast to be readable.

## Example verification

- **Example harness** (also "example runner"): the tool that executes every `.sd` code block in the docs against the bundled interpreter and reports pass/fail. The bar for releasing docs.
- **Run-clean**: the minimum verification tier — `Interpreter.run_source(code, is_repl=True)` completes with no unhandled exception.
- **Asserted output**: the stricter tier — the interpreter's stdout must exactly match a labeled expected-output block following the example.
- **Expected-output block**: a labeled code block after a runnable example, holding the interpreter's real output (or error text) for that example.
- **Illustrative block**: a `.sd` block explicitly marked not-to-run (shape-explanation of the Result model or error classes). Skipped by the harness but reported, so skipping stays a conscious choice.
- **Reference fragment**: a signature snippet in a Reference lookup page (e.g. `fehrist.wadha(x)`). Never run; illustrative by default.
- **The Run button**: the site control that loads the bundled interpreter via pyodide and executes a `.sd` block, showing stdout and stderr in a terminal-style panel.
- **Fence vocabulary**: the four code-fence info strings that make up the entire authoring API for docs — `sd` (runnable example), `sd illustrative` (not runnable), `txt filename="Output"` (expected-output block), and `bash`. The only two components authors also have are **Admonition** and **Steps**; a component joins that set only when a real page needs it.
- **Workbench**: the rebuilt `/playground`, a split view with a rendered docs page on one side and the Sindlish editor plus its output on the other, so an example can be read, taken into the editor, changed and run without leaving the page. Distinct from the Run button, which executes a single block where it sits.
- **Expected-output block, always visible**: the rule that an expected-output block renders in the page like any other code block rather than being revealed by pressing Run. It keeps the docs teaching correctly with JavaScript off, in a screenshot, and to the agents reading the `.md` and llms.txt surfaces. Run verifies; it does not reveal.