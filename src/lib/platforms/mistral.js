import AIPlatform from "../base.js";
import { wrapInFencedDiv } from "../../lib/utils/helpers.js";

export default class Mistral extends AIPlatform {
  constructor() {
    super({
      message: ".chat-message",
      user: ".user-message",
      assistant: ".assistant-message",
      content: ".message-content",
    });
  }

  static detect() {
    return window.location.hostname.includes("mistral.ai");
  }

static extractMessages() {
    const messages = [];
    
    // Updated selector for Mistral's current chat bubble structure
    const messageNodes = document.querySelectorAll('main article, div[class*="message"], div[data-testid*="message"]');
    
    console.log(`AI Exporter: Found ${messageNodes.length} message nodes.`);

    messageNodes.forEach((el) => {
      // Logic to determine if the message is from the user or assistant
      const isUser = el.className.includes('user') || el.innerHTML.includes('User'); 
      const role = isUser ? "user" : "assistant";
      
      // Attempt to find the text container (usually inside a .prose div)
      const contentNode = el.querySelector('.prose') || el;

      messages.push({
        role: role,
        content: cleanContent(contentNode.innerText),
        timestamp: new Date().toISOString(),
      });
    });

    return {
      platform: "mistral",
      title: document.title.replace(" | Mistral AI", ""),
      messages,
    };
  }

  static generateMarkdown(messages) {
    return messages
      .map((msg) => wrapInFencedDiv(msg.role, msg.content))
      .join("\n\n");
  }
}

// Helper functions (shared or platform-specific)
function cleanContent(text) {
  return (text || "").replace(/\s+/g, " ").trim();
}

function extractTimestamp(element) {
  return new Date().toISOString();
}
