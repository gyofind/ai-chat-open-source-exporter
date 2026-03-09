/**
 * @file scripts/generate-icons.js
 * @description Automates SVG to PNG conversion for extension icons.
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const IMG_DIR = 'assets/icons';
const OUT_DIR = 'public/icons';
const SIZES = [16, 32, 48, 96];

const CONFIG = [
  { input: 'logo-ADLaM-light-theme.svg', prefix: 'icon-light-theme' },
  { input: 'logo-ADLaM-dark-theme.svg', prefix: 'icon-dark-theme' }
];

async function generateIcons() {
  // Ensure output directory exists
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  for (const { input, prefix } of CONFIG) {
    const inputPath = path.join(IMG_DIR, input);
    
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Source not found: ${inputPath}`);
      continue;
    }

    for (const size of SIZES) {
      const outputPath = path.join(OUT_DIR, `${prefix}-${size}.png`);
      
      await sharp(inputPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: ${outputPath}`);
    }
  }
}

generateIcons().catch(console.error);