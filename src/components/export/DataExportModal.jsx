import { useState, useMemo } from 'react';
import { exportData, estimateFileSize, formatFileSize } from '../../lib/exportData';
import { XIcon } from '../ui/Icons';

const FORMATS = [
  { id: 'json', label: 'JSON', description: 'Pretty-printed array, human readable' },
  { id: 'jsonl', label: 'JSONL', description: 'One record per line, streaming friendly' },
  { id: 'csv', label: 'CSV', description: 'Spreadsheet compatible (Excel, Google Sheets)' },
];

export function DataExportModal({ funders, allFunders, onClose }) {
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [selectedScope, setSelectedScope] = useState('filtered');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const targetFunders = selectedScope === 'full' ? allFunders : funders;

  const summary = useMemo(() => {
    const count = targetFunders.length;
    const size = estimateFileSize(targetFunders, selectedFormat);

    return {
      count,
      size: formatFileSize(size),
      valid: count > 0,
    };
  }, [targetFunders, selectedFormat]);

  const handleExport = async () => {
    if (!summary.valid) return;

    setIsExporting(true);
    setError(null);

    try {
      exportData(targetFunders, selectedFormat, selectedScope);
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
          <h2 className="text-base font-medium text-white">Export Data</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-brand-muted hover:bg-brand-border hover:text-white"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 px-4 py-4">
          {/* Format selection */}
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

          {/* Scope selection */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-brand-muted">
              Data Scope
            </label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-3 rounded border border-brand-border bg-brand-dark p-3 hover:border-brand-accent/50">
                <input
                  type="radio"
                  name="scope"
                  value="filtered"
                  checked={selectedScope === 'filtered'}
                  onChange={() => setSelectedScope('filtered')}
                  className="h-4 w-4 border-brand-border bg-brand-dark text-brand-accent focus:ring-brand-accent"
                />
                <div className="flex-1">
                  <span className="text-sm text-white">Current results</span>
                  <span className="ml-2 text-xs text-brand-muted">
                    ({funders.length.toLocaleString()} funders)
                  </span>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded border border-brand-border bg-brand-dark p-3 hover:border-brand-accent/50">
                <input
                  type="radio"
                  name="scope"
                  value="full"
                  checked={selectedScope === 'full'}
                  onChange={() => setSelectedScope('full')}
                  className="h-4 w-4 border-brand-border bg-brand-dark text-brand-accent focus:ring-brand-accent"
                />
                <div className="flex-1">
                  <span className="text-sm text-white">Full dataset</span>
                  <span className="ml-2 text-xs text-brand-muted">
                    ({allFunders.length.toLocaleString()} funders)
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Summary */}
          <div className={`rounded border p-3 ${
            summary.valid
              ? 'border-brand-accent/30 bg-brand-accent/10'
              : 'border-yellow-500/30 bg-yellow-500/10'
          }`}>
            {summary.valid ? (
              <p className="text-sm text-brand-accent">
                Will export <strong>{summary.count.toLocaleString()}</strong> funders (~{summary.size})
              </p>
            ) : (
              <p className="text-sm text-yellow-400">
                No funders to export
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
            {isExporting ? 'Exporting...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
