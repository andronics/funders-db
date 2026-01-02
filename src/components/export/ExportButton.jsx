import { useState } from 'react';
import { DownloadIcon } from '../ui/Icons';
import { PdfExportModal } from './PdfExportModal';
import { DataExportModal } from './DataExportModal';

export function ExportButton({ funders, allFunders, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);

  const handlePdfClick = () => {
    setShowPdfModal(true);
    setIsOpen(false);
  };

  const handleDataClick = () => {
    setShowDataModal(true);
    setIsOpen(false);
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
          <div className="absolute right-0 top-full z-50 mt-1 w-32 rounded-md border border-brand-border bg-brand-card py-1 shadow-lg">
            <button
              onClick={handleDataClick}
              className="block w-full px-3 py-2 text-left text-sm text-brand-text hover:bg-brand-border"
            >
              Export Data
            </button>
            <button
              onClick={handlePdfClick}
              className="block w-full px-3 py-2 text-left text-sm text-brand-text hover:bg-brand-border"
            >
              Export PDF's
            </button>

          </div>
        </>
      )}

      {/* PDF Export Modal */}
      {showPdfModal && (
        <PdfExportModal
          funders={funders}
          onClose={() => setShowPdfModal(false)}
        />
      )}

      {/* Data Export Modal */}
      {showDataModal && (
        <DataExportModal
          funders={funders}
          allFunders={allFunders}
          onClose={() => setShowDataModal(false)}
        />
      )}
    </div>
  );
}
