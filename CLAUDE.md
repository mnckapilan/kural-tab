# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Watch build (dev mode, inline source maps)
npm run build      # Production build → dist/
npm test           # Build (via pretest) + run Playwright e2e tests (real Chrome, non-headless)
npm run release    # Production build + zip dist/ → kural-tab.zip for Web Store upload
npx tsc --noEmit   # Type check only (webpack strips types via Babel and never type checks)
```

Node version is pinned to 22.16.0 via `.nvmrc`; use `nvm use` before running commands.

There is **no lint or format script**. ESLint/Prettier are in `devDependencies`, but no `eslint.config.*`
exists on `main` — the config lives on the unmerged `origin/claude-ts-audit` branch, so `npx eslint`
fails out of the box. Don't tell the user to "run the linter" without adding the config first.

Because Babel only strips types, **`npm run build` succeeds on code with type errors**. Run
`npx tsc --noEmit` explicitly after changing types.

To load the extension locally: go to `chrome://extensions/`, enable Developer Mode, click "Load unpacked",
select the `dist/` directory.

To run a single Playwright test file:
```bash
npx playwright test tests/newtab.spec.ts
```

## Architecture

Kural Tab is a Chrome extension (Manifest V3) that replaces the new tab page with a random
[Thirukkural](https://en.wikipedia.org/wiki/Kural) couplet. It's a React 18 app built with
Webpack 5 + Babel + TypeScript.

**Entry points** (webpack bundle name → output file):
- `content` → `src/index.tsx` → `dist/content.js` — the React app, mounted into `#root` in
  `static/index.html` on `DOMContentLoaded`. Note the bundle is named `content` for historical reasons;
  it is the new tab page, not a content script.
- `background` → `src/background.ts` → `dist/background.js` — service worker; on icon click opens a new
  tab and injects `content.js` into it.
- `src/content.ts` is **dead code** — nothing imports it and it isn't a webpack entry. Ignore it.
- `static/manifest.json` — Manifest V3; declares `chrome_url_overrides.newtab`, storage + scripting permissions.

**State management via React Context:**
- `src/context/KuralContext.tsx` — Owns kural data, random selection, and favourites. Fetches once and
  caches `kuralData` + the metadata lookup map in state, so `refreshKural()` re-randomises without refetching.
  Persists favourites (sorted number array) to `chrome.storage.sync` under `favouriteKurals`.
- `src/context/ThemeContext.tsx` — Owns light/dark theme (defaults to dark). Persists to `chrome.storage.sync`
  under `theme`. Applies `light-mode`/`dark-mode` classes to `document.body`, and uses a temporary
  `no-transition` class to prevent a flash on load. Renders a `Loading...` div until storage resolves.

Both contexts feature-detect `window.chrome.storage.sync` before touching it, so the app still runs when
opened outside an extension context.

**Data layer:**
- `src/types/models.ts` — Central module for all interfaces plus the `THEME`, `CSS_CLASSES`,
  `ELEMENT_IDS`, and `FILE_PATHS` constants. Prefer these constants over string literals.
- `src/services/kuralService.ts` — Static-method class. Fetches both JSON files in parallel, validates them,
  and throws `KuralDataError` on failure. `buildMetadataLookup()` flattens the section → chapterGroup →
  chapter hierarchy into a `Map<kuralNumber, KuralMetadataResult>` by expanding each chapter's
  `start`–`end` range, giving O(1) lookups.
- `data/thirukkural.json` — ~2.2 MB, all 1330 kurals: `Line1`, `Line2`, `Translation`, `mv` (Tamil meaning), `Number`.
- `data/metadata.json` — ~52 KB, section/chapter hierarchy. The top-level JSON is an array with exactly
  **one** element (the திருக்குறள் root), which is why callers index `metadataData[0]` before walking it.
  Under that root: 3 sections (அறத்துப்பால்/Virtue, பொருட்பால்/Wealth, காமத்துப்பால்/Love) → chapterGroups
  (இயல்) → chapters. `MetadataSection` in `models.ts` doesn't declare the file's `repo` key; harmless.

Both are copied into `dist/data/` by CopyWebpackPlugin and fetched at runtime (not bundled).

**Component tree:**
```
App
└── ErrorBoundary          (class component; catches render errors, offers reload)
    └── ThemeProvider
        └── KuralProvider
            └── AppContent
                ├── ThemeToggle
                ├── KuralDisplay
                │   ├── KuralSkeleton      (loading state)
                │   ├── quote-number       (number + Randomise + star buttons)
                │   ├── KuralMetadata      (section + chapter; links to thirukkural.gokulnath.com)
                │   ├── KuralText          (2-line Tamil couplet)
                │   ├── KuralExplanation   (English translation)
                │   ├── KuralMeaning       (Tamil meaning, mv field)
                │   └── favourites-section (toggle + list, owned by KuralDisplay)
                └── dev-indicator          (only when __DEV__)
```

`KuralDisplay` is the only stateful component — it owns the favourites panel open/closed state and
renders its own error state (separate from `ErrorBoundary`, which only catches thrown render errors).

**Layout coupling:** `KuralText` measures its two rendered lines in a `requestAnimationFrame` after each
kural change and reports the max width up through `useKuralLayout` (`src/hooks/useKuralLayout.ts`).
`KuralDisplay` writes that width to the `--kural-text-width` CSS custom property on `.quote-container`,
which the stylesheet uses to align the surrounding blocks to the couplet. Changing the `.quote-text`
markup or its `div > div` structure will break this measurement.

**Styling — two stylesheets are live, and this is a trap:**
- `static/style.css` — copied to `dist/style.css`, loaded via `<link>` in `index.html`.
- `src/styles/style.css` — imported by `index.tsx`, injected as a `<style>` tag at runtime by `style-loader`.

`static/style.css` (255 lines) is a **stale subset** of `src/styles/style.css` (544 lines); the latter is
the real stylesheet and wins at runtime because style-loader injects later. Anything favourites-, skeleton-,
error-, or dev-indicator-related exists only in `src/styles/style.css`. **Edit `src/styles/style.css`.**
`static/style.css` mainly serves to style the pre-React paint.

The Noto Sans Tamil font is loaded from Google Fonts via `<link>` in `static/index.html` (a network
dependency on every new tab).

**Build config:**
- `webpack.common.js` — Both entries, Babel loader for TS/TSX, style-loader + css-loader for CSS, and
  CopyWebpackPlugin bundling `static/` → `dist/` and `data/` → `dist/data/`. `output.clean` wipes `dist/`.
- `webpack.dev.js` / `webpack.prod.js` — Merge with common; both define `__DEV__` via DefinePlugin
  (true in dev, false in prod). Dev uses inline source maps.
- `tsconfig.json` — `strict: true`, `jsx: "react"`. Note it still sets `outDir`/`rootDir` even though tsc
  is only used for checking.

**Tests (`tests/`):**
- `fixtures.ts` — Extends the Playwright `test` fixture to launch a persistent Chromium context with
  `--load-extension=dist`, and derives `extensionId` from the service worker URL. Tests must run
  non-headless (set in `playwright.config.ts`); extensions don't load headless.
- `newtab.spec.ts` — Navigates to `chrome-extension://<id>/index.html` and covers rendering, kural number
  range, randomise, star toggle, favourites panel, theme toggle, and metadata links. Tests assert on CSS
  class names (`.quote-text`, `.star-button`, `.favourites-item`, …) — renaming a class breaks tests.
- Favourites persist in `chrome.storage.sync` within a run, so tests clean up after themselves by
  unstarring. `retries: 1` is set in the config.

**CI/CD (`.github/workflows/`):**
- `build.yml` — Reusable workflow (`workflow_call`, takes `artifact_name` + `retention_days`):
  checkout → Node from `.nvmrc` → `npm ci` → `npm run build` → upload `dist/` artifact. **CI never runs
  the tests** — Playwright is local-only.
- `main.yml` — Runs on pushes to `main` and `v*.*.*` tags. Always builds; the `upload-extension` job is
  gated on `startsWith(github.ref, 'refs/tags/v')` and zips + uploads to the Chrome Web Store via
  `chrome-webstore-upload-cli`. Secrets: `CI_GOOGLE_CLIENT_ID`, `CI_GOOGLE_CLIENT_SECRET`,
  `CI_GOOGLE_REFRESH_TOKEN`; extension ID `njidhifbpgbfadoffhibkjnnkfhcglpc`. This job pins Node inline
  (`node-version: "22"`) rather than using `.nvmrc`, because it checks out no source.
- `pr-comment.yml` — Posts a PR comment linking the build artifact for manual testing.

**Releasing:** `package.json`'s `version` is the single source of truth (currently 1.0.4).
`static/manifest.json` keeps a `0.0.0` placeholder — `webpack.common.js`'s CopyWebpackPlugin `transform`
overwrites it with `package.json`'s version whenever `static/` is copied to `dist/`, so `dist/manifest.json`
(what actually ships) always matches `package.json` and the two can't drift. Only bump `package.json` before
tagging. Publishing is tag-driven: `git tag v1.0.4 && git push origin v1.0.4`.
