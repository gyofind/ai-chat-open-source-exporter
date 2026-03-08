import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom'; // You'll need this: npm install jsdom
import Mistral from '../src/lib/platforms/mistral.js';
import { generateMarkdown } from '../src/lib/utils/helpers.js';

const htmlInputPath = path.resolve('test/test_mistral_chat_sample.html');
const mdOutputPath = path.resolve('test/test_mistral_output.md');

function runTest() {
  console.log('🧪 Running Extraction + Conversion Test...');

  // 1. Read the full HTML file
  const rawHtml = fs.readFileSync(htmlInputPath, 'utf-8');

  // 2. Setup a virtual DOM so Mistral.extractMessages() can work
  const dom = new JSDOM(rawHtml);
  global.window = dom.window;
  global.document = dom.window.document;

  try {
    // 3. NOW run the real scraper logic
    // This will use your selectors to IGNORE the scripts/nav and find the messages
    const dataPackage = Mistral.extractMessages();

    if (dataPackage.messages.length === 0) {
      console.error('❌ Scraper found 0 messages. Check your selectors in mistral.js');
      return;
    }

    console.log(`✅ Scraper found ${dataPackage.messages.length} messages.`);

    // 4. Convert the extracted (clean) messages to Markdown
    const markdownOutput = generateMarkdown(dataPackage.messages);

    // 5. Write the result
    fs.writeFileSync(mdOutputPath, markdownOutput, 'utf-8');
    
    console.log(`📄 Success! Clean Markdown saved to: ${mdOutputPath}`);
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTest();