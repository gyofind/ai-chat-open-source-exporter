import { jsPDF } from "jspdf";
import TurndownService from 'turndown';

// --- Configuration ---
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '_',
});

turndownService.addRule('taskList', {
  filter: (node) => node.type === 'checkbox',
  replacement: (content, node) => (node.checked ? '[x] ' : '[ ] ')
});

export function generateJSON(messages) {
  return JSON.stringify(messages, null, 2);
}

/**
 * Converts the structured JSON conversation into a formatted Markdown string.
 * Supports both full dataPackage object and raw messages array.
 */
export function generateMarkdown(input) {
  // Determine if input is the full package or just the array
  const messages = Array.isArray(input) ? input : (input?.messages || []);

  if (messages.length === 0) {
    console.warn("generateMarkdown: No messages to process.");
    return "";
  }

  return messages
    .map((msg) => {
      const markdownContent = turndownService.turndown(msg.content_html || "");
      return wrapInFencedDiv(msg.role, markdownContent, msg.message_id, msg.timestamp);
    })
    .join("\n\n");
}

export function generatePDF(messages) {
  const doc = new jsPDF();
  let y = 10;
  messages.forEach((msg) => {
    // PDF generator needs a fallback since it doesn't render HTML easily
    // We strip HTML tags for a basic text PDF
    const plainText = (msg.content_html || "").replace(/<[^>]*>?/gm, '');
    doc.text(10, y, `${msg.role.toUpperCase()}:`);
    y += 7;
    const splitText = doc.splitTextToSize(plainText, 180);
    doc.text(10, y, splitText);
    y += (splitText.length * 7) + 5;
    
    if (y > 270) {
      doc.addPage();
      y = 10;
    }
  });
  return doc.output("blob");
}

/**
 * Wraps content in a Pandoc-style fenced div with metadata attributes.
 */
export function wrapInFencedDiv(role, content, id, timestamp) {
  const escapedContent = escapeTripleColons(content);
  
  const attrId = id ? `#${id}` : `#msg-${role}-${Math.random().toString(36).substring(2, 7)}`;
  const timeAttr = timestamp ? ` data-timestamp="${timestamp}"` : "";

  return `::: {.ai-chat-message ${attrId} data-role="${role}"${timeAttr}}

${escapedContent}

:::`;
}

/**
 * Prevents nested fenced divs from breaking the parser.
 */
export function escapeTripleColons(content) {
  return content.replace(/:::/g, '\\:::');
}