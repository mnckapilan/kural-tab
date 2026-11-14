// Chrome extension background service worker: the toolbar icon opens a new tab,
// which Chrome resolves to this extension's new tab override.
export default defineBackground(() => {
  browser.action.onClicked.addListener(() => {
    void browser.tabs.create({});
  });
});
