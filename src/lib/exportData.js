/**
 * Data export functions for JSON, JSONL, and CSV formats
 */

/**
 * CSV column definitions - exports ALL funder fields
 */
const CSV_COLUMNS = [
  // Core fields
  { header: 'id', accessor: f => f.id },
  { header: 'external', accessor: f => f.external },
  { header: 'version', accessor: f => f.version },
  { header: 'name', accessor: f => f.name },
  { header: 'established', accessor: f => f.established },
  { header: 'url', accessor: f => f.url },
  { header: 'types', accessor: f => f.types },
  { header: 'applications_unsolicited', accessor: f => f.applications_unsolicited },

  // Array fields (semicolon separated)
  { header: 'categories', accessor: f => (f.categories || []).join('; ') },
  { header: 'beneficiaries', accessor: f => (f.beneficiaries || []).join('; ') },
  { header: 'focus', accessor: f => (f.focus || []).join('; ') },
  { header: 'locations', accessor: f => (f.locations || []).join('; ') },
  { header: 'trustees', accessor: f => (f.trustees || []).join('; ') },
  { header: 'tags', accessor: f => (f.tags || []).join('; ') },
  { header: 'sources', accessor: f => (f.sources || []).join('; ') },

  // Information fields
  { header: 'information_general', accessor: f => f.information_general },
  { header: 'information_beneficial_area', accessor: f => f.information_beneficial_area },
  { header: 'information_beneficial_sample', accessor: f => f.information_beneficial_sample },
  { header: 'information_exclusions', accessor: f => f.information_exclusions },
  { header: 'information_focus', accessor: f => f.information_focus },
  { header: 'information_last_updated', accessor: f => f.information_last_updated },

  // Financial (flattened)
  { header: 'financial_year_end', accessor: f => f.financial?.year_end },
  { header: 'financial_assets', accessor: f => f.financial?.assets },
  { header: 'financial_income', accessor: f => f.financial?.income },
  { header: 'financial_grants_to_organisations', accessor: f => f.financial?.grants_to_organisations },
  { header: 'financial_organisations_supported', accessor: f => f.financial?.organisations_supported },

  // Contact (flattened)
  { header: 'contact_name', accessor: f => f.contact?.name },
  { header: 'contact_email', accessor: f => f.contact?.email },
  { header: 'contact_telephone', accessor: f => f.contact?.telephone },
  { header: 'contact_address', accessor: f => (f.contact?.address || '').replace(/\n/g, ', ') },

  // Social (flattened)
  { header: 'social_twitter', accessor: f => f.social?.twitter },
  { header: 'social_facebook', accessor: f => f.social?.facebook },
  { header: 'social_instagram', accessor: f => f.social?.instagram },
];

/**
 * Download content as a file
 */
function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Escape a value for CSV (handle commas, quotes, newlines)
 */
function escapeCSV(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Export funders to CSV with all fields
 */
export function exportToCSV(funders, filename) {
  const headers = CSV_COLUMNS.map(c => c.header);
  const rows = funders.map(f =>
    CSV_COLUMNS.map(c => escapeCSV(c.accessor(f))).join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export funders to JSON (pretty-printed array)
 */
export function exportToJSON(funders, filename) {
  const json = JSON.stringify(funders, null, 2);
  downloadBlob(json, filename, 'application/json');
}

/**
 * Export funders to JSONL (one JSON object per line)
 */
export function exportToJSONL(funders, filename) {
  const jsonl = funders.map(f => JSON.stringify(f)).join('\n');
  downloadBlob(jsonl, filename, 'application/x-ndjson');
}

/**
 * Export funders in the specified format
 */
export function exportData(funders, format, scope) {
  const timestamp = Date.now();
  const scopeLabel = scope === 'full' ? 'full' : 'filtered';

  switch (format) {
    case 'json':
      exportToJSON(funders, `funders-${scopeLabel}-${timestamp}.json`);
      break;
    case 'jsonl':
      exportToJSONL(funders, `funders-${scopeLabel}-${timestamp}.jsonl`);
      break;
    case 'csv':
      exportToCSV(funders, `funders-${scopeLabel}-${timestamp}.csv`);
      break;
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}

/**
 * Estimate file size for a given format
 */
export function estimateFileSize(funders, format) {
  const count = funders.length;

  switch (format) {
    case 'json':
      // JSON with formatting: ~1.5KB per record average
      return count * 1500;
    case 'jsonl':
      // JSONL is more compact: ~1.2KB per record
      return count * 1200;
    case 'csv':
      // CSV with all fields: ~1KB per record
      return count * 1000;
    default:
      return 0;
  }
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
