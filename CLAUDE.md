# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Watch build (dev mode, inline source maps)
npm run build      # Production build → dist/
npm test           # Build + run Playwright e2e tests (real Chrome, non-headless)
npm run release    # Production build + zip dist/ → kural-tab.zip for Web Store upload
```

Node version is pinned to 22.16.0 via `.nvmrc`; use `nvm use` before running commands.

To load the extension locally: go to `chrome://extensions/`, enable Developer Mode, click "Load unpacked", select the `dist/` directory.

To run a single Playwright test file:
```bash
npx playwright test tests/newtab.spec.ts
```

## Architecture

Kural Tab is a Chrome extension (Manifest V3) that replaces the new tab page with a random [Thirukkural](https://en.wikipedia.org/wiki/Kural) couplet. It's a React 18 app built with Webpack 5 + Babel + TypeScript.

**Entry points:**
- `src/index.tsx` — React app mounted into `static/index.html` (the new tab page)
- `src/background.ts` — Service worker; opens a new tab when the extension icon is clicked
- `static/manifest.json` — Manifest V3; declares `chrome_url_overrides.newtab`, storage + scripting permissions

**State management via React Context:**
- `src/context/KuralContext.tsx` — Owns kural data, random selection, and favorites. Persists favorites to `chrome.storage.sync`. Fetches from `data/thirukkural.json` (1330 kurals) and `data/metadata.json` via `kuralService`.
- `src/context/ThemeContext.tsx` — Owns light/dark theme. Persists to `chrome.storage.sync`.

**Data layer:**
- `src/services/kuralService.ts` — Fetches the JSON data files (bundled into `dist/` via CopyWebpackPlugin), builds an O(1) metadata lookup map (keyed by kural number), and exposes random selection logic.
- `data/thirukkural.json` — ~2.2 MB, all 1330 kurals with Tamil text, English translation, and Tamil meaning (`mv` field).
- `data/metadata.json` — ~52 KB, section/chapter hierarchy for displaying metadata.

**Component tree:**
```
App (ThemeProvider > KuralProvider)
└── KuralDisplay
    ├── KuralSkeleton (loading state)
    ├── KuralText (2-line Tamil couplet)
    ├── KuralExplanation (English translation)
    ├── KuralMeaning (Tamil meaning, mv field)
    ├── KuralMetadata (section + chapter)
    └── ThemeToggle
```

**Build config:**
- `webpack.common.js` — Defines both entry points, TS/TSX/CSS loaders, and CopyWebpackPlugin to bundle `static/` and `data/` into `dist/`
- `webpack.dev.js` / `webpack.prod.js` — Merge with common; dev sets `__DEV__ = true` and inline source maps
- Linting: ESLint 9 with `typescript-eslint` and the React plugin; formatting with Prettier

**CI/CD (`.github/workflows/`):**
- `build.yml` — Reusable workflow: checkout → Node 22 → `npm ci` → `npm run build` → upload artifact
- `main.yml` — Calls build workflow; on version tags (`v*.*.*`) uploads to Chrome Web Store using `chrome-webstore-upload-cli` (secrets: `CI_GOOGLE_CLIENT_ID`, `CI_GOOGLE_CLIENT_SECRET`, `CI_GOOGLE_REFRESH_TOKEN`; extension ID: `njidhifbpgbfadoffhibkjnnkfhcglpc`)
- `pr-comment.yml` — Posts a comment on PRs with a link to the build artifact for manual testing
