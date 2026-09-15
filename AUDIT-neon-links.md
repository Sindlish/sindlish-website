# Dead Links, Broken URLs & Missing Mailto Audit

**Date:** 2026-09-10
**Scope:** Full codebase at D:\Code\sindlish-website
**Purpose:** Find every Neon-domain link that will break or is already wrong during rebranding to Sindlish.

---

## Summary Counts

| Category | Count | Priority |
|---|---|---|
| External Neon domain links | ~350+ unique occurrences | HIGH |
| Config/hardcoded Neon URLs | ~25 files | CRITICAL |
| mailto: links (Neon addresses) | 8 unique emails | CRITICAL |
| mailto: gaps (missing contacts) | 3 locations need new mailto | MEDIUM |
| Broken internal references | ~5 | HIGH |
| Package dependencies (@neondatabase) | 2 packages + 30+ component refs | LOW |

---

## 1. CONFIG / HARDCODED NEON URLs (CRITICAL — Fix first)

These files define site-wide constants and will poison every URL the site generates.

| File | Line | URL/Reference | Disposition |
|---|---|---|---|
| `next.config.js:2075` | 2075 | `https://api-docs.neon.tech` (redirect) | UPDATE |
| `next.config.js:2080` | 2080 | `https://api-docs.neon.tech/v2` (redirect) | UPDATE |
| `next.config.js:2090` | 2090 | `https://trust.neon.com` (redirect) | UPDATE |
| `next.config.js:2116` | 2116 | `https://console.neon.tech/signup` (redirect) | UPDATE |
| `next.config.js:2277` | 2277 | `https://neon.com/docs/guides/platform-integration-overview` | UPDATE |
| `next.config.js:2338` | 2338 | `https://get.neon.com/student-25` (redirect) | UPDATE |
| `next-sitemap.config.js:2` | 2 | `'https://neon.com'` (siteUrl fallback) | UPDATE |
| `next-sitemap-postgres.config.js:2` | 2 | `'https://neon.com'` (siteUrl fallback) | UPDATE |
| `.env.example:3` | 3 | `WP_GRAPHQL_URL=https://neondatabase.wpengine.com/graphql` | UPDATE |
| `.env.example:10` | 10 | `NEXT_PUBLIC_NEON_STATUS_API=https://7687492087503394.hostedstatus.com/...` | UPDATE |
| `.env.example:12` | 12 | `INKEEP_ORGANIZATION_ID=neon` | UPDATE |
| `src/constants/links.js:23` | 23 | `cdn: 'https://cdn.neonapi.io'` | UPDATE |
| `src/lib/inkeep-settings.js:4` | 4 | `const BASE_URL = 'https://neon.com'` | UPDATE |
| `src/app/api/docs-feedback/route.js:3` | 3 | `NEONAPI_TRACK_URL = 'https://neonapi.io/t.js'` | UPDATE |
| `src/app/api/docs-feedback/route.js:4` | 4 | `SITE_URL = 'https://neon.com'` | UPDATE |
| `src/proxy.js:58` | 58 | `fetch('https://neonapi.io/t.js', ...)` | UPDATE |
| `src/utils/get-github-data.js:1` | 1 | `API_URL = 'https://api.github.com/repos/neondatabase/neon'` | UPDATE |
| `src/scripts/process-md-for-llms.js:1227` | 1227 | `https://neon.com${link}` | UPDATE |
| `src/scripts/process-md-for-llms.js:1480` | 1480 | `const BASE_URL = 'https://neon.com'` | UPDATE |
| `src/scripts/llms-index-config.js` | 30-285 | 20+ `https://neon.com/...` URLs | UPDATE |
| `src/scripts/generate-llms-index.js:23` | 23 | `const BASE_URL = 'https://neon.com'` | UPDATE |
| `src/scripts/generate-llms-full.js:30` | 30 | `const BASE_URL = 'https://neon.com'` | UPDATE |
| `src/scripts/generate-legacy-llms-output.js:113` | 113 | `https://neon.com/docs/...` | UPDATE |
| `src/scripts/compare-md-conversion.js:54` | 54 | `https://neon.com/${urlPath}` | UPDATE |
| `src/scripts/check-pricing-sync.js:931-941` | 931-941 | Multiple `https://neon.com/...` | UPDATE |
| `content/config/topbar.yaml:3` | 3 | `https://neon.com/docs/changelog/2026-03-13` | UPDATE |
| `context7.json:2` | 2 | `https://context7.com/neondatabase/website` | UPDATE |
| `public/security.txt:1` | 1 | `Contact: mailto:security@neon.tech` | UPDATE |
| `public/security.txt:4` | 4 | `Policy: https://neon.com/security` | UPDATE |

---

## 2. MAILTO: LINKS (CRITICAL — All point to Neon employees)

### Existing mailto: addresses

| File | Line | Email | Disposition |
|---|---|---|---|
| `src/components/pages/startups/hero/contact-form/contact-form.jsx` | 31 | `mailto:atli@neon.tech` | UPDATE (Neon employee) |
| `src/components/pages/contact-sales/hero/contact-form/contact-form.jsx` | 32 | `mailto:atli@neon.tech` | UPDATE (Neon employee) |
| `src/components/pages/security/trust-center/trust-center.jsx` | 57 | `mailto:security@neon.tech` | UPDATE |
| `content/docs/security/security-reporting.md` | 14, 37 | `mailto:security@neon.tech` | UPDATE |
| `content/docs/security/security-overview.md` | 137 | `mailto:security@neon.tech` | UPDATE |
| `content/docs/security/compliance.md` | 49 | `mailto:security@neon.tech` | UPDATE |
| `content/docs/security/compliance.md` | 50 | `mailto:privacy@databricks.com` | Keep (Databricks parent) |
| `public/security.txt` | 1 | `mailto:security@neon.tech` | UPDATE |
| `content/docs/unused/using-branches.md` | 7 | `mailto:iwantbranching@neon.tech` | DELETE (unused page) |
| `content/changelog/2022-11-04.md` | 22 | `mailto:iwantbranching@neon.tech` | Keep (historical changelog) |
| `content/changelog/2022-08-31.md` | 8 | `mailto:partnerships@neon.tech` | Keep (historical changelog) |
| `content/changelog/2022-08-04.md` | 12 | `mailto:iwantbranching@neon.tech` | Keep (historical changelog) |

### Places where mailto: SHOULD exist but doesn't

| Location | Gap | Suggested Fix |
|---|---|---|
| Footer (no contact email) | No general contact email visible site-wide | Add `mailto:support@sindlish.com` or equivalent |
| `content/docs/introduction/support.md` | Support page likely has no email, only docs links | Add contact email |
| `content/pages/hipaa-contractors.md:28` | References privacy policy but no contact email for BAA inquiries | Add contact email |

---

## 3. EXTERNAL NEON DOMAIN LINKS IN CONTENT (HIGH — ~300+ occurrences)

### 3a. `neon.com` links in content/marketing pages

**Total: ~120+ occurrences across content/pages/, content/branching/, content/postgresql/**

Key affected files (not exhaustive):

| File | Count | Examples |
|---|---|---|
| `content/pages/use-cases/fast-dev-workflows.md` | 30+ | `neon.com/docs/...`, `neon.com/pricing`, `neon.com/signup` |
| `content/pages/use-cases/variable-load.md` | 12 | `neon.com/autoscaling-report`, `console.neon.tech/signup` |
| `content/pages/use-cases/ai-agents.md` | 30+ | `neon.com/programs/agents`, `neon.com/blog/...` |
| `content/pages/use-cases/database-per-user.md` | 10 | `neon.com/docs/introduction/architecture-overview` |
| `content/pages/use-cases/database-per-tenant.md` | 2 | `fyi.neon.tech/credits` |
| `content/pages/use-cases/dev-test.md` | 8 | `fyi.neon.tech/credits`, `console.neon.tech/signup` |
| `content/pages/use-cases/postgres-for-saas.md` | 2 | `fyi.neon.tech/credits` |
| `content/pages/faster.md` | 2 | `console.neon.tech/signup` |
| `content/pages/storage.md` | 1 | `console.neon.tech/signup` |
| `content/pages/platform-terms.md` | 4 | `neon.com/docs/introduction/plans`, `neon.com/subprocessors` |
| `content/pages/autoscaling-report.md` | 1 | `neon.com/docs/guides/autoscaling-algorithm` |
| `content/pages/subprocessors.md` | 4 | `neon.tech/dpa`, `neon.tech/privacy-policy` |
| `content/pages/hipaa-contractors.md` | 1 | `neon.tech/privacy-policy` |
| `content/pages/programs/agents.md` | 1 | `neon.com/docs/guides/platform-integration-intro` |
| `content/branching/*.md` (6 files) | 30+ | `neon.com/docs/...`, `neon.com/blog/...`, `api-docs.neon.tech` |

**Disposition for all: UPDATE** — Replace with Sindlish equivalents or remove if the page doesn't exist in Sindlish's product.

### 3b. `neon.com` / `neon.tech` links in `content/docs/`

**Total: ~80+ occurrences across docs/**

Key affected areas:

| Area | Files | Count | Primary URL patterns |
|---|---|---|---|
| `content/docs/ai/` | 5 files | 30+ | `api-docs.neon.tech`, `mcp.neon.tech`, `console.neon.tech` |
| `content/docs/data-api/` | 5 files | 40+ | `console.neon.tech/api/v2/...`, `api-docs.neon.tech`, `neonauth.*.neon.tech` |
| `content/docs/connect/` | 3 files | 5 | `pg.neon.tech`, `console.neon.tech`, `api-docs.neon.tech` |
| `content/docs/community/` | 4 files | 15+ | `neon.com/docs/...`, `github.com/neondatabase/website`, `console.neon.tech` |
| `content/docs/workflows/` | 2 files | 15+ | `api-docs.neon.tech`, `console.neon.tech/api/v2/...` |

**Disposition: UPDATE** — These docs pages are the core content; every Neon URL must become a Sindlish URL.

### 3c. `neon.com` / `neon.tech` links in `content/guides/`

**Total: ~100+ occurrences across 40+ guide files**

Every guide file contains multiple references to:
- `console.neon.tech/signup` — signup links
- `console.neon.tech` — Neon Console references
- `api-docs.neon.tech` — API reference links
- `mcp.neon.tech/mcp` — MCP server URLs
- `neon.com/...` — various doc and blog links
- `*.neon.tech` — connection string examples

**Disposition: UPDATE** — All guides need Sindlish equivalents.

### 3d. `neon.com` links in `content/postgresql/`

**Total: ~60+ occurrences across 60+ tutorial files**

Pattern: Every PostgreSQL tutorial has an intro paragraph with:
- `https://neon.com` (Neon platform mention)
- `https://neon.com/postgresqltutorial/dvdrental.zip` (sample database download — **BROKEN**, see section 4)

**Disposition: UPDATE** for platform references. The `dvdrental.zip` download link is **BROKEN** — it points to `neon.com/postgresqltutorial/dvdrental.zip` which likely won't exist.

---

## 4. BROKEN INTERNAL REFERENCES (HIGH)

| File | Line | Reference | Issue | Disposition |
|---|---|---|---|---|
| `content/postgresql/getting-started/install-postgresql-linux.md` | 144 | `https://neon.com/postgresqltutorial/dvdrental.zip` | Broken download link — `neon.com/postgresqltutorial/` path doesn't exist on a rebranded site | FIX or UPDATE |
| `content/docs/community/component-specialized.md` | 55 | `https://raw.githubusercontent.com/neondatabase/neon/master/README.md` | Points to Neon's GitHub repo, not Sindlish | UPDATE |
| `content/docs/community/component-specialized.md` | 78 | `console.neon.tech` | Signup link | UPDATE |
| `content/docs/unused/using-branches.md` | 7 | `mailto:iwantbranching@neon.tech` | Unused page, but mailto is Neon-specific | DELETE (entire file is unused) |
| `content/docs/connect/passwordless-connect.md` | 21, 29 | `pg.neon.tech`, `console.neon.tech/psql_session/...` | Neon-specific connection endpoint | UPDATE |
| `content/docs/connect/connection-latency.md` | 27 | `api-docs.neon.tech/reference/getting-started-with-neon-api` | API docs link | UPDATE |

---

## 5. PACKAGE DEPENDENCIES (@neondatabase) (LOW — Won't break site, but wrong branding)

| File | Line | Reference | Disposition |
|---|---|---|---|
| `package.json:42` | 42 | `"@neondatabase/api-client": "^1.12.0"` | Keep (functional dependency) |
| `package.json:43` | 43 | `"@neondatabase/serverless": "^0.10.4"` | Keep (functional dependency) |
| `src/components/shared/sql-to-rest-converter/sql-to-rest-converter.jsx` | 22, 25, 42 | `@neondatabase/neon-js`, `@neondatabase/postgrest-js` | Keep (code example) |
| `content/docs/data-api/*.md` | multiple | `@neondatabase/neon-js`, `@neondatabase/postgrest-js` | Keep in code samples (npm packages) |
| `config/monitored-repos.json` | 35-159 | 15+ `neondatabase/*` GitHub repos | Keep if monitoring Neon repos |

---

## 6. COMPONENT-LEVEL NEON REFERENCES (HIGH — Visible to users)

| File | Line | Reference | Disposition |
|---|---|---|---|
| `src/components/shared/features-cards/features-cards.jsx` | 24 | `https://mcp.neon.tech/` | UPDATE |
| `src/components/pages/doc/actions/actions.jsx` | 90 | `https://mcp.neon.tech/mcp` | UPDATE |
| `src/components/pages/faqs/programmatic-cta/programmatic-cta.jsx` | 9 | `https://github.com/neondatabase/website/issues` | UPDATE |
| `src/components/pages/report/recovery-solution/recovery-solution.jsx` | 50 | `https://fyi.neon.tech/branching` | UPDATE |
| `src/components/pages/cli/features/features.jsx` | 29 | `https://github.com/neondatabase/neonctl` | UPDATE |
| `src/components/pages/demos/demo-list/demo-list.jsx` | 16-210 | 15+ `github.com/neondatabase/*` links | UPDATE |
| `src/components/pages/home/speed-scale/features/manage-fleet/data.js` | 36-37 | `https://api.neon.tech/v2/...`, `*.neon.tech` connection string | UPDATE |

---

## 7. TEST FILES WITH NEON URLs (MEDIUM — Won't affect production, but misleading)

| File | Occurrences | Primary URLs |
|---|---|---|
| `src/middleware.test.js` | 10 | `neon.com`, `neonapi.io/t.js` |
| `src/app/api/docs-feedback/route.test.js` | 8 | `neon.com`, `neonapi.io/t.js` |
| `src/scripts/process-md-for-llms.test.js` | 40+ | `neon.com/docs/...` |

**Disposition: UPDATE** — Tests should reflect the rebranded URLs.

---

## 8. NPM PACKAGE REFERENCES IN CONTENT (LOW — Expected in code samples)

These are npm package names (`@neondatabase/serverless`, `@neondatabase/neon-js`, etc.) used in code examples. They are functional references to real packages and should **stay as-is** in code samples — they're not branding, they're dependency names.

Appears in: `content/docs/data-api/*.md`, `content/docs/connect/*.md`, `src/scripts/fixtures/mdx-conversion-test.md`

---

## 9. GITHUB ORG REFERENCES (MEDIUM)

| Context | Count | Disposition |
|---|---|---|
| `github.com/neondatabase/website` (repo links in contribution docs) | 15+ | UPDATE to Sindlish repo |
| `github.com/neondatabase/neonctl` (CLI tool links) | 5+ | Keep if still using Neon's CLI |
| `github.com/neondatabase/examples` (template links in src/utils/data/templates.js) | 25+ | UPDATE |
| `github.com/neondatabase-labs/*` (demo repos) | 5+ | UPDATE |
| `config/monitored-repos.json` | 15 repos | Keep if monitoring Neon repos for comparison |

---

## PRIORITY ACTION PLAN

### Phase 1: CRITICAL (Blocking)

1. Update `src/constants/links.js` CDN URL
2. Update `.env.example` — remove `neondatabase.wpengine.com`, `hostedstatus.com`, `INKEEP_ORGANIZATION_ID=neon`
3. Update `next.config.js` redirect destinations (6 external Neon URLs)
4. Update `next-sitemap.config.js` and `next-sitemap-postgres.config.js` siteUrl fallbacks
5. Update `src/app/api/docs-feedback/route.js` — SITE_URL and NEONAPI_TRACK_URL
6. Update `src/proxy.js` — neonapi.io tracking URL
7. Update `src/lib/inkeep-settings.js` — BASE_URL
8. Update `public/security.txt` — contact email and policy URL
9. Replace all `mailto:atli@neon.tech` in contact forms with new contact email
10. Replace all `mailto:security@neon.tech` with new security contact

### Phase 2: HIGH (User-facing)

11. Update `src/components/` — all Neon URLs in JSX components
12. Update `content/config/topbar.yaml` — topbar link
13. Update `content/pages/` — all marketing/use-case pages (~50 URLs)
14. Update `content/branching/` — all branching content pages (~30 URLs)
15. Update `content/docs/` — all documentation references (~80 URLs)
16. Update `content/guides/` — all guide files (~100 URLs)
17. Fix broken `dvdrental.zip` download link in postgresql tutorial

### Phase 3: MEDIUM (Scripts & build)

18. Update all LLM processing scripts — BASE_URL constants (6 files)
19. Update `src/scripts/llms-index-config.js` — all indexed URLs
20. Update `context7.json`
21. Update test files to match new URLs

### Phase 4: LOW (Can defer)

22. Keep `@neondatabase/*` npm package names in code samples
23. Keep `config/monitored-repos.json` if intentionally monitoring Neon
24. Keep historical changelog mailto references (they're archived entries)
