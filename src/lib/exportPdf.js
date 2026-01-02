import { formatCurrency } from './formatters';
import { BRAND, PAGE, addHeader, addFooterToAllPages } from './pdfComponents';

/**
 * Export funders to PDF as condensed list/table (lazy loads jsPDF)
 */
export async function exportListPDF(funders, filename) {
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF();

  // Header
  const startY = addHeader(doc, {
    subtitle: `${funders.length} funders`,
  });

  // Table
  doc.autoTable({
    startY,
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
      fillColor: BRAND.accent,
      textColor: BRAND.black,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: BRAND.dark,
    },
    bodyStyles: {
      textColor: [200, 200, 200],
    },
    margin: { left: PAGE.margin, right: PAGE.margin },
  });

  // Add footers to all pages
  addFooterToAllPages(doc);

  const outputFilename = filename || `funders-list-${Date.now()}.pdf`;
  doc.save(outputFilename);

  return {
    filename: outputFilename,
    funderCount: funders.length,
    pageCount: doc.internal.getNumberOfPages(),
  };
}

// Keep old function name for backwards compatibility
export const exportToPDF = exportListPDF;
