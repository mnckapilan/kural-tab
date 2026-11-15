# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # WXT dev mode: watch build → .output/chrome-mv3-dev/ with HMR, launches Chrome
npm run build      # Production build → .output/chrome-mv3/
npm test           # Build (via pretest) + run Playwright e2e tests (real Chrome, non-headless)
npm run zip        # `wxt zip`: production build + .output/kural-tab-<version>-chrome.zip
npm run submit     # `wxt submit`: upload a zip to the Chrome Web Store (CI does this on tags)
npm run lint       # eslint src
npm run typecheck  # tsc --noEmit (WXT/Vite strip types and never type check)
```

`postinstall` runs `wxt prepare`, which generates `.wxt/` (tsconfig, auto-import and type declarations).
`tsconfig.json` extends `.wxt/tsconfig.json`, so `typecheck`/`lint` need `npm install`/`npm ci` to have run first.

Node version is set to 24 (latest 24.x) via `.nvmrc`; use `nvm use` before running commands.

`eslint.config.mjs` is a flat config using `@eslint/js` recommended, `typescript-eslint`
`recommendedTypeChecked`, and `eslint-plugin-react`. There is **no formatter** — Prettier was removed
because it was never wired up (no script, no config file, no ESLint integration).

Because the build only strips types, **`npm run build` succeeds on code with type errors**. Run
`npm run typecheck` explicitly after changing types.

To load the extension locally: go to `chrome://extensions/`, enable Developer Mode, click "Load unpacked",
select the `.output/chrome-mv3/` directory (after `npm run build`).

To run a single Playwright test file:

```bash
npx playwright test tests/newtab.spec.ts
```

## Architecture

Kural Tab is a Chrome extension (Manifest V3) that replaces the new tab page with a random
[Thirukkural](https://en.wikipedia.org/wiki/Kural) couplet. It's a React 19 app built with
[WXT](https://wxt.dev) (Vite-based) + TypeScript; React is wired in via `@wxt-dev/module-react`.

**Entry points** (WXT `srcDir: "src"`; entrypoints are discovered by convention in `src/entrypoints/`):

- `src/entrypoints/newtab/index.html` + `main.tsx` → `.output/chrome-mv3/newtab.html` — the React app,
  mounted directly into `#root` (module scripts are deferred, so no `DOMContentLoaded` listener; `main.tsx` throws if `#root` is missing). WXT maps a `newtab` entrypoint to
  `chrome_url_overrides.newtab` automatically.
- `src/entrypoints/background.ts` → `background.js` — service worker (`defineBackground`); on icon click
  just opens a new tab (`browser.tabs.create({})`, using WXT's auto-imported `browser` global), which Chrome resolves to the new tab override. No script
  injection, so no `scripting` permission.
- There is no `manifest.json` file: the manifest is generated from `wxt.config.ts` (name, description,
  `permissions: ["storage"]`, `action.default_title`). `version` comes from `package.json`.
- Icons: `public/icon/{16,32,48,128}.png`, auto-discovered by WXT into the manifest's `icons` (Chrome
  also uses them for the toolbar button). `newtab.html` links `/icon/32.png` as its favicon. They are
  rendered from the master `assets/icon.svg` (slate `#4f5f73` circle, white Tamil "அ" outlined as a path
  from Noto Sans Tamil Regular, matching the Web Store listing icon) with
  `rsvg-convert -w N -h N assets/icon.svg -o public/icon/N.png`.

**State management via React Context:**

- `src/context/KuralContext.tsx` — Owns kural data, random selection, and favourites. Fetches once and
  caches `kuralData` + the metadata lookup map in state, so `refreshKural()` re-randomises without refetching.
  Persists favourites (sorted number array) via `favouriteKuralsItem`, and `.watch()`es it so
  other open new-tab pages stay in sync.
- `src/context/ThemeContext.tsx` — Owns light/dark theme (defaults to dark). Persists via `themeItem` (also `.watch()`ed
  across open tabs). Applies `light-mode`/`dark-mode` classes to `document.body`, and uses a temporary
  `no-transition` class to prevent a flash on load. Renders a `Loading...` div until storage resolves.

Storage items live in `src/utils/storage.ts`, defined with `@wxt-dev/storage` (`storage` from `#imports`):
`themeItem` (`sync:theme`, fallback `THEME.DARK`) and `favouriteKuralsItem` (`sync:favouriteKurals`, fallback
`[]`). The keys and `sync` area are unchanged from the pre-WXT code, so existing users' data carries over.
There are no `window.chrome` guards or `chrome.d.ts`; the app is only meant to run as an extension page.

**Data layer:**

- `src/types/models.ts` — Central module for all interfaces plus the `THEME` and `FILE_PATHS`
  constants. Prefer these constants over string literals.
- `src/services/kuralService.ts` — Static-method class. Fetches both JSON files in parallel, validates them,
  and throws `KuralDataError` on failure. `buildMetadataLookup()` flattens the section → chapterGroup →
  chapter hierarchy into a `Map<kuralNumber, KuralMetadataResult>` by expanding each chapter's
  `start`–`end` range, giving O(1) lookups.
- `data/thirukkural.json` — ~2.2 MB, all 1330 kurals: `Line1`, `Line2`, `Translation`, `mv` (Tamil meaning), `Number`.
- `data/metadata.json` — ~52 KB, section/chapter hierarchy. The top-level JSON is an array with exactly
  **one** element (the திருக்குறள் root), which is why callers index `metadataData[0]` before walking it.
  Under that root: 3 sections (அறத்துப்பால்/Virtue, பொருட்பால்/Wealth, காமத்துப்பால்/Love) → chapterGroups
  (இயல்) → chapters. `MetadataSection` in `models.ts` doesn't declare the file's `repo` key; harmless.

They live in `public/data/` (WXT's `publicDir`, copied verbatim to `.output/chrome-mv3/data/`) and are fetched at runtime (not bundled). `FILE_PATHS` uses relative `data/...` paths, which resolve against `newtab.html` at the extension root.

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

**Styling — single source of truth, plus a small inlined critical-CSS block:**
`src/styles/style.css` is the ONLY stylesheet — imported by `src/entrypoints/newtab/main.tsx` and bundled by
Vite into a hashed `assets/newtab-*.css` linked from `newtab.html`. **Edit `src/styles/style.css`.** There
used to be a second, hand-maintained `static/style.css` that silently drifted out of sync (see #19); it has
been deleted.

To avoid a flash of unstyled content before the bundled CSS/JS loads, `src/entrypoints/newtab/index.html`
has a small inline `<style>` block in its `<head>` with just the body background/text colour (light/dark
CSS vars) and basic centering layout — deliberately minimal, not a duplicate stylesheet. If you change
`body`, `:root`, `.light-mode` colour vars, or `.no-transition` in `src/styles/style.css`, check whether
the inline block needs the same update.

Noto Sans Tamil is self-hosted, not loaded from Google Fonts: `public/fonts/NotoSansTamil-Light.woff2`
(weight 300 — the only weight used anywhere in the app; `body` sets `font-weight: 300` and nothing
overrides it) is subsetted to the Tamil unicode range and declared via `@font-face` at the top of
`src/styles/style.css`. `public/fonts/LICENSE.txt` carries the required SIL OFL 1.1 text. The
`@font-face` `src: url(...)` is an absolute public path (`/fonts/...`): Vite leaves such URLs untouched
and `public/` is copied to the output root, so it resolves against the extension origin. Don't make it
relative to the CSS file.

**Build config:**

- `wxt.config.ts` — `srcDir: "src"`, `publicDir: "public"`, the `@wxt-dev/module-react` module, and the
  `manifest` block (see above). `output` goes to `.output/chrome-mv3/` (`.output/chrome-mv3-dev/` in dev).
  `import.meta.env.DEV` replaces the old `__DEV__` define (true under `npm start`, false in builds).
- `tsconfig.json` — extends `.wxt/tsconfig.json` (generated by `wxt prepare`). WXT's strict base is used as-is, including
  `noUncheckedIndexedAccess` (guard indexed access) and `noImplicitOverride` (use `override`). `verbatimModuleSyntax` is on, so type-only imports must use `import type` / `type X`.
- `.output/` and `.wxt/` are gitignored and eslint-ignored.

**Tests (`tests/`):**

- `fixtures.ts` — Extends the Playwright `test` fixture to launch a persistent Chromium context with
  `--load-extension=.output/chrome-mv3`, and derives `extensionId` from the service worker URL. Tests must run
  non-headless (set in `playwright.config.ts`); extensions don't load headless.
- `newtab.spec.ts` — Navigates to `chrome-extension://<id>/newtab.html` and covers rendering, kural number
  range, randomise, star toggle, favourites panel, theme toggle, and metadata links. Tests assert on CSS
  class names (`.quote-text`, `.star-button`, `.favourites-item`, …) — renaming a class breaks tests.
- Favourites persist in extension `sync` storage within a run, so tests clean up after themselves by
  unstarring. `retries: 1` is set in the config.

**CI/CD (`.github/workflows/`):**

- `build.yml` — Reusable workflow (`workflow_call`, takes `artifact_name` + `retention_days`):
  checkout → Node from `.nvmrc` → `npm ci` → `npm run zip` (`wxt zip`: production build + zip) → upload
  two artifacts from that one build: `<artifact_name>` (unzipped `.output/chrome-mv3/`, used by e2e) and
  `<artifact_name>-zip` (`.output/kural-tab-<version>-chrome.zip`, used for the Web Store upload).
- `checks.yml` — Reusable workflow (`workflow_call`, takes `artifact_name`): a `static` job runs `lint`
  and `typecheck` in a matrix (`npm ci` runs `postinstall` → `wxt prepare`, which generates the `.wxt/` that `tsconfig.json` extends), and an `e2e` job downloads the already-built `.output/chrome-mv3/` artifact (rather than
  rebuilding) and runs Playwright against it via `xvfb-run -a npx playwright test`, so CI tests the exact
  bytes that get shipped. `xvfb-run` provides a virtual display, since extensions require headed Chrome
  and GitHub's Linux runners have no display server. On failure it uploads `playwright-report/` as an
  artifact (see the `html` reporter in `playwright.config.ts`).
- `main.yml` — Runs on pushes to `main` and `v*.*.*` tags. Calls `build.yml` then `checks.yml`. A
  `verify-version` job (tag pushes only) fails the run if the pushed tag doesn't match `v<package.json
version>`. `upload-extension` needs all three of `build-extension`, `checks`, and `verify-version`, and
  is further gated on `startsWith(github.ref, 'refs/tags/v')`. It downloads the `-zip` artifact and runs
  `npm run submit -- --chrome-zip .output/*-chrome.zip` (`wxt submit`, i.e. `publish-browser-extension`)
  with `CHROME_SKIP_SUBMIT_REVIEW=true`, which uploads a **draft only**. In Web Store terms "publish" means
  submitting for Google's review, so the draft is the intentional handoff point — a human submits it for
  review from the Chrome Web Store Developer Dashboard. It uses Chrome Web Store API v2
  (`CHROME_API_VERSION=v2`), which in `publish-browser-extension` authenticates **only with a Google Cloud
  service account** (OAuth client ID/secret/refresh token are v1.1-only). Then it cuts a GitHub Release
  with the zip attached via the SHA-pinned `softprops/action-gh-release`. Extension ID
  `njidhifbpgbfadoffhibkjnnkfhcglpc`. Like the other jobs, `upload-extension` checks out the repo and takes
  Node from `.nvmrc` (it needs `node_modules` for `wxt`).

  Secrets: `CI_GOOGLE_PUBLISHER_ID` (Developer Dashboard → Settings), `CI_GOOGLE_SERVICE_ACCOUNT_EMAIL`,
  `CI_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`. One-time service account setup:
  1. In Google Cloud (any project), enable the **Chrome Web Store API**, then create a service account.
  2. Create a JSON key for it; `client_email` → `CI_GOOGLE_SERVICE_ACCOUNT_EMAIL`, `private_key` (the full
     PEM, newlines intact) → `CI_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`.
  3. In the Chrome Web Store Developer Dashboard → Account, add the service account's email so it can
     manage the publisher's items.
     To check credentials without uploading, set the same `CHROME_*` env vars locally and run
     `npm run zip && npm run submit -- --dry-run --chrome-zip .output/*-chrome.zip`.

- `pr-comment.yml` — Also calls `build.yml` then `checks.yml`, then posts a PR comment linking the build
  artifact for manual testing via the SHA-pinned `thollander/actions-comment-pull-request`. Runs under a
  `${{ github.workflow }}-${{ github.ref }}` concurrency group with `cancel-in-progress: true`, so pushing
  new commits to a PR cancels the previous run's build/checks.
- All four workflows set top-level `permissions: contents: read`; jobs that need more (`upload-extension`
  needs `contents: write` for the release, `comment-pr` needs `pull-requests: write`) grant it locally.
  Third-party actions (`thollander/actions-comment-pull-request`, `softprops/action-gh-release`) are
  pinned to commit SHAs with a trailing `# vX.Y.Z` comment; Dependabot (`.github/dependabot.yml`) keeps
  those pins current.

**Releasing:** `package.json`'s `version` is the single source of truth (currently 1.0.6).
WXT stamps it into the generated `manifest.json` (there is no manifest source file to keep in sync), so
what ships always matches `package.json`. `npm run zip` (`wxt zip`) writes the versioned zip to `.output/`;
CI uses the same command, so local and CI zips are built the same way. Only bump `package.json` before
tagging. Publishing is tag-driven: `git tag v1.0.4 && git push origin v1.0.4`; `verify-version` fails the
run if the tag and `package.json` disagree. The Web Store upload only produces a draft; submitting it for
Google's review from the Developer Dashboard is a manual step and the intentional release gate.
