import { jsPDF } from "jspdf";
import TurndownService from "turndown";

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
  const turndownService = new TurndownService();
  return messages
    .map((msg) => wrapInFencedDiv(msg.role, turndownService.turndown(msg.content)))
    .join("\n\n");
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

export function generatePDF(messages) {
  const doc = new jsPDF();
  messages.forEach((msg, i) => {
    doc.text(10, 10 + (i * 10), `${msg.role}: ${msg.content}`);
  });
  return doc.output("blob");
}