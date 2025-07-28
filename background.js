let trackedSites = ["youtube.com", "reddit.com"];
let timers = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    let site = new URL(tab.url).hostname;
    if (trackedSites.some(s => site.includes(s))) {
      chrome.storage.local.get(["startTimes"], (result) => {
        let startTimes = result.startTimes || {};
        if (!startTimes[tabId]) {
          startTimes[tabId] = Date.now();
          chrome.storage.local.set({ startTimes });
          chrome.alarms.create(`nudge-${tabId}`, { delayInMinutes: 10 });
        }
      });
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get(["startTimes"], (result) => {
    let startTimes = result.startTimes || {};
    delete startTimes[tabId];
    chrome.storage.local.set({ startTimes });
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "snooze" && sender.tab) {
    const tabId = sender.tab.id;
    // Reset the alarm to fire again in 5 minutes
    chrome.alarms.create(`nudge-${tabId}`, { delayInMinutes: 5 });

    // Also reset the start time
    chrome.storage.local.get(["startTimes"], (result) => {
      let startTimes = result.startTimes || {};
      startTimes[tabId] = Date.now();
      chrome.storage.local.set({ startTimes });
    });
  }
});
