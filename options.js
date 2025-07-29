document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(null, (result) => {
    console.log("All stored data:", result);
    renderSites(result.trackedSites || []);
  });

  function saveSettings(sites) {
    chrome.storage.sync.set({ trackedSites: sites }, () => {
      console.log("Settings saved.");
      renderSites(sites);
    });
  }

  function renderSites(sites) {
    const siteList = document.getElementById("siteList");
    siteList.innerHTML = "";

    for (let site of sites) {
      const li = document.createElement("li");
      li.textContent = `${site.hostname} - ${site.minutes} min`;

      const delBtn = document.createElement("button");
      delBtn.textContent = "Remove";
      delBtn.onclick = () => {
        const filtered = sites.filter(s => s.hostname !== site.hostname);
        saveSettings(filtered);
      };

      li.appendChild(delBtn);
      siteList.appendChild(li);
    }
  }

  document.getElementById("addBtn").onclick = () => {
    const hostname = document.getElementById("siteInput").value.trim();
    const minutes = parseInt(document.getElementById("timeInput").value);

    if (!hostname || isNaN(minutes)) return;

    chrome.storage.sync.get(["trackedSites"], (result) => {
      const sites = result.trackedSites || [];

      // Avoid duplicate hostnames
      const exists = sites.some(s => s.hostname === hostname);
      if (exists) return;

      sites.push({ hostname, minutes });
      chrome.storage.sync.set({ trackedSites: sites }, () => {
        renderSites(sites);
      });
    });
  };
});
