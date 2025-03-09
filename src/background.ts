chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
    chrome.tabs.create({ url: "chrome://newtab" }, (newTab: chrome.tabs.Tab) => {
        if (newTab.id !== undefined) {
            chrome.scripting.executeScript({
                target: { tabId: newTab.id },
                files: ["index.html"],
            });
        }
    });
});
