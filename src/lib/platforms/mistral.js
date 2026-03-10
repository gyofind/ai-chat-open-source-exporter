import AIPlatform from "../base.js";
import { wrapInFencedDiv } from "../../lib/utils/helpers.js";

export default class Mistral extends AIPlatform {
  // Define selectors as a static property
  static selectors = {
    container: '[data-message-author-role]',
    timestamp: '.text-hint.text-sm',
    // We use a comma-separated string for querySelector
    content: '[data-testid="text-message-part"], .select-text'
  };

  constructor() {
    // Pass to base class if instance methods still need them
    super(Mistral.selectors);
  }

  static detect() {
    return window.location.hostname.includes("mistral.ai");
  }

/**
 * Mistral Message Extractor
 * Returns a structured JSON object of the conversation.
 */
  static extractMessages() {
  // 1. Identify the conversation ID from the URL
    const conversationId = window.location.pathname.split('/').pop();
    
    // Use the static selectors instead of hardcoded strings
    const messageNodes = document.querySelectorAll(this.selectors.container);

    const messages = Array.from(messageNodes).map((node, index) => {
    // metadata extraction
    const role = node.getAttribute('data-message-author-role'); // "user" or "assistant"
    const messageId = node.getAttribute('data-message-id') || node.id;
      
    const timestampNode = node.querySelector(this.selectors.timestamp);
    const timestamp = timestampNode?.innerText?.trim() || null;

    // 3. Extract the Content
    // We target the specific part that contains the actual message text/html
    // Assistant uses [data-testid="text-message-part"]
    // User uses .select-text
      const contentNode = node.querySelector(this.selectors.content);
    
    // FIX: Fallback to empty string if contentNode isn't found
      const rawHtml = contentNode ? contentNode.innerHTML : "";

    // 4. Determine Formats present in the HTML
      const formats = [];
      if (rawHtml.includes('<table')) formats.push("table");
      if (rawHtml.includes('code-block') || rawHtml.includes('<pre')) formats.push("code");
      if (rawHtml.includes('katex')) formats.push("latex");
      if (rawHtml.includes('<blockquote')) formats.push("blockquote");
      if (formats.length === 0 && rawHtml.length > 0) formats.push("text");

      return {
        index: index,
        message_id: messageId,
        role: role,
        timestamp: timestamp,
        formats: formats,
      // The "raw" payload for later processing
        content_html: rawHtml.trim() 
      };
    });

    return {
      conversation_id: conversationId,
      extracted_at: new Date().toISOString(),
      total_messages: messages.length,
      messages: messages
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
