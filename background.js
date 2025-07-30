// List of sites to monitor
let trackedSites = [];

chrome.storage.sync.get(["trackedSites"], (result) => {
  trackedSites = result.trackedSites || [];
});


let timers = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.storage.sync.get(["trackedSites"], (result) => {
      let trackedSites = result.trackedSites || [];
      let site = new URL(tab.url).hostname;

      // Find matching site from stored list
      const matchedSite = trackedSites.find(s => site.includes(s.hostname));

      if (matchedSite) {
        const timeLimit = parseInt(matchedSite.timeLimit) || 10; // default to 10 minutes

        chrome.storage.local.get(["startTimes"], (result) => {
          let startTimes = result.startTimes || {};

          // Only start the timer if we haven't already
          if (!startTimes[tabId]) {
            startTimes[tabId] = Date.now();
            chrome.storage.local.set({ startTimes });

            // Set alarm with the site-specific time limit
            chrome.alarms.create(`nudge-${tabId}`, { delayInMinutes: timeLimit });
          }
        });
      }
    });
  }
});




// When a tab is removed, stop tracking it
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get(["startTimes"], (result) => {
    let startTimes = result.startTimes || {};
    delete startTimes[tabId];
    chrome.storage.local.set({ startTimes });
  });
});

// When the timer alarm goes off
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith("nudge-")) {
    const tabId = parseInt(alarm.name.split("-")[1]);

    // Get the stored start time
    chrome.storage.local.get(["startTimes"], (result) => {
      const startTimes = result.startTimes || {};
      const startedAt = startTimes[tabId];
      const elapsedMs = startedAt ? Date.now() - startedAt : 0;
      const elapsedMin = Math.round(elapsedMs / 60000);

      // Inject content script, then send elapsed time
      chrome.scripting.executeScript({
        target: { tabId },
        files: ["content.js"]
      }, () => {
        // Send the elapsed time to the content script
        chrome.tabs.sendMessage(tabId, {
          type: "TIME_NUDGE",
          elapsedMinutes: elapsedMin
        });
      });
    });
  }
});

// When snooze is clicked, reset the timer
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "snooze" && sender.tab) {
    const tabId = sender.tab.id;

    // Reset the alarm to fire again in 5 minutes
    chrome.alarms.create(`nudge-${tabId}`, { delayInMinutes: 5 });

    // Also reset the start time for the snooze duration
    chrome.storage.local.get(["startTimes"], (result) => {
      let startTimes = result.startTimes || {};
      startTimes[tabId] = Date.now();
      chrome.storage.local.set({ startTimes });
    });
  }
});

