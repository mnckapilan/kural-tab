// Applies the last-used theme before first paint, so light-mode users don't
// see a dark frame while chrome.storage (async) is read. Loaded as a blocking
// classic script from newtab.html's <head>; MV3's CSP forbids inline scripts,
// hence a separate file. <html> starts with class="dark" (the default theme).
// The key must match THEME_HINT_KEY in src/utils/storage.ts, which ThemeContext
// keeps in sync. chrome.storage.sync stays the source of truth.
try {
  if (localStorage.getItem("kural-tab:theme") === "light") {
    document.documentElement.classList.remove("dark");
  }
} catch {
  // localStorage unavailable: fall back to the dark default.
}
