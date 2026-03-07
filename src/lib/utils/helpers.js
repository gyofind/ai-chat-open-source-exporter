import { jsPDF } from "jspdf";

export function generatePDF(messages) {
  const doc = new jsPDF();
  let y = 10;
  messages.forEach((msg) => {
    doc.text(10, y, `${msg.role}: ${msg.content}`);
    y += 10;
  });
  return doc.output("blob");
}

import TurndownService from "turndown";

export function generateMarkdown(messages) {
  const turndownService = new TurndownService();
  return messages
    .map((msg) => `**${msg.role}**:\n${turndownService.turndown(msg.content)}`)
    .join("\n\n---\n\n");
}

export function generatePDF(messages) {
  const doc = new jsPDF();
  messages.forEach((msg, i) => {
    doc.text(10, 10 + (i * 10), `${msg.role}: ${msg.content}`);
  });
  return doc.output("blob");
}