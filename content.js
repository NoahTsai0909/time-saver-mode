if (!document.getElementById("time-saver-nudge")) {
  let div = document.createElement("div");
  div.id = "time-saver-nudge";
  div.style.position = "fixed";
  div.style.top = "20px";
  div.style.right = "20px";
  div.style.zIndex = "9999";
  div.style.padding = "15px";
  div.style.background = "#ffeaa7";
  div.style.color = "#2d3436";
  div.style.fontSize = "16px";
  div.style.borderRadius = "8px";
  div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  div.innerHTML = `
    ⏰ You've been here for 10 minutes.<br>
    <button onclick="this.parentElement.remove()">Dismiss</button>
    <button onclick="snooze()">Snooze 5 min</button>
  `;
  document.body.appendChild(div);

  window.snooze = () => {
    chrome.runtime.sendMessage({ snooze: true });
    div.remove();
  };
}
