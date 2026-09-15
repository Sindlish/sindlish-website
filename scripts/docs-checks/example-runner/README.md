# example-runner

Verifies every Sindlish example in the docs against the real interpreter.

## What it does

Extracts every ```sd fenced code block in `content/docs/**/*.md` and
runs it through `Interpreter.run_source(code, is_repl=True)` using the bundled
interpreter in `public/interpreter/` -- the exact bundle the in-browser Run
button loads. No transpiler, no mock, no pyodide; just the real interpreter.

## Run

```bash
npm run check:examples                  # check content/docs (default)
python scripts/docs-checks/example-runner/run_examples.py --dir path/to/other
```

Exits non-zero if any example fails.

## Example tiers

| Tier | How it is marked | Required outcome |
| ---- | ---------------- | ---------------- |
| Teaching | plain ` ```sd ` | runs clean AND output matches the following labeled block (or `# Prints:`) |
| Error demo | plain ` ```sd ` with an expected-error labeled block | interpreter output matches the labeled block (error text is part of stdout/stderr) |
| Illustrative | `` ```sd illustrative `` in the fence, or a `<!-- run:skip -->` comment on the line above the fence | skipped; always allowed to differ |
| Reference | any non-`sd` fence (` ```py `, signature fragments, etc.) | never run |

## Declaring expected output

Two forms, each optional. If neither is present, the example must still run
clean (no error).

1. **Labeled output block** directly after the code (blank lines allowed):

   ````md
   ```sd
   likh(1 + 2)
   ```

   ```txt filename="Output"
   3
   ```
   ````

   The labeled block's language is irrelevant; only the `filename=` value
   matters (`Output`, `Terminal`, or `Console`). Its content is compared
   against the interpreter's captured stdout + stderr (ANSI stripped, trimmed).

2. **`# Prints:` one-liner**, for trivial cases:

   ````md
   ```sd
   likh(10)
   # Prints: 10
   ```
   ````

## Skipping genuinely non-runnable examples

Infinite loops, weekday-dependent output, and interactive `puch()` demos must
be marked so the runner skips them:

````md
```sd illustrative
jistain sach {
    likh(1)
}
```
````

or

````md
<!-- run:skip -->
```sd
naalo = puch("Tawaan jo naalo cha aahe? ")
```
````

Skipped examples are reported but never fail the run. Prefer `illustrative`
for shape-explanations; reserve `<!-- run:skip -->` for examples you cannot
make deterministic.

## Timeout

Each example runs in a child process with a 10-second hard timeout, so an
unmarked infinite loop fails the run instead of hanging CI.

## Reporting

A per-example status line: `PASS`/`FAIL`/`SKIP` with file, line, and expected
vs. actual on mismatch. Exit code is non-zero when any example failed.
