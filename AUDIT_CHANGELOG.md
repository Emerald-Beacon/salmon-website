# SEO & Site-Health Remediation — Changelog

Branch: `fix/seo-site-health-audit` (off `main`). No deploy/push/merge performed.

---

## Phase 0 — Discovery (findings)

**Stack:** Static HTML with a Node build pipeline. `scripts/build.mjs` inlines shared
partials (`assets/partials/{nav,footer,cta,head-scripts}.html`) back into each source
`index.html` via `<!-- PARTIAL:name:start/end -->` region markers; `scripts/stage-public.mjs`
copies the deployable subset into `dist/`; Netlify publishes `dist/`. Build command (from
`netlify.toml`): `build.mjs → generate-related-posts.mjs → generate-redirects.mjs →
generate-sitemap.mjs → stage-public.mjs`.

**Page inventory:** 189 `index.html` pages scanned by `scripts/audit-inventory.mjs`
(read-only; full table in `page-inventory.md`).

### Key result: the external audit is substantially STALE
Most defects it named were already fixed in the repo. Verified current state:

| Audit claim | Repo reality (2026-06-10) |
|---|---|
| Old pages missing canonical | Only `/commercial-portfolio/` (robots `Disallow`-ed) |
| Missing meta descriptions | 0 pages |
| Missing OG/Twitter | `/commercial-portfolio/` and `/thank-you/` only |
| Missing GTM (`GTM-593W9BPW`) | `/commercial-portfolio/` only |
| ac-repair / centerville / blog = "old template" | All have canonical+desc+OG+GTM+current nav |
| Nav missing Water Heaters / Financing | Present everywhere except `/commercial-portfolio/` |
| "46 years" claim | 0 occurrences (already standardized to 47) |
| ac-repair malformed city list | Already correct `<li>` structure; already links all 5 newer areas |
| 5 newer areas missing from sitemap | All 5 present in `sitemap.xml` |

### Genuinely-remaining issues (the actual work)
1. **Nav + footer partials omitted 7 area pages** from sitewide navigation — the 5 named
   (West Jordan, Draper, North Salt Lake, Woods Cross, West Bountiful) **plus Clinton and
   Syracuse**, which were even more orphaned (not on the homepage either). → Workstream 1.
2. **No `BlogPosting` JSON-LD** on any blog post (~137). → pending.
3. **No 404 page** (no `404.html`, no host config). → pending.
4. **11 homepage partner logos hotlinked** from third-party servers. → pending.
5. Low-stakes: `/commercial-portfolio/` (fully old, but `Disallow`-ed) and `/thank-you/`
   (no OG/Twitter — noindex confirmation page). → flagged.

**Crawl infra:** `robots.txt` exists, references absolute sitemap, `Disallow: /commercial-portfolio/`.
`sitemap.xml` present and includes all 23 areas + both rebate posts. `_redirects` +
`netlify.toml` redirects present. No `404.html`. Favicon handled via redirect of
`/favicon.ico` → logo PNG.

**Note on inventory script:** an early version's description regex truncated at apostrophes
("Utah's" → "Utah"), producing false "duplicate description" and length-outlier counts. Fixed
(`content="([^"]*)"`); corrected run shows **0 duplicate descriptions**.

---

## Workstream 1 — Sitewide nav + footer area reachability (Phase 2.3)

**Goal:** every `/areas/...` page reachable from sitewide navigation.

**Changed (source partials):**
- `assets/partials/nav.html` — added to Service Areas dropdown:
  - Davis County: North Salt Lake, West Bountiful, Woods Cross, Clinton, Syracuse
  - Salt Lake County: West Jordan, Draper
- `assets/partials/footer.html` — added the same 7 cities to the Service Areas list.

**Propagated:** `node scripts/build.mjs` re-synced the partials into all **188** marker-bearing
pages (exactly +14 lines each: 7 nav + 7 footer; 0 deletions; no drift — verified via
`git diff`). The only page not updated is `/commercial-portfolio/` (no partial markers,
`Disallow`-ed).

**Verified:** all 23 area pages now appear in both nav and footer sitewide; inventory
re-run shows West Jordan link gap reduced from 170 pages → 1 (commercial-portfolio).

**Decision recorded:** included Clinton + Syracuse beyond the 5 named pages because Phase 2.3's
explicit requirement is that *every* area page be reachable, and those two were fully orphaned.
