import { jsPDF } from "jspdf";
import TurndownService from "turndown";

export function generateJSON(messages) {
  return JSON.stringify(messages, null, 2);
}

export function generatePDF(messages) {
  const doc = new jsPDF();
  let y = 10;
  messages.forEach((msg) => {
    doc.text(10, y, `${msg.role}: ${msg.content}`);
    y += 10;
  });
  return doc.output("blob");
}

export function generateMarkdown(messages) {
  const turndownService = new TurndownService({
    // --- Configuring TurndownService for consistent output ---
    headingStyle: 'atx',          // Use ATX headings (e.g., ## My Heading)
    codeBlockStyle: 'fenced',     // Use fenced code blocks (```python\ncode\n```)
    bulletListMarker: '-',        // Use hyphens for unordered list markers
    // Add any other desired Turndown options here for consistency
    // --- End TurndownService configuration ---
  });
  return messages
    .map((msg) => wrapInFencedDiv(msg.role, turndownService.turndown(msg.content)))
    .join("\n\n");
}

export function wrapInFencedDiv(role, content) {
  const messageId = `msg-${role}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const escapedContent = escapeTripleColons(content);
  return `::: {.ai-chat-message #${messageId} data-role="${role}"}

${escapedContent}

:::`;
}

export function escapeTripleColons(content) {
  return content.replace(/:::/g, '\\:::'); // Escape triple colons
}
