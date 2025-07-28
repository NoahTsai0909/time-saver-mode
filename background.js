let trackedSites = ["youtube.com", "reddit.com"];
let timers = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    let site = new URL(tab.url).hostname;
    if (trackedSites.some(s => site.includes(s))) {
      if (!timers[tabId]) {
        timers[tabId] = Date.now();
        chrome.alarms.create(`nudge-${tabId}`, { delayInMinutes: 10 });
      }
    }
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("nudge-")) {
    let tabId = parseInt(alarm.name.split("-")[1]);
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  delete timers[tabId];
});
