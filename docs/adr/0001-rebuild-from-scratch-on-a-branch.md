# Rebuild the UI from scratch on a branch and cut over atomically

The Sindlish site is a Neon-era UI wearing Sindlish content, and the rebuild replaces the UI wholesale rather than restyling it. We do that on a long-lived `rebuild` branch off `main`: the branch's first act is a kill sweep that deletes the entire old UI and its scaffolding, then a fresh `create-next-app` scaffold stands the site up again, then the five surviving routes are rebuilt against the design decisions already recorded on the tracker. The cutover is a single merge of `rebuild` into `main`. This is the "strangler on a branch" option from the deletion-order ticket, chosen over the two incremental alternatives.

## Considered options

- **Big bang on `main`** — delete the old UI and rebuild in place. Rejected: it ships a broken `main` and a broken live site for the entire duration, when the whole point is to never sit in a broken state.
- **Strangler on `main`** — land the new shell route-by-route, each merge deployable. Rejected: the old token layer (a 426-line `tailwind.config.js` with 18 imported style partials) and the new one (a single Tailwind 4 `@theme` layer built on `light-dark()`) are mutually incompatible, so this forces both to compile and coexist for the whole transition, and leaves every page half-restyled while it holds. The coexistence cost is precisely what the branch avoids.
- **From-scratch on a long-lived branch, atomic cutover** — chosen.

## Consequences

- `main` and the live site are untouched until the cutover merge. The `rebuild` branch is intentionally non-deployable in places; that is the price of the clean cutover.
- The branch re-creates `.github/workflows/` from scratch and regenerates the `process-md-for-llms` snapshot as a migration step inside the branch, so the schema change never reaches CI as a surprise.
- No redirects are needed: every surviving route (`/`, `/docs/*`, `/playground`, `/download`, `/creator`) keeps its URL, and every deleted route was never live.
- The rebuild order runs only up to the still-open workbench and mascot decisions; it cannot sequence past them.
