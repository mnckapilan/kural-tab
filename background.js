chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: "chrome://newtab" }, (newTab) => {
    chrome.scripting.executeScript({
      target: { tabId: newTab.id },
      files: ["index.html"],
    });
  });
});
