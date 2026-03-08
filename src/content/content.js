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
  const platformName = detectPlatform();
  
  // We need the Class itself to call static methods
  const platformClass = platforms[platformName]?.constructor;

  if (!platformClass) {
    console.error("AI Exporter: Platform class not found for:", platformName);
    return;
  }

  console.log("AI Exporter: Starting extraction for", platformName);

  // Call the static method on the Class
  const dataPackage = platformClass.extractMessages();
  
  console.log("AI Exporter: Data Package result:", dataPackage);

  if (!dataPackage || !dataPackage.messages || dataPackage.messages.length === 0) {
    console.warn("AI Exporter: No messages found on page.");
    return; 
  }

  const messages = dataPackage.messages;
  let data;
  let filename = `ai-chat-${platformName}-${new Date().toISOString().slice(0, 10)}`;

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
      console.error("AI Exporter: Unknown format", format);
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
