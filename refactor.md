# Phase 1 Refactor — Documentation

This document lives on the `refactor` branch and summarises every change made.
It is the **last commit** on the branch and is intentionally isolated so it can
be dropped with `git reset --hard HEAD~1` without affecting anything else.

---

## Hard constraint: visual parity

This is a **backend** refactor. The rendered page must look pixel-identical to
the `main` baseline at steady state on the same viewport. Lazy-loading items
only change *when* things load, not the steady-state look. Nothing in `style.css`
that affects rendered layout was changed, and heading levels were not altered.

---

## Repo layout change (before → after)

```
Before                          After
──────────────────────────────  ──────────────────────────────────────
/ (root)                        / (root)
├── 1_biography.md              ├── data/
├── 2_contacts.md               │   ├── 1_biography.md
├── 3_hiring.md                 │   ├── 2_contacts.md
├── 4_news.md                   │   ├── 3_hiring.md
├── 5_service.md                │   ├── 4_news.md
├── people.json                 │   ├── 5_service.md
├── pubs.json                   │   ├── people.json
├── pubs_preprints.json         │   ├── pubs.json
├── build.js  (GONE)            │   └── pubs_preprints.json
├── aggregate.py (→ python/)    ├── javascript/             (ES modules)
├── javascript/                 │   ├── main.js
│   ├── jquery.js  (GONE)       │   ├── calendar_main.js
│   └── commonmark.js (GONE)    │   ├── markdown.js
└── index.html / calendar.html  │   ├── people.js
                                │   ├── pubs.js
                                │   ├── search.js
                                │   ├── menu.js
                                │   ├── dom.js
                                │   ├── snarkdown.js   (vendored, 3 KB)
                                │   └── types.d.ts
                                ├── python/
                                │   ├── aggregate.py
                                │   └── *.py
                                ├── scripts/               (VR harness)
                                │   ├── snapshot.mjs
                                │   └── visual-diff.mjs
                                ├── snapshots-baseline/    (desktop gate)
                                ├── tsconfig.json  (new)
                                ├── package.json   (new, dev-only)
                                ├── sitemap.xml    (new)
                                └── robots.txt     (new)
```

The deploy workflow stages only the files that belong to the site
(`*.html`, `*.css`, `data/`, `icons/`, `images/`, `javascript/`,
`CNAME`, `.nojekyll`), so `python/`, `scripts/`, `snapshots-baseline/`,
`node_modules/`, `tsconfig.json`, `package.json`, `refactor.md`, etc. are
never shipped to users.

---

## Commit-by-commit changelog

Every commit is independently revertable with `git revert <sha>`.

| ID  | SHA       | What changed | Files touched |
|-----|-----------|--------------|---------------|
| c1  | `08f0aac` | Bump GitHub Actions to `checkout@v4`, `configure-pages@v5`, `upload-pages-artifact@v3`, `deploy-pages@v4`; add staging step that trims the deploy payload | `.github/workflows/pages.yml` |
| c2  | `161f075` | Remove `Cache-Control / Pragma / Expires` meta tags that were forcing a full re-download on every visit | `index.html` |
| c3  | `1bda936` | `git mv` all markdown + JSON into `data/`; update fetch URLs in `index.html` and `build.js`; update `open('pubs.json')` in `python/bib_json_to_bibtex.py` to `open('data/pubs.json')` | `data/*`, `index.html`, `build.js`, `python/bib_json_to_bibtex.py` |
| c5  | `cedbfcf` | Remove jQuery (−146 KB); replace `$(document).ready` with `DOMContentLoaded`, `jQuery.get/getJSON` with `fetch`; delete `javascript/jquery.js` | `build.js`, `index.html`, `calendar.html`, `javascript/jquery.js` |
| c6  | `eacfbad` | Clean `build.js`: `var`→`const`/`let`, declare all implicit globals, `textContent` over `.innerHTML` for JSON-derived text, extract `make_link()` helper, fix `video.muted`/`video.loop`/`video.preload` as DOM properties (not `setAttribute`), drop dead code (`IfUrlExists`, stale comments) | `build.js` |
| c7  | `caa0956` | Split `build.js` into ES modules under `src/`: `main.js`, `markdown.js`, `people.js`, `pubs.js`, `dom.js`, `calendar_main.js`; switch both HTML files to `<script type="module">`; incorporate lazy-image (`loading=lazy`, `decoding=async`, `alt`), lazy-render via `IntersectionObserver` (15-entry chunks), and video-on-hover | `src/*`, `index.html`, `calendar.html` |
| c8  | `e5efcdd` | Add `// @ts-check` to all modules, `types.d.ts` with `Publication`/`Person`/`PeopleFile` interfaces, `tsconfig.json` (`allowJs + checkJs + noEmit + strict`), `package.json` with `typecheck` script; `tsc --noEmit` passes with zero errors | `types.d.ts`, `tsconfig.json`, `package.json`, `.gitignore`, `src/pubs.js` |
| c12 | `bb545da` | Add `lang="en"` to `<html>`; wrap `#menu` in `<nav aria-label="Primary">`, `#container` in `<main id="content">`; add `.sr-only` skip-link; `alt` on hero image; `title` on calendar iframe; add `.sr-only` CSS rule | `index.html`, `calendar.html`, `style.css` |
| c13 | `fb8f460` | Add `<meta name="description">`, Open Graph (`og:title/description/url/image/type`), Twitter card to `index.html` and `calendar.html`; add `sitemap.xml` and `robots.txt` | `index.html`, `calendar.html`, `sitemap.xml`, `robots.txt` |
| 3.2a | `c8f3d98` | Replace `commonmark.js` (274 KB) with vendored `snarkdown.js` (~3 KB); rewrite `src/markdown.js` to import `parse` as an ES module; fix `data/2_contacts.md` dangling link lines | `javascript/commonmark.js` (deleted), `javascript/snarkdown.js`, `src/markdown.js`, `index.html`, `data/2_contacts.md` |
| 3.2b | `c2d5f3c` | Add `paragraphify()` to restore `<p>` wrappers that snarkdown omits (restores 1em margins on biography/hiring); remove dead `<!-- OLD NEWS -->` from `data/4_news.md` | `src/markdown.js`, `data/4_news.md` |
| r1   | `ff5c05b` | `git mv src/*.js → javascript/`, `types.d.ts → javascript/`, `aggregate.py → python/`, delete obsolete `build.js`, update script tags / tsconfig paths / rsync whitelist; wrap calendar iframe in a 716px overflow:hidden div with `-384px margin-top` to clip midnight–8 am dead zone | `javascript/*`, `python/aggregate.py`, `tsconfig.json`, `index.html`, `calendar.html`, `.github/workflows/pages.yml` |
| r2   | `585f8ac` | Visual-regression harness: `scripts/snapshot.mjs` (Playwright + python3 http.server on :8899, full-page PNGs at 1280×900 / 820×1024 / 560×900 / 390×844; scrolls the page to trigger every `IntersectionObserver` for determinism) + `scripts/visual-diff.mjs` (pixelmatch, fails if 1280×900 ≠ baseline); `snapshots-baseline/` (8 PNGs, ~7 MB) captured here | `scripts/*`, `snapshots-baseline/*`, `package.json`, `package-lock.json`, `.gitignore` |
| 3.5a | `cdac088` | Add `<meta name=viewport content="width=device-width, initial-scale=1">` to both HTML files | `index.html`, `calendar.html` |
| 3.5b | `a5df358` | Append mid-range media query `@media (max-width:999px) and (min-width:600px)`: fluid container + percentage columns (48.4375% / 65.625% / 31.25% / 3.125%) that preserve the 2/3+1/3 and 1/2+1/2 splits; publications stay image-left text-right, just fluid | `style.css` |
| 3.5c | `80ac1b4` | Append narrow media query `@media (max-width:599px)`: columns stack to full width, publication thumbnail shrinks to 120×68 kept on the left with text wrapping | `style.css` |
| 3.5d | `671a610` | Hamburger nav for viewports <1000px: `<button class="menu_toggle">` in both HTML files (aria-label / aria-expanded / aria-controls wired); base `.menu_toggle{display:none}` on desktop; new `@media (max-width:999px)` block reveals the button + stacks menu items; new `javascript/menu.js` toggles `.open` on click and closes on outside-click / Escape / link-click; imported from `main.js` and `calendar_main.js` | `index.html`, `calendar.html`, `javascript/menu.js`, `javascript/main.js`, `javascript/calendar_main.js`, `style.css` |

---

## Python-folder compatibility

| Script | Reference before | Reference after | Action |
|--------|-----------------|-----------------|--------|
| `python/bib_json_to_bibtex.py` | `open('pubs.json')` | `open('data/pubs.json')` | Updated in c3 |
| `python/talks_ccvxml_to_json.py` | writes `ccv_talks.json` | unchanged | Not in repo, unaffected |
| `python/talks_json_to_latex.py` | reads `ccv_talks.json` | unchanged | Not in repo, unaffected |
| `python/patents_ccvxml_to_json.py` | writes `converted_data.json` | unchanged | Not in repo, unaffected |
| `aggregate.py` | operates on `pubs/` (gitignored) | unchanged | Unaffected |
| `Makefile` `bib` target | invokes `python/bib_json_to_bibtex.py` | unchanged | Script handles path internally |

Smoke-test: `make bib` still produces a valid `pubs.bib` (verified in c3).

---

## Type-checking

```bash
npm run typecheck   # runs tsc --noEmit, zero errors
```

No files are emitted. The browser receives the same plain JS it always has.
`node_modules/` is gitignored. TypeScript is a dev-only dependency.

---

## Visual regression testing

Introduced in commit `585f8ac` to gate the responsive-layout work (3.5) so
that the desktop rendering at 1280×900 could not drift by a single pixel.

```bash
npm run snapshot:baseline   # capture (from main)      → snapshots-baseline/
npm run snapshot            # capture current          → snapshots/
npm run visual-diff         # pixelmatch; fails if 1280×900 differs
```

Files:

- `scripts/snapshot.mjs` — spawns `python3 -m http.server` on `127.0.0.1:8899`,
  launches headless Chromium via Playwright, loads `/` and `/calendar.html`
  at 1280×900, 820×1024, 560×900, 390×844, and writes full-page PNGs. Before
  every screenshot it walks the page top-to-bottom to fire every
  `IntersectionObserver` (lazy publications + video-src assignment), so the
  output is deterministic across runs.
- `scripts/visual-diff.mjs` — pixel-diffs `snapshots/` against
  `snapshots-baseline/` using `pixelmatch`, writes overlay PNGs to
  `snapshots-diff/`, and exits non-zero if any 1280×900 image differs from
  the baseline. Non-desktop diffs are expected (the mobile layout is
  intentionally changed) and are shown for manual review.
- `snapshots-baseline/` — committed (~7 MB, 8 PNGs). Treated as source of
  truth for the desktop look; regenerate only when a deliberate desktop
  change is intended.
- `snapshots/`, `snapshots-diff/` — gitignored.

---

## Smoke-test instructions

```bash
python3 -m http.server 8000
# open http://localhost:8000 in browser, compare against main baseline
```

For lazy-loading: scroll down the publications list and confirm entries
appear in batches of 15 as you scroll, rather than all at once on load.

For video icons: hover over a publication that has a `.mov` thumbnail and
confirm the video starts; verify the network tab shows the video was not
fetched on page load (only on first hover).

---

## Phase 2 backlog (deferred)

| ID   | Description | Why deferred |
|------|-------------|--------------|
| ~~3.4~~ | ~~Image compression (oversized icons + hero)~~ | **Done** — all 48 `icons/*.jpg` converted to WebP at q=85; `icons/` 2.6 MB → 1.1 MB; `pubs.json` references updated; hero photo left untouched |
| ~~3.5~~ | ~~Responsive layout — desktop parity at ≥1000px, fluid mid-range, stacked mobile, hamburger nav~~ | **Done** — three-tier layout (fixed desktop, fluid 600–999 with percentage columns, stacked <600 with 120×68 pub thumbnail); hamburger nav below 1000px (`javascript/menu.js`); desktop gated at 0-pixel diff by `npm run visual-diff` |
| 3.13 | Print stylesheet (`@media print`) for clean CV PDF export | Requires UX decisions on what to hide/show |
| ~~3.2~~ | ~~Replace `commonmark.js` (274 KB) with `snarkdown` (~1 KB)~~ | **Done** — vendored as `javascript/snarkdown.js` (3 KB); `paragraphify()` restores `<p>` margins; `data/2_contacts.md` fixed for snarkdown's line-oriented list parser |
| ~~3.14~~ | ~~Client-side publication search/filter bar~~ | **Done** — `javascript/search.js`; debounced, URL-synced (`?q=`), lazy-renderer-aware, count overlaid inside input |
