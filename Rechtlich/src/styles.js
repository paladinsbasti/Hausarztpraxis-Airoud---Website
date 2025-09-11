import PDFDocument from 'pdfkit';

export const createDoc = () => new PDFDocument({ size: 'A4', margin: 56, info: { Title: 'Vertrag Öffentlichkeitsarbeit Arztpraxis', Author: 'Sebastian Schmitz' } });

export const styles = {
  h1: { font: 'Helvetica-Bold', size: 16, spacing: 10 },
  h2: { font: 'Helvetica-Bold', size: 12, spacing: 8 },
  p: { font: 'Helvetica', size: 10, spacing: 6 },
  small: { font: 'Helvetica', size: 9, spacing: 5 },
  list: { indent: 16, gap: 3 }
};

export function heading(doc, text, level = 1) {
  const s = level === 1 ? styles.h1 : styles.h2;
  doc.moveDown(0.3).font(s.font).fontSize(s.size).text(text, { align: 'left' });
  doc.moveDown(0.2);
}

export function paragraph(doc, text) {
  doc.font(styles.p.font).fontSize(styles.p.size).text(text, { align: 'justify' });
  doc.moveDown(0.25);
}

export function bulletList(doc, items) {
  const startX = doc.x;
  items.forEach((item) => {
    doc.circle(startX + 2, doc.y + 5, 1.2).fillColor('#000').fill().fillColor('#000');
    doc.text('   ' + item, startX + 6, doc.y - 3, { width: doc.page.width - doc.page.margins.left - doc.page.margins.right - 12, align: 'justify' });
    doc.moveDown(0.1);
  });
  doc.moveDown(0.3);
}

export function sectionDivider(doc) {
  const y = doc.y + 2;
  doc.moveTo(doc.page.margins.left, y).lineTo(doc.page.width - doc.page.margins.right, y).lineWidth(0.5).stroke();
  doc.moveDown(0.4);
}

export function footer(doc) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    const bottom = doc.page.height - doc.page.margins.bottom + 20;
    doc.font('Helvetica').fontSize(8).fillColor('#333').text(`Seite ${i + 1} von ${range.count}`, 0, bottom, { align: 'center' });
  }
}
