import { useState, useMemo } from 'react';
import { labelTemplates } from '../../data/labelTemplates';
import { exportLabelsPDF, countFundersWithAddress, calculatePages } from '../../lib/exportLabels';
import { XIcon } from '../ui/Icons';

export function LabelExportModal({ funders, onClose }) {
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

  const pageCount = useMemo(
    () => selectedTemplate ? calculatePages(addressCount, selectedTemplate) : 0,
    [addressCount, selectedTemplate]
  );

  const handleExport = async () => {
    if (!selectedTemplate || addressCount === 0) return;

    setIsExporting(true);
    setError(null);

    try {
      await exportLabelsPDF(funders, selectedTemplate, { includeContactName });
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
          <h2 className="text-base font-medium text-white">Export Address Labels</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-brand-muted hover:bg-brand-border hover:text-white"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 px-4 py-4">
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

          {/* Options */}
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

          {/* Summary */}
          <div className="rounded border border-brand-accent/30 bg-brand-accent/10 p-3">
            {addressCount > 0 ? (
              <p className="text-sm text-brand-accent">
                Will export <strong>{addressCount}</strong> labels ({pageCount} {pageCount === 1 ? 'page' : 'pages'})
              </p>
            ) : (
              <p className="text-sm text-yellow-400">
                No funders with addresses in current selection
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
            disabled={isExporting || addressCount === 0}
            className="rounded bg-brand-accent px-4 py-2 text-sm font-medium text-brand-dark hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : 'Export Labels'}
          </button>
        </div>
      </div>
    </div>
  );
}
