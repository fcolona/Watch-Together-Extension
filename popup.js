chrome.tabs.query({active: true}, function(tabs) {
  chrome.tabs.executeScript(null, {file: "execute.js" });
});