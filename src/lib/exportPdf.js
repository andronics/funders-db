import { formatCurrency } from './formatters';

/**
 * Export funders to PDF (lazy loads jsPDF)
 */
export async function exportToPDF(funders, filename = 'funders.pdf') {
  // Dynamically import jsPDF to reduce initial bundle size
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.setTextColor(126, 184, 162); // brand accent color
  doc.text('UK Funders Database', 14, 22);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(102, 102, 102);
  doc.text(`${funders.length} funders - Generated ${new Date().toLocaleDateString('en-GB')}`, 14, 30);

  // Table
  doc.autoTable({
    startY: 38,
    head: [['Name', 'Est.', 'Grants', 'Focus Areas', 'Locations']],
    body: funders.map(f => [
      f.name || '',
      f.established || '-',
      formatCurrency(f.financial?.grants_to_organisations),
      (f.focus || []).slice(0, 2).join(', ') || '-',
      (f.locations || []).slice(0, 2).join(', ') || '-'
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [126, 184, 162],
      textColor: [10, 10, 10],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [20, 20, 20],
    },
    bodyStyles: {
      textColor: [200, 200, 200],
    },
    margin: { left: 14, right: 14 },
  });

  doc.save(filename);
}
