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

  static extract() {
    const messages = [];
    document
      .querySelectorAll("[data-role='user'], [data-role='assistant']")
      .forEach((el) => {
        messages.push({
          role: el.getAttribute("data-role"),
          content: cleanContent(el.textContent),
          timestamp: extractTimestamp(el),
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
