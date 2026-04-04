
![Banner](assets/banner.png)

# Kural Tab

Kural Tab is a Chrome extension that replaces your new tab page with a random Thirukkural couplet, offering timeless wisdom each time you open a new tab.


## Features

- **Random Thirukkural Display**: Each new tab presents a randomly selected Thirukkural couplet.
- **Dark Mode / Light Mode**: Toggle dark mode or light mode.

[![Chrome](assets/chrome.svg)](https://chrome.google.com/webstore/detail/kural-tab/njidhifbpgbfadoffhibkjnnkfhcglpc)

## Development Setup

### Prerequisites

- [nvm](https://github.com/nvm-sh/nvm) — the project pins its Node version in `.nvmrc`

### Getting started

```bash
git clone https://github.com/mnckapilan/kural-tab.git
cd kural-tab
nvm use          # switches to the pinned Node version (22.16.0)
npm install
```

### Commands

| Command | What it does |
|---------|-------------|
| `npm start` | Starts a watch build (dev mode, source maps inline) — rebuild happens automatically on every save |
| `npm run build` | One-off production build into `dist/` |
| `npm test` | Builds then runs the full Playwright end-to-end test suite in a real Chrome window |
| `npm run release` | Production build + zips `dist/` into `kural-tab.zip` ready for Chrome Web Store upload |

### Loading the extension in Chrome

1. Run `npm start` (or `npm run build` for a one-off build) — this populates `dist/`.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle, top right).
4. Click **Load unpacked** and select the `dist/` folder.
5. Open a new tab to see the extension in action.

While `npm start` is running, after making code changes Chrome will pick up the rebuild automatically — click the refresh icon on the extension card in `chrome://extensions/` to reload it.

### Running tests

```bash
npm test
```

This builds the extension first, then launches Playwright against a real Chrome window with the extension loaded. Tests cover rendering, the randomise button, favourites, theme toggle, and metadata links.

### Releasing

Releases are handled automatically by CI when a `v*.*.*` tag is pushed:

```bash
git tag v1.0.4
git push origin v1.0.4
```

This triggers the GitHub Actions workflow which builds, zips, and uploads to the Chrome Web Store. To produce the zip locally without publishing, run `npm run release`.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License.