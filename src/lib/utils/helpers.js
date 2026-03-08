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
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced'
  });

  return messages
    .map((msg) => {
      // Convert the HTML content to Markdown
      const markdownBody = turndownService.turndown(msg.content);
      return wrapInFencedDiv(msg.role, markdownBody);
    })
    .join("\n\n---\n\n"); // Added a visual separator between messages
}

export function wrapInFencedDiv(role, content) {
  const messageId = `msg-${role}-${Date.now()}`;
  const escapedContent = escapeTripleColons(content);
  return `::: {.ai-chat-message #${messageId} data-role="${role}"}

${escapedContent}

:::`;
}

export function escapeTripleColons(content) {
  return content.replace(/:::/g, '\\:::'); // Escape triple colons
}
