# Rebuild task graph (spec #44)

The coordination artifact for the from-scratch rebuild. Spec and full ticket text live on GitHub; this file is the map of what blocks what.

- **Spec (source of truth):** [#44 Rebuild the Sindlish site from scratch](https://github.com/Sindlish/sindlish-website/issues/44)
- **Delivery:** long-lived `rebuild` branch off `main`, single atomic cutover, every surviving URL unchanged except `/playground` → 308 → `/workbench` (query preserved).
- **Before you start a ticket:** read the spec, the ticket, and the exploration notes referenced by the ticket. Do not duplicate the spec in code comments.

## Task graph

```
T1 (#45) tokens/shell ─┬► T4 (#50) rendering ─► T5 (#51) docs shell ─┬► T7 (#53) search ─────────┐
                       │                                            ├► T8 (#54) workbench ─► T9 (#56) monaco ─┤
                       │                                            └► T14 (#52) build gates                  │
                       └► T6 (#48) home/quiet ─► T11 (#49) art ─► T10 (#55) metadata ─► T12 (#57) deletions ─┤
                                                                                                            ▼
                                                                              T13 (#58) playwright + cypress gone

T3 (#46) staleness gate ─► T2 (#47) grammar/glosses/drift gate ─► T4, T9
```

| ID  | Issue | Title | Blocked by |
|-----|-------|-------|-----------|
| T1  | #45 | Token layer, fonts, global shell primitives | — |
| T3  | #46 | Interpreter staleness gate + example-runner CI | — |
| T2  | #47 | One TextMate grammar artifact, glosses, drift gate | #46 |
| T4  | #50 | Content rendering: four fences, Admonition, Steps, code a11y | #45, #47 |
| T6  | #48 | Homepage, /download, /creator, quiet pages | #45 |
| T11 | #49 | Mascot art, favicon set, manifest, default OG image | #48 |
| T5  | #51 | Docs shell: pillar sidebar, drawer, prev/next, /docs index | #50 |
| T7  | #53 | Build-time search index + /search route | #51 |
| T8  | #54 | /workbench split with routed docs pane | #50, #51 |
| T14 | #52 | Blocking build gates + manual a11y checklist | #50, #51, #49 |
| T9  | #56 | Monaco over the real language server | #47, #54 |
| T10 | #55 | Metadata, sitemap, robots, structured data, md twins | #51, #48, #49 |
| T12 | #57 | Delete inherited cloud services; Vercel Analytics only | #48, #54, #55 |
| T13 | #58 | Playwright suite vs prod build; Cypress gone | #53, #54, #56, #55, #57 |

## Gates (spec: "The five blocking gates")

1. Examples run against the bundled interpreter + staleness comparison — T3 (#46)
2. Internal links resolve (linkinator, internal only) — T14 (#52)
3. Docs object to nothing absent — T14 (#52)
4. Visual regression on key pages — T13 (#58)
5. Navigation stays in sync with the corpus — T14 (#52)
