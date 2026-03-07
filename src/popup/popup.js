document.querySelectorAll(".format-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const format = btn.id.split("-")[1];
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "exportChat", format });
    });
  });
});
