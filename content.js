if (!document.getElementById("time-saver-nudge")) {
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
  div.innerHTML = `
    ⏰ You've been here for 10 minutes.<br>
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
