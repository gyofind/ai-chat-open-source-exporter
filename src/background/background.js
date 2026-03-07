chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "exportChat") {
    const { data, format, filename } = request;
    const blob = new Blob([data], { type: `application/${format}` });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url,
      filename: `${filename}.${format}`,
    });
  }
});
