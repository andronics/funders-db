import { formatCurrency, formatDate } from './formatters';
import {
  BRAND,
  PAGE,
  addHeader,
  addFooterToAllPages,
  drawSectionTitle,
  drawWrappedText,
  drawTagList,
  checkPageBreak,
} from './pdfComponents';

/**
 * Export funders to PDF with detailed info (one funder per page)
 */
export async function exportDetailedPDF(funders, filename) {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF();

  funders.forEach((funder, index) => {
    if (index > 0) {
      doc.addPage();
    }

    let y = drawFunderPage(doc, funder, index + 1, funders.length);
  });

  // Add footers to all pages
  addFooterToAllPages(doc);

  const outputFilename = filename || `funders-detailed-${Date.now()}.pdf`;
  doc.save(outputFilename);

  return {
    filename: outputFilename,
    funderCount: funders.length,
    pageCount: doc.internal.getNumberOfPages(),
  };
}

/**
 * Draw a single funder's detailed page
 */
function drawFunderPage(doc, funder, pageNum, totalFunders) {
  let y = 20;

  // Funder name (large)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND.accent);

  const nameLines = doc.splitTextToSize(funder.name || 'Unknown Funder', PAGE.contentWidth - 40);
  nameLines.forEach(line => {
    doc.text(line, PAGE.margin, y);
    y += 7;
  });

  // Established year (inline with name, right-aligned)
  if (funder.established) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BRAND.muted);
    const estText = `Est. ${funder.established}`;
    const estWidth = doc.getTextWidth(estText);
    doc.text(estText, PAGE.width - PAGE.margin - estWidth, 20);
  }

  y += 4;

  // About section
  if (funder.information_general) {
    y = drawSectionTitle(doc, 'About', y);
    y = drawWrappedText(doc, funder.information_general, y, {
      fontSize: 9,
      color: BRAND.text,
      lineHeight: 4.5,
    });
    y += 6;
  }

  // Contact and Financials side by side
  y = checkPageBreak(doc, y, 50);
  const contactFinancialsY = y;

  // Contact (left column)
  if (funder.contact && (funder.contact.name || funder.contact.email || funder.contact.telephone || funder.contact.address)) {
    y = drawSectionTitle(doc, 'Contact', y);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BRAND.text);

    if (funder.contact.name) {
      doc.text(funder.contact.name, PAGE.margin, y);
      y += 5;
    }
    if (funder.contact.email) {
      doc.setTextColor(...BRAND.accent);
      doc.text(funder.contact.email, PAGE.margin, y);
      doc.setTextColor(...BRAND.text);
      y += 5;
    }
    if (funder.contact.telephone) {
      doc.text(funder.contact.telephone, PAGE.margin, y);
      y += 5;
    }
    if (funder.contact.address) {
      const addressLines = funder.contact.address.split('\n').filter(l => l.trim());
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.muted);
      addressLines.forEach(line => {
        doc.text(line.trim(), PAGE.margin, y);
        y += 4;
      });
    }
    y += 4;
  }

  // Financials (right column)
  const rightColX = PAGE.width / 2 + 10;
  if (funder.financial) {
    let fy = contactFinancialsY;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND.muted);
    doc.text('FINANCIALS', rightColX, fy);
    fy += 6;

    if (funder.financial.year_end) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...BRAND.muted);
      doc.text(`Year end: ${formatDate(funder.financial.year_end)}`, rightColX, fy);
      fy += 5;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const financialRows = [
      { label: 'Assets', value: funder.financial.assets },
      { label: 'Income', value: funder.financial.income },
      { label: 'Grants to orgs', value: funder.financial.grants_to_organisations, highlight: true },
    ];

    financialRows.forEach(row => {
      if (row.value != null) {
        doc.setTextColor(...BRAND.muted);
        doc.text(row.label, rightColX, fy);

        doc.setTextColor(...(row.highlight ? BRAND.accent : BRAND.text));
        doc.text(formatCurrency(row.value), rightColX + 50, fy);
        fy += 5;
      }
    });

    if (funder.financial.organisations_supported) {
      doc.setTextColor(...BRAND.muted);
      doc.text(`Supporting ${funder.financial.organisations_supported} organisations`, rightColX, fy);
      fy += 5;
    }

    // Use whichever column is longer
    y = Math.max(y, fy) + 6;
  }

  // Focus Areas
  y = checkPageBreak(doc, y, 25);
  if (funder.focus && funder.focus.length > 0) {
    y = drawSectionTitle(doc, 'Focus Areas', y);
    y = drawTagList(doc, funder.focus, y, { color: BRAND.text });
    y += 6;
  }

  // Beneficiaries
  y = checkPageBreak(doc, y, 25);
  if (funder.beneficiaries && funder.beneficiaries.length > 0) {
    y = drawSectionTitle(doc, 'Beneficiaries', y);
    y = drawTagList(doc, funder.beneficiaries, y, { color: BRAND.text });
    y += 6;
  }

  // Locations
  y = checkPageBreak(doc, y, 25);
  if (funder.locations && funder.locations.length > 0) {
    y = drawSectionTitle(doc, 'Locations', y);
    y = drawTagList(doc, funder.locations, y, { color: BRAND.accent });
    y += 6;
  }

  // Categories/Funding Types
  y = checkPageBreak(doc, y, 25);
  if (funder.categories && funder.categories.length > 0) {
    y = drawSectionTitle(doc, 'Funding Types', y);
    y = drawTagList(doc, funder.categories, y, { color: BRAND.text });
    y += 6;
  }

  // Trustees
  y = checkPageBreak(doc, y, 25);
  if (funder.trustees && funder.trustees.length > 0) {
    y = drawSectionTitle(doc, 'Trustees', y);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BRAND.muted);
    const trusteesText = funder.trustees.join(', ');
    const lines = doc.splitTextToSize(trusteesText, PAGE.contentWidth);
    lines.forEach(line => {
      doc.text(line, PAGE.margin, y);
      y += 4;
    });
    y += 4;
  }

  // Source link at bottom
  if (funder.url) {
    y = checkPageBreak(doc, y, 15);
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    doc.text('Source: ', PAGE.margin, y);
    doc.setTextColor(...BRAND.accent);
    doc.text(funder.url, PAGE.margin + 15, y);
  }

  return y;
}
