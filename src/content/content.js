import Mistral from "../lib/platforms/mistral.js";
//import Claude from "../lib/platforms/claude.js";
//import Gemini from "../lib/platforms/gemini.js";
import {
  generateJSON,
  generateMarkdown,
  generatePDF,
} from "../lib/utils/helpers.js";

const platforms = {
  mistral: new Mistral(),
  //claude: new Claude(),
  //gemini: new Gemini(),
};

function detectPlatform() {
  const hostname = window.location.hostname;
  if (hostname.includes("mistral")) return "mistral";
  //if (hostname.includes("claude")) return "claude";
  //if (hostname.includes("gemini")) return "gemini";
  return null;
}

function exportChat(format) {
  const platform = detectPlatform();
  if (!platform) return;

  const messages = platforms[platform].extractMessages();
  let data,
    filename = `ai-chat-${platform}-${new Date().toISOString().slice(0, 10)}`;

  switch (format) {
    case "json":
      data = generateJSON(messages);
      break;
    case "md":
      data = generateMarkdown(messages);
      break;
    case "pdf":
      data = generatePDF(messages);
      break;
    default:
      return;
  }

  chrome.runtime.sendMessage({
    action: "exportChat",
    data,
    format,
    filename,
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "exportChat") {
    exportChat(request.format);
  }
});
