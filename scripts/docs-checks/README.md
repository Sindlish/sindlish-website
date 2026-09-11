# docs-checks

Validate `content/**/*.md` against authoritative sources. Each check is self-contained in its own subfolder.

## Run

```bash
npm run check:docs              # all checks
```

Exits non-zero on any validation error.

## Checks

None currently. Previous Neon-specific checks (e.g. `neonctl`) were removed with the Neon content.

## Add a new check

1. Create `scripts/docs-checks/<name>/` with:

   ```text
   <name>/
     README.md
     validate.js             # exports validate() -> { invocations, errors }
     __tests__/
       <name>-docs.test.js   # asserts errors.length === 0
   ```

2. Each error must be `{ kind, file, line, raw, message }`.
3. Add to `package.json`:

   ```json
   "check:docs:<name>": "vitest run scripts/docs-checks/<name>/__tests__/<name>-docs.test.js"
   ```

   `check:docs` picks it up via glob.

## Shared helpers

None yet. When a second check arrives, lift duplicated code into
`scripts/docs-checks/_lib/`. Don't pre-abstract.
