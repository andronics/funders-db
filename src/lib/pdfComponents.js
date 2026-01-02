/**
 * Shared PDF components for consistent branding across all PDF exports
 */

// Brand colors (RGB arrays for jsPDF) - print-friendly for white paper
export const BRAND = {
  // Brand colors (header/footer accents)
  accent: [126, 184, 162],     // Teal - header title
  accentDark: [80, 130, 110],  // Darker teal for better print contrast

  // Print-friendly content colors (black/gray saves ink)
  black: [0, 0, 0],            // Primary body text
  darkGray: [51, 51, 51],      // Secondary text (#333)
  gray: [102, 102, 102],       // Muted/subtitle text (#666)
  lightGray: [153, 153, 153],  // Tertiary text (#999)
  white: [255, 255, 255],      // Backgrounds if needed
};

// Page dimensions (A4 portrait)
export const PAGE = {
  width: 210,
  height: 297,
  margin: 14,
  contentWidth: 182, // 210 - 14*2
};

/**
 * Add branded header to a PDF page
 * @returns {number} Y position after header (for content start)
 */
export function addHeader(doc, { title = 'UK Funders Database', subtitle = '', showDate = true }) {
  const dateStr = new Date().toLocaleDateString('en-GB');

  // Title
  doc.setFontSize(18);
  doc.setTextColor(...BRAND.accent);
  doc.text(title, PAGE.margin, 20);

  // Subtitle line
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.gray);

  const subtitleParts = [];
  if (subtitle) subtitleParts.push(subtitle);
  if (showDate) subtitleParts.push(`Generated ${dateStr}`);

  if (subtitleParts.length > 0) {
    doc.text(subtitleParts.join(' - '), PAGE.margin, 28);
  }

  // Return Y position for content to start
  return 36;
}

/**
 * Add footer with page numbers
 * Note: Call this after all content is added, looping through pages
 */
export function addFooterToAllPages(doc) {
  const totalPages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
}

/**
 * Add footer to current page
 */
export function addFooter(doc, pageNum, totalPages) {
  const y = PAGE.height - 10;

  doc.setFontSize(8);
  doc.setTextColor(...BRAND.gray);

  // Page number on left
  doc.text(`Page ${pageNum} of ${totalPages}`, PAGE.margin, y);

  // Site URL on right
  const url = 'fundersdb.org';
  const urlWidth = doc.getTextWidth(url);
  doc.text(url, PAGE.width - PAGE.margin - urlWidth, y);
}

/**
 * Draw a section title (uppercase, muted)
 * @returns {number} New Y position after title
 */
export function drawSectionTitle(doc, title, y) {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND.gray);
  doc.text(title.toUpperCase(), PAGE.margin, y);
  return y + 6;
}

/**
 * Draw wrapped text that fits within page width
 * @returns {number} New Y position after text
 */
export function drawWrappedText(doc, text, y, options = {}) {
  const {
    fontSize = 10,
    color = BRAND.black,
    maxWidth = PAGE.contentWidth,
    lineHeight = 5,
  } = options;

  if (!text) return y;

  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...color);

  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line) => {
    // Check for page overflow
    if (y > PAGE.height - 20) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, PAGE.margin, y);
    y += lineHeight;
  });

  return y;
}

/**
 * Draw a list of tags/items inline
 * @returns {number} New Y position after tags
 */
export function drawTagList(doc, items, y, options = {}) {
  const { separator = ' • ', color = BRAND.darkGray, fontSize = 9 } = options;

  if (!items || items.length === 0) return y;

  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...color);

  const text = items.join(separator);
  const lines = doc.splitTextToSize(text, PAGE.contentWidth);

  lines.forEach((line) => {
    if (y > PAGE.height - 20) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, PAGE.margin, y);
    y += 5;
  });

  return y;
}

/**
 * Check if we need a new page, add one if so
 * @returns {number} Current or reset Y position
 */
export function checkPageBreak(doc, y, requiredSpace = 30) {
  if (y > PAGE.height - requiredSpace) {
    doc.addPage();
    return 20;
  }
  return y;
}
