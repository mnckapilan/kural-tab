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
npm run format     # prettier --write . (CI runs format:check)
npm run typecheck  # tsc --noEmit (WXT/Vite strip types and never type check)
```

`postinstall` runs `wxt prepare`, which generates `.wxt/` (tsconfig, auto-import and type declarations).
`tsconfig.json` extends `.wxt/tsconfig.json`, so `typecheck`/`lint` need `npm install`/`npm ci` to have run first.

Node version is set to 24 (latest 24.x) via `.nvmrc`; use `nvm use` before running commands.

`eslint.config.mjs` is a flat config using `@eslint/js` recommended, `typescript-eslint`
`recommendedTypeChecked`, `eslint-plugin-react`, and `eslint-plugin-react-hooks` (flat `recommended`,
including the React Compiler-era rules such as `set-state-in-effect`; fix violations rather than disabling them). Formatting is Prettier (`.prettierrc.json`, default
style) with `prettier-plugin-tailwindcss`, which sorts Tailwind classes (including inside `cn()`/`cva()`).
CI fails on unformatted files, so run `npm run format` before committing.

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
  across open tabs). Toggles the `dark` class on `<html>` (shadcn convention; light = no class) plus a
  `data-theme="dark|light"` attribute the tests assert on, mirrors the theme into a `localStorage` copy for `public/theme-init.js` (see Styling), and never blocks rendering: it initialises from the synchronous `localStorage` hint, then lets `themeItem.getValue()` correct it when storage resolves. If that correction changes the theme (hint missing/stale), the class/attribute update runs with a temporary `no-transition` class on `body` (add, flush with a forced reflow, remove, all synchronously in the effect) so the body background doesn't animate; normal user toggles still animate.

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
                │   ├── KuralSkeleton      (only if loading takes > SKELETON_DELAY_MS)
                │   ├── number row         (number + Randomise + star buttons)
                │   ├── KuralMetadata      (section + chapter; links to thirukkural.gokulnath.com)
                │   ├── KuralText          (2-line Tamil couplet)
                │   ├── KuralExplanation   (English translation)
                │   ├── KuralMeaning       (Tamil meaning, mv field)
                │   └── FavouritesPopover  (shadcn Popover: toggle + list; owns its open state)
                └── dev indicator          (only when import.meta.env.DEV)
```

`KuralDisplay` renders its own error state (separate from `ErrorBoundary`, which only catches thrown
render errors); `FavouritesPopover` owns the favourites panel open/closed state and reads favourites from
`useKural()`.

**Component style:** plain `function` components with typed props (no `React.FC`, no default `import React`),
`@/` alias imports only in `src/` (no relative paths), React 19 `<SomeContext value={…}>` and `use(Context)`.
Context values and their callbacks are memoised (`useMemo`/`useCallback`) so consumers don't re-render on
every provider render. `ErrorBoundary` stays a class (required).

**Layout coupling (pure CSS):** the swapped block in `KuralDisplay` (metadata + couplet + translation + meaning)
has `w-min` (`width: min-content`). The couplet lines in `KuralText` are `whitespace-nowrap`, so the block's
min-content width is the longer line, and the translation/meaning wrap to exactly that width. No JS
measurement. Don't remove `whitespace-nowrap` from the couplet lines (the block would collapse to the longest
word), and keep the number row and favourites button outside the `w-min` block. The couplet itself never
wraps, so on viewports narrower than the longest couplet line the page scrolls horizontally.

**Styling — Tailwind CSS v4 + shadcn/ui.** Don't write hand-rolled CSS classes; use Tailwind utilities in
components and the design tokens.

- `src/styles/globals.css` is the only stylesheet (imported by `newtab/main.tsx`, bundled by Vite into a
  hashed `assets/newtab-*.css`). Tailwind is wired in via `@tailwindcss/vite` in `wxt.config.ts` (no
  `tailwind.config.js`; v4 is configured in CSS). The file holds the `@font-face`, the design tokens, and a
  small `@layer base`.
- **Tokens:** raw colours are CSS variables on `:root` (light) and `.dark`, exposed to Tailwind through
  `@theme inline`. Use the semantic utilities, not hex values: `bg-background`, `text-foreground`,
  `text-quote` (couplet/translation text), `text-muted-foreground` (metadata, idle buttons),
  `border-border`, plus the standard shadcn set (`popover`, `accent`, `ring`, …) and `font-tamil`/`font-sans`.
  Dark variants use `dark:` (`@custom-variant dark` matches `.dark` on `<html>`).
- **Components:** shadcn/ui (new-york style, `components.json`) lives in `src/components/ui/` and is
  copied-in source we own, built on the unified `radix-ui` package. Add more with
  `npx shadcn@latest add <name>` — check where it writes files and that imports use `@/lib/utils`
  (the CLI has previously written to `../src` and imported `cn` from a bogus package). `Button` has a
  project-specific `muted` variant plus `md`/`pill`/`icon-round` sizes for the app's outlined pill buttons.
  Use `cn()` from `src/lib/utils.ts` for conditional classes. Icons come from `lucide-react`.
- **Sizing and breakpoints:** use Tailwind's scale (`mb-4`, `rounded-xl`, `max-w-200`, `text-xl`), not
  pixel-arbitrary values. App-specific type sizes are named tokens in `@theme` (`text-kural` 32px/1.4 for the
  couplet, `text-kural-number` 28px for the number); everything else uses the built-in `text-xs/base/xl`.
  Responsive styles are mobile-first: the base classes are the small-screen styles and `sm:` (640px) is the
  desktop layout (no `max-[600px]:`). Arbitrary values are kept only where nothing on the scale fits
  (`w-[min(640px,90vw)]` popover, `w-[95%]`/`w-[90%]` card, `[scrollbar-*]`, `leading-[normal]`).
- The `@/` alias (→ `src/`) is provided by WXT's generated tsconfig and Vite config.
- Chrome's built-in extension-page stylesheet sets `body { font-family: system-ui }`, which beats anything
  inside `@layer`; that's why `globals.css` has an unlayered `body { @apply font-sans; }`.

To avoid a flash of unstyled content or of the wrong theme before the bundled CSS/JS loads:

- `src/entrypoints/newtab/index.html` has `class="dark"` on `<html>` (the default theme) and a small inline
  `<style>` with just the `--background`/`--foreground` values, `color-scheme`, and the `html, body`
  background — deliberately minimal, not a duplicate stylesheet. The background is on `<html>` too because
  Chrome can paint before `<body>` exists. If you change those tokens in `globals.css`, update the inline
  block too.
- `public/theme-init.js` is a blocking classic `<script>` in the `<head>` (MV3's CSP forbids inline
  scripts). It reads a synchronous `localStorage` copy of the theme (`THEME_HINT_KEY` in
  `src/utils/storage.ts`) and removes `dark` before first paint for light-mode users, since
  `chrome.storage` is async and resolves after the first paint. `ThemeContext` initialises from that
  copy and rewrites it on every theme change; `themeItem` (`sync:theme`) stays the source of truth. The
  copy is per-device, so after a theme change synced from another device the first paint can be wrong
  once.

**Animation — Motion** (`motion`, import from `motion/react`). `src/components/MotionProvider.tsx` wraps the
app in `LazyMotion` (`domAnimation`, `strict`) and `MotionConfig reducedMotion="user"`, so components must
use `m.div` etc., not `motion.div` (strict mode throws). Reuse the shared timings in `src/lib/motion.ts` (`FADE_IN`, `FADE_OUT`, `EASE_OUT`). First load uses the `ENTRANCE_CONTAINER`/`ENTRANCE_ITEM` variants (a 0.6s staggered fade-up of the number row, couplet block and favourites). Normal loads finish in well under 100ms, so `KuralDisplay` renders nothing while loading and only shows the skeleton after `SKELETON_DELAY_MS` (400ms, via `useDelayedFlag`) to avoid a flash. Use `AnimatePresence` for enter/exit. Radix/shadcn
primitives (Popover, …) keep their `tw-animate-css` `data-[state=open]:animate-in` classes; don't also wrap
them in Motion.

Noto Sans Tamil is self-hosted, not loaded from Google Fonts: `public/fonts/NotoSansTamil-Light.woff2`
(weight 300 — the only weight used anywhere in the app; `body` is `font-light`, and buttons set
`font-light` explicitly) is subsetted to the Tamil unicode range and declared via `@font-face` at the top of
`src/styles/globals.css` (`font-tamil` utility). `public/fonts/LICENSE.txt` carries the required SIL OFL 1.1
text. The `@font-face` `src: url(...)` is an absolute public path (`/fonts/...`): Vite leaves such URLs
untouched and `public/` is copied to the output root, so it resolves against the extension origin. Don't
make it relative to the CSS file.

**Build config:**

- `wxt.config.ts` — `srcDir: "src"`, `publicDir: "public"`, the `@wxt-dev/module-react` module, the
  `@tailwindcss/vite` plugin (via the `vite` option), and the
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
  range, randomise, star toggle, favourites panel, theme toggle, and metadata links. Tests locate elements
  by role/accessible name (`getByRole("button", { name: "Randomise" })`) or `data-testid`
  (`kural-text`, `kural-number-value`, `favourites-item`, …) — never by CSS class, since Tailwind classes
  are presentational. Changing an `aria-label` or removing a `data-testid` breaks tests.
- Favourites persist in extension `sync` storage within a run, so tests clean up after themselves by
  unstarring. `retries: 1` is set in the config.

**CI/CD (`.github/workflows/`):**

- `build.yml` — Reusable workflow (`workflow_call`, takes `artifact_name` + `retention_days`):
  checkout → Node from `.nvmrc` → `npm ci` → `npm run zip` (`wxt zip`: production build + zip) → upload
  two artifacts from that one build: `<artifact_name>` (unzipped `.output/chrome-mv3/`, used by e2e) and
  `<artifact_name>-zip` (`.output/kural-tab-<version>-chrome.zip`, used for the Web Store upload).
- `checks.yml` — Reusable workflow (`workflow_call`, takes `artifact_name`): a `static` job runs `lint`,
  `typecheck`, and `format:check` in a matrix (`npm ci` runs `postinstall` → `wxt prepare`, which generates the `.wxt/` that `tsconfig.json` extends), and an `e2e` job downloads the already-built `.output/chrome-mv3/` artifact (rather than
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

**Releasing:** `package.json`'s `version` is the single source of truth (currently 1.1.0).
WXT stamps it into the generated `manifest.json` (there is no manifest source file to keep in sync), so
what ships always matches `package.json`. `npm run zip` (`wxt zip`) writes the versioned zip to `.output/`;
CI uses the same command, so local and CI zips are built the same way. Only bump `package.json` before
tagging. Publishing is tag-driven: `git tag v1.0.4 && git push origin v1.0.4`; `verify-version` fails the
run if the tag and `package.json` disagree. The Web Store upload only produces a draft; submitting it for
Google's review from the Developer Dashboard is a manual step and the intentional release gate.
