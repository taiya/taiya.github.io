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
├── build.js  (monolithic)      │   └── pubs_preprints.json
├── javascript/                 ├── src/
│   ├── jquery.js  (GONE)       │   ├── main.js
│   └── commonmark.js           │   ├── markdown.js
└── index.html / calendar.html  │   ├── people.js
                                │   ├── pubs.js
                                │   ├── dom.js
                                │   └── calendar_main.js
                                ├── javascript/
                                │   └── commonmark.js  (kept)
                                ├── tsconfig.json  (new)
                                ├── types.d.ts     (new)
                                ├── package.json   (new, dev-only)
                                ├── sitemap.xml    (new)
                                └── robots.txt     (new)
```

The deploy workflow now stages only the files that belong to the site
(`*.html`, `*.css`, `data/`, `icons/`, `images/`, `javascript/`,
`src/`, `CNAME`, `.nojekyll`), so `python/`, `Makefile`, `aggregate.py`,
`tsconfig.json`, `package.json`, etc. are never shipped to users.

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
| 3.4  | Image compression (oversized icons + hero) | JPEG re-encode can't guarantee pixel parity; defer to Phase 2 with SSIM-bounded tooling or `<picture>`/`.webp` |
| 3.5  | Responsive layout — replace fixed 960px with `max-width` + CSS Grid/flex; add `<meta name="viewport">` | Touches every CSS selector; needs visual QA across breakpoints |
| 3.13 | Print stylesheet (`@media print`) for clean CV PDF export | Requires UX decisions on what to hide/show |
| 3.2  | Replace `commonmark.js` (274 KB) with `snarkdown` (~1 KB) | **HIGH RISK** — snarkdown supports a CommonMark subset; needs HTML diff of all 5 `data/*.md` files pre/post |
| ~~3.14~~ | ~~Client-side publication search/filter bar~~ | **Done** — `src/search.js`; debounced, URL-synced (`?q=`), lazy-renderer-aware, count overlaid inside input |
