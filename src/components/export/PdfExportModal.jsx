import { useState, useMemo } from 'react';
import { labelTemplates } from '../../data/labelTemplates';
import { exportLabelsPDF, countFundersWithAddress, calculatePages } from '../../lib/exportLabels';
import { exportListPDF } from '../../lib/exportPdf';
import { exportDetailedPDF } from '../../lib/exportPdfDetailed';
import { XIcon } from '../ui/Icons';

const FORMATS = [
  { id: 'labels', label: 'Labels', description: 'Mailing labels (Avery templates)' },
  { id: 'list', label: 'List', description: 'Condensed table, multiple per page' },
  { id: 'detailed', label: 'Detailed', description: 'Full info, one funder per page' },
];

export function PdfExportModal({ funders, onClose }) {
  const [selectedFormat, setSelectedFormat] = useState('list');
  const [selectedTemplateId, setSelectedTemplateId] = useState('L7160');
  const [includeContactName, setIncludeContactName] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const selectedTemplate = useMemo(
    () => labelTemplates.find(t => t.id === selectedTemplateId),
    [selectedTemplateId]
  );

  const addressCount = useMemo(
    () => countFundersWithAddress(funders),
    [funders]
  );

  const labelPageCount = useMemo(
    () => selectedTemplate ? calculatePages(addressCount, selectedTemplate) : 0,
    [addressCount, selectedTemplate]
  );

  // Calculate summary based on format
  const summary = useMemo(() => {
    switch (selectedFormat) {
      case 'labels':
        return {
          count: addressCount,
          pages: labelPageCount,
          unit: 'labels',
          valid: addressCount > 0,
          warning: addressCount === 0 ? 'No funders with addresses in current selection' : null,
        };
      case 'list':
        // Estimate ~30 funders per page for table
        return {
          count: funders.length,
          pages: Math.ceil(funders.length / 30),
          unit: 'funders',
          valid: funders.length > 0,
          warning: funders.length === 0 ? 'No funders in current selection' : null,
        };
      case 'detailed':
        return {
          count: funders.length,
          pages: funders.length,
          unit: 'funders',
          valid: funders.length > 0,
          warning: funders.length > 100 ? `Large export: ${funders.length} pages` : null,
        };
      default:
        return { count: 0, pages: 0, unit: '', valid: false };
    }
  }, [selectedFormat, funders.length, addressCount, labelPageCount]);

  const handleExport = async () => {
    if (!summary.valid) return;

    setIsExporting(true);
    setError(null);

    try {
      switch (selectedFormat) {
        case 'labels':
          await exportLabelsPDF(funders, selectedTemplate, { includeContactName });
          break;
        case 'list':
          await exportListPDF(funders);
          break;
        case 'detailed':
          await exportDetailedPDF(funders);
          break;
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-lg border border-brand-border bg-brand-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
          <h2 className="text-base font-medium text-white">Export as PDF</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-brand-muted hover:bg-brand-border hover:text-white"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 px-4 py-4">
          {/* Format tabs */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-brand-muted">
              Format
            </label>
            <div className="flex rounded-lg border border-brand-border bg-brand-dark p-1">
              {FORMATS.map(format => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedFormat === format.id
                      ? 'bg-brand-accent text-brand-dark'
                      : 'text-brand-muted hover:text-white'
                  }`}
                >
                  {format.label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-brand-muted">
              {FORMATS.find(f => f.id === selectedFormat)?.description}
            </p>
          </div>

          {/* Format-specific options */}
          {selectedFormat === 'labels' && (
            <>
              {/* Template selector */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-brand-muted">
                  Label Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full rounded border border-brand-border bg-brand-dark px-3 py-2 text-sm text-white focus:border-brand-accent focus:outline-none"
                >
                  {labelTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} — {template.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template info */}
              {selectedTemplate && (
                <div className="rounded border border-brand-border bg-brand-dark/50 p-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-brand-muted">Label Size:</span>
                      <span className="ml-1 text-white">
                        {selectedTemplate.labelWidth} × {selectedTemplate.labelHeight} mm
                      </span>
                    </div>
                    <div>
                      <span className="text-brand-muted">Layout:</span>
                      <span className="ml-1 text-white">
                        {selectedTemplate.cols} × {selectedTemplate.rows}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Include contact name option */}
              <div>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeContactName}
                    onChange={(e) => setIncludeContactName(e.target.checked)}
                    className="h-4 w-4 rounded border-brand-border bg-brand-dark text-brand-accent focus:ring-brand-accent"
                  />
                  <span className="text-sm text-white">Include contact name</span>
                </label>
              </div>
            </>
          )}

          {selectedFormat === 'list' && (
            <div className="rounded border border-brand-border bg-brand-dark/50 p-3">
              <p className="text-xs text-brand-muted">
                Exports a condensed table with name, established year, grants, focus areas, and locations.
              </p>
            </div>
          )}

          {selectedFormat === 'detailed' && (
            <div className="rounded border border-brand-border bg-brand-dark/50 p-3">
              <p className="text-xs text-brand-muted">
                Exports full details for each funder including contact info, financials, focus areas, beneficiaries, locations, and trustees.
              </p>
            </div>
          )}

          {/* Summary */}
          <div className={`rounded border p-3 ${
            summary.warning && !summary.valid
              ? 'border-yellow-500/30 bg-yellow-500/10'
              : 'border-brand-accent/30 bg-brand-accent/10'
          }`}>
            {summary.valid ? (
              <p className={`text-sm ${summary.warning ? 'text-yellow-400' : 'text-brand-accent'}`}>
                {summary.warning || (
                  <>
                    Will export <strong>{summary.count}</strong> {summary.unit} ({summary.pages} {summary.pages === 1 ? 'page' : 'pages'})
                  </>
                )}
              </p>
            ) : (
              <p className="text-sm text-yellow-400">
                {summary.warning}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-brand-border px-4 py-3">
          <button
            onClick={onClose}
            className="rounded border border-brand-border px-4 py-2 text-sm text-brand-muted hover:bg-brand-border hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || !summary.valid}
            className="rounded bg-brand-accent px-4 py-2 text-sm font-medium text-brand-dark hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : 'Generate PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
