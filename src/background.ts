// Chrome extension background script
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: "chrome://newtab" }, (newTab) => {
    if (newTab.id) {
      chrome.scripting.executeScript({
        target: { tabId: newTab.id },
        files: ["content.js"],
      });
    }
  });
});
