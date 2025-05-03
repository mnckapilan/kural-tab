chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
  chrome.tabs.create({ url: "chrome://newtab" }, (newTab) => {
    if (newTab.id) {
      chrome.scripting.executeScript({
        target: { tabId: newTab.id },
        files: ["index.html"],
      });
    }
  });
});
