/**
 * Export funders as address labels to PDF
 */

export async function exportLabelsPDF(funders, template, options = {}) {
  const { default: jsPDF } = await import('jspdf');

  const { includeContactName = true } = options;

  // Filter to funders with addresses
  const fundersWithAddress = funders.filter(f => f.contact?.address?.trim());

  if (fundersWithAddress.length === 0) {
    throw new Error('No funders with addresses to export');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const labelsPerPage = template.cols * template.rows;

  fundersWithAddress.forEach((funder, i) => {
    // Add new page after filling previous
    if (i > 0 && i % labelsPerPage === 0) {
      doc.addPage();
    }

    const positionOnPage = i % labelsPerPage;
    const col = positionOnPage % template.cols;
    const row = Math.floor(positionOnPage / template.cols);

    const x = template.marginLeft + col * (template.labelWidth + template.gapX);
    const y = template.marginTop + row * (template.labelHeight + template.gapY);

    drawLabel(doc, funder, x, y, template, { includeContactName });
  });

  const filename = `labels-${template.id}-${Date.now()}.pdf`;
  doc.save(filename);

  return {
    filename,
    labelCount: fundersWithAddress.length,
    pageCount: Math.ceil(fundersWithAddress.length / labelsPerPage),
  };
}

function drawLabel(doc, funder, x, y, template, options) {
  const padding = 2; // mm
  const maxWidth = template.labelWidth - padding * 2;
  const maxHeight = template.labelHeight - padding * 2;

  // Calculate font size based on label height
  const baseFontSize = Math.min(9, template.labelHeight / 5);
  const lineHeight = baseFontSize * 0.4;

  let textY = y + padding + baseFontSize * 0.35;

  doc.setTextColor(0, 0, 0);

  // Organization name (bold)
  doc.setFontSize(baseFontSize);
  doc.setFont('helvetica', 'bold');
  const nameLines = doc.splitTextToSize(funder.name || '', maxWidth);
  nameLines.forEach(line => {
    if (textY < y + template.labelHeight - padding) {
      doc.text(line, x + padding, textY);
      textY += lineHeight;
    }
  });

  // Contact name (optional)
  if (options.includeContactName && funder.contact?.name) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(baseFontSize - 1);
    if (textY < y + template.labelHeight - padding) {
      const contactLines = doc.splitTextToSize(funder.contact.name, maxWidth);
      contactLines.forEach(line => {
        if (textY < y + template.labelHeight - padding) {
          doc.text(line, x + padding, textY);
          textY += lineHeight * 0.9;
        }
      });
    }
  }

  // Address lines
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(baseFontSize - 1);
  const addressText = funder.contact?.address || '';
  const addressLines = addressText.split('\n').filter(line => line.trim());

  addressLines.forEach(line => {
    if (textY < y + template.labelHeight - padding) {
      const wrappedLines = doc.splitTextToSize(line.trim(), maxWidth);
      wrappedLines.forEach(wrappedLine => {
        if (textY < y + template.labelHeight - padding) {
          doc.text(wrappedLine, x + padding, textY);
          textY += lineHeight * 0.9;
        }
      });
    }
  });
}

/**
 * Get count of funders with valid addresses
 */
export function countFundersWithAddress(funders) {
  return funders.filter(f => f.contact?.address?.trim()).length;
}

/**
 * Calculate number of pages needed
 */
export function calculatePages(funderCount, template) {
  const labelsPerPage = template.cols * template.rows;
  return Math.ceil(funderCount / labelsPerPage);
}
