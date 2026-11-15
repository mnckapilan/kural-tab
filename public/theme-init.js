// Applies the last-used appearance before first paint, so users don't see the
// default dark/Slate frame while chrome.storage (async) is read. Loaded as a
// blocking classic script from the <head> of newtab.html and options.html;
// MV3's CSP forbids inline scripts, hence a separate file. <html> starts with
// class="dark" (the default theme).
//
// Reads two synchronous localStorage copies that ThemeContext and
// AppearanceContext keep in sync (chrome.storage.sync stays the source of
// truth). Keys and shapes must match src/utils/storage.ts:
//   kural-tab:theme       "light" | "dark" | "system"  (key predates "system")
//   kural-tab:appearance  JSON: { palette, tamilFont, fontSize, colours }
//                         colours: { light|dark: { background, foreground } }
//                         or null for the default Slate palette.
// For non-Slate palettes the colours are set inline as --background/--foreground
// so the first paint is right without knowing any palette values here;
// AppearanceContext removes them again for preset palettes (globals.css owns
// those) and keeps them for Custom.
(function () {
  var root = document.documentElement;
  var theme = "dark";
  try {
    var stored = localStorage.getItem("kural-tab:theme");
    if (stored === "light" || stored === "dark") theme = stored;
    else if (stored === "system")
      theme = matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  } catch (e) {
    // localStorage or matchMedia unavailable: fall back to the dark default.
  }
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;

  try {
    var hint = JSON.parse(localStorage.getItem("kural-tab:appearance"));
    if (!hint) return;
    root.dataset.palette = hint.palette;
    root.dataset.font = hint.tamilFont;
    root.dataset.size = hint.fontSize;
    var colours = hint.colours && hint.colours[theme];
    if (colours) {
      root.style.setProperty("--background", colours.background);
      root.style.setProperty("--foreground", colours.foreground);
    }
  } catch (e) {
    // Missing or malformed hint: keep the default appearance.
  }
})();
