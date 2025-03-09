/******/ (() => { // webpackBootstrap
/*!***************************!*\
  !*** ./src/background.js ***!
  \***************************/
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: "chrome://newtab" }, (newTab) => {
    chrome.scripting.executeScript({
      target: { tabId: newTab.id },
      files: ["index.html"],
    });
  });
});

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQSx1QkFBdUIsd0JBQXdCO0FBQy9DO0FBQ0EsZ0JBQWdCLGtCQUFrQjtBQUNsQztBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0gsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2t1cmFsLXRhYi8uL3NyYy9iYWNrZ3JvdW5kLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNocm9tZS5hY3Rpb24ub25DbGlja2VkLmFkZExpc3RlbmVyKCh0YWIpID0+IHtcbiAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsOiBcImNocm9tZTovL25ld3RhYlwiIH0sIChuZXdUYWIpID0+IHtcbiAgICBjaHJvbWUuc2NyaXB0aW5nLmV4ZWN1dGVTY3JpcHQoe1xuICAgICAgdGFyZ2V0OiB7IHRhYklkOiBuZXdUYWIuaWQgfSxcbiAgICAgIGZpbGVzOiBbXCJpbmRleC5odG1sXCJdLFxuICAgIH0pO1xuICB9KTtcbn0pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9