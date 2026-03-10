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

  // dataPackage is the object { conversation_id, messages, ... }
  const dataPackage = platformClass.extractMessages();
  
  if (!dataPackage || !dataPackage.messages || dataPackage.messages.length === 0) {
    console.warn("AI Exporter: No messages found on page.");
    return; 
  }

  let data;
  let filename = `ai-chat-${platformName}-${new Date().toISOString().slice(0, 10)}`;

  switch (format) {
    case "json":
      // Pass only messages array for standard JSON export
      data = generateJSON(dataPackage.messages); 
      break;
    case "md":
      // Pass the WHOLE package because generateMarkdown iterates over conversation.messages
      data = generateMarkdown(dataPackage); 
      break;
    case "pdf":
      data = generatePDF(dataPackage.messages);
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