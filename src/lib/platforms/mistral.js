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
    
    // Select potential nodes
    const allNodes = document.querySelectorAll('main article, div[data-testid*="message"]');
    
    // FILTER: Only keep nodes that do not have another message node as a parent
    const messageNodes = Array.from(allNodes).filter(node => {
      return !node.parentElement.closest('article, [data-testid*="message"]');
    });
    
    console.log(`AI Exporter: Found ${messageNodes.length} unique message nodes.`);

    messageNodes.forEach((el) => {
      const isUser = el.className.includes('user') || 
                     el.getAttribute('data-testid')?.includes('user') || 
                     el.innerHTML.includes('You'); 
      
      const role = isUser ? "user" : "assistant";
      
      // Target the content container (.prose is Mistral's standard text body)
      const contentNode = el.querySelector('.prose') || el;

      messages.push({
        role: role,
        content: contentNode.innerHTML, 
        timestamp: new Date().toISOString(),
      });
    });

    return {
      platform: "mistral",
      title: document.title.replace(" | Mistral AI", ""),
      messages,
    };
  }
}

// Helper functions (shared or platform-specific)
function cleanContent(text) {
  return (text || "").replace(/\s+/g, " ").trim();
}

function extractTimestamp(element) {
  return new Date().toISOString();
}
