chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "TIME_NUDGE") {
    if (!document.getElementById("time-saver-nudge")) {
      // 🔊 Safely play the ding sound
      const sound = new Audio(chrome.runtime.getURL("ding.mp3"));
      sound.volume = 1.0;
      sound.play().catch((err) => {
        console.warn("Ding audio failed to play:", err);
      });

      const div = document.createElement("div");
      div.id = "time-saver-nudge";
      div.style = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        padding: 15px;
        background: #ffeaa7;
        color: #2d3436;
        font-size: 16px;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      `;

      const msgText = msg.elapsedMinutes >= 10
        ? `⏰ You've been here for ${msg.elapsedMinutes} minutes.`
        : `⏰ Heads-up! ${msg.elapsedMinutes} minutes on this site.`;

      div.innerHTML = `
        ${msgText}<br>
        <button id="dismiss-btn">Dismiss</button>
        <button id="snooze-btn">Snooze 5 min</button>
      `;
      document.body.appendChild(div);

      document.getElementById("dismiss-btn").onclick = () => div.remove();
      document.getElementById("snooze-btn").onclick = () => {
        chrome.runtime.sendMessage({ action: "snooze" });
        div.remove();
      };
    }
  }
});

