import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import Mistral from '../../src/lib/platforms/mistral.js';
import { generateMarkdown } from '../../src/lib/utils/helpers.js';

// --- Paths ---
const ACTIVE_SOURCE = path.resolve('tests/snapshots/mistral-page-source.html');
const HISTORY_DIR = path.resolve('tests/snapshots/history');

/**
 * Generates a unique ID based on date/time
 */
function getUniqueId() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-'); // e.g. 2026-03-08T22-45-00
}

async function runSnapshotTest() {
  console.log('🧪 Starting Structured Snapshot Test...');

  // 1. Ensure history directory exists
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
  }

  // 2. Read the active HTML
  if (!fs.existsSync(ACTIVE_SOURCE)) {
    console.error(`❌ Source file not found: ${ACTIVE_SOURCE}`);
    return;
  }
  const rawHtml = fs.readFileSync(ACTIVE_SOURCE, 'utf-8');

  // 3. Setup Virtual DOM for the Scraper
  const dom = new JSDOM(rawHtml);
  global.window = dom.window;
  global.document = dom.window.document;

  try {
    const id = getUniqueId();
    console.log(`🆔 Test ID: ${id}`);

    // 4. Scrape and Convert
    const dataPackage = Mistral.extractMessages();
    
    if (!dataPackage.messages || dataPackage.messages.length === 0) {
      console.warn('⚠️ No messages found by the scraper.');
    }

    const markdownOutput = generateMarkdown(dataPackage.messages);

    // 5. Save the History Pair
    const sourceHistoryPath = path.join(HISTORY_DIR, `tm2m-${id}-source.html`);
    const outputHistoryPath = path.join(HISTORY_DIR, `tm2m-${id}-output.md`);

    fs.writeFileSync(sourceHistoryPath, rawHtml, 'utf-8');
    fs.writeFileSync(outputHistoryPath, markdownOutput, 'utf-8');

    console.log(`✅ Success!`);
    console.log(`📂 Source saved to: ${sourceHistoryPath}`);
    console.log(`📝 Output saved to: ${outputHistoryPath}`);
    console.log(`📊 Messages found: ${dataPackage.messages.length}`);

  } catch (error) {
    console.error('💥 Test execution failed:', error);
  }
}

runSnapshotTest();