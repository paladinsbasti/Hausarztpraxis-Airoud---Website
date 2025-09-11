// Converts an HTML file to PDF using Playwright (Chromium).
// Requires: npm i -D playwright
// Usage: node scripts/html-to-pdf.js "out/Vertrag_Oeffentlichkeitsarbeit_Arztpraxis.html" "out/Vertrag_Oeffentlichkeitsarbeit_Arztpraxis.pdf"
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function main() {
  const [,, inPathArg, outPathArg] = process.argv;
  if (!inPathArg || !outPathArg) {
    console.error('Usage: node scripts/html-to-pdf.js <input.html> <output.pdf>');
    process.exit(1);
  }
  const inPath = path.resolve(inPathArg);
  const outPath = path.resolve(outPathArg);
  if (!fs.existsSync(inPath)) {
    console.error('Input HTML not found:', inPath);
    process.exit(1);
  }
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + inPath.replace(/\\/g, '/'));
  await page.pdf({ path: outPath, format: 'A4', margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }, printBackground: true });
  await browser.close();
  console.log('PDF erstellt:', outPath);
}

main().catch((err) => { console.error(err); process.exit(1); });
