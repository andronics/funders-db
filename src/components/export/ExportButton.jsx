import { useState } from 'react';
import { DownloadIcon } from '../ui/Icons';
import { exportToCSV } from '../../lib/exportCsv';
import { exportToPDF } from '../../lib/exportPdf';

export function ExportButton({ funders, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format) => {
    if (funders.length === 0) return;

    setIsExporting(true);
    try {
      if (format === 'csv') {
        exportToCSV(funders, `funders-${Date.now()}.csv`);
      } else if (format === 'pdf') {
        await exportToPDF(funders, `funders-${Date.now()}.pdf`);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || funders.length === 0}
        className="flex items-center gap-1.5 rounded-md border border-brand-border px-3 py-1.5 text-xs text-brand-text transition-colors hover:bg-brand-card disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DownloadIcon className="h-3.5 w-3.5" />
        Export
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-brand-border bg-brand-card py-1 shadow-lg">
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="block w-full px-3 py-2 text-left text-sm text-brand-text hover:bg-brand-border disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : 'Export as CSV'}
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className="block w-full px-3 py-2 text-left text-sm text-brand-text hover:bg-brand-border disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : 'Export as PDF'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
