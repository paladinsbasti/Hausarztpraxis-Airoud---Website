import fs from 'fs';
import { createDoc, heading, paragraph, bulletList, sectionDivider, footer } from './styles.js';
import { contract } from './contractContent.js';

const outDir = 'out';
const outPath = `${outDir}/Vertrag_Oeffentlichkeitsarbeit_Arztpraxis.pdf`;

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const doc = createDoc();
const stream = fs.createWriteStream(outPath);
doc.pipe(stream);

// Title
heading(doc, contract.title, 1);
paragraph(doc, contract.preamble);
sectionDivider(doc);

// Parties
heading(doc, 'Vertragsparteien', 2);
contract.parties.forEach(p => paragraph(doc, p));
sectionDivider(doc);

// Sections
contract.sections.forEach((sec) => {
  heading(doc, sec.heading, 2);
  sec.paras.forEach((p) => paragraph(doc, p));
  sectionDivider(doc);
});

// Annexes
contract.annexes.forEach((annex, idx) => {
  heading(doc, annex.heading, 2);
  if (annex.paras) annex.paras.forEach((p) => paragraph(doc, p));
  if (annex.bullets) bulletList(doc, annex.bullets);
  if (idx < contract.annexes.length - 1) sectionDivider(doc);
});

// Signatures
heading(doc, 'Unterschriften', 2);
contract.signature.forEach((line) => paragraph(doc, line));

// Footer with page numbers
footer(doc);

// Finalize
doc.end();

stream.on('finish', () => {
  console.log(`PDF erstellt: ${outPath}`);
});
