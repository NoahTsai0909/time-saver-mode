document.addEventListener("DOMContentLoaded", () => {
  const siteInput = document.getElementById("siteInput");
  const timeInput = document.getElementById("timeInput");
  const addBtn = document.getElementById("addBtn");
  const siteList = document.getElementById("siteList");

  // Load stored sites and populate list
  chrome.storage.sync.get(["trackedSites"], (result) => {
    const trackedSites = result.trackedSites || [];
    trackedSites.forEach(addSiteToList);
  });

  addBtn.addEventListener("click", () => {
    const hostname = siteInput.value.trim();
    const timeLimit = parseInt(timeInput.value.trim());

    if (!hostname || isNaN(timeLimit)) return;

    chrome.storage.sync.get(["trackedSites"], (result) => {
      const trackedSites = result.trackedSites || [];

      // Check if site is already in the list
      if (trackedSites.some(site => site.hostname === hostname)) return;

      const newSite = { hostname, timeLimit };
      trackedSites.push(newSite);

      chrome.storage.sync.set({ trackedSites }, () => {
        addSiteToList(newSite);
        siteInput.value = "";
        timeInput.value = 10;
      });
    });
  });

  function addSiteToList(site) {
    const li = document.createElement("li");
    li.textContent = `${site.hostname} - ${site.timeLimit} min`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.style.marginLeft = "10px";

    removeBtn.onclick = () => {
      chrome.storage.sync.get(["trackedSites"], (result) => {
        const updatedSites = (result.trackedSites || []).filter(s => s.hostname !== site.hostname);
        chrome.storage.sync.set({ trackedSites: updatedSites }, () => {
          li.remove();
        });
      });
    };

    li.appendChild(removeBtn);
    siteList.appendChild(li);
  }
});

