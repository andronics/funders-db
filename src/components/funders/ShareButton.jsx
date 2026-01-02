import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ShareIcon, CopyIcon, MailIcon, CheckIcon } from '../ui/Icons';

export function ShareButton({ funderId, funderName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);

  // Reset copied state after delay
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  const generateShareUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('funder', funderId);
    return url.toString();
  };

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    const shareUrl = generateShareUrl();

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
    }

    setIsOpen(false);
  };

  const handleEmail = (e) => {
    e.stopPropagation();
    const shareUrl = generateShareUrl();
    const subject = encodeURIComponent(`Check out this funder: ${funderName}`);
    const body = encodeURIComponent(
      `I found this funder that might interest you:\n\n${funderName}\n${shareUrl}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsOpen(false);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="rounded p-1.5 text-brand-muted transition-colors hover:text-brand-text"
        aria-label="Share this funder"
      >
        {copied ? (
          <CheckIcon className="h-4 w-4 text-brand-accent" />
        ) : (
          <ShareIcon className="h-4 w-4" />
        )}
      </button>

      {isOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />

          {/* Dropdown - rendered via portal to escape overflow containers */}
          <div
            className="fixed z-50 w-36 rounded-md border border-brand-border bg-brand-card py-1 shadow-lg"
            style={{
              top: dropdownPosition.top,
              right: dropdownPosition.right,
            }}
          >
            <button
              onClick={handleCopyLink}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand-text hover:bg-brand-border"
            >
              <CopyIcon className="h-4 w-4 text-brand-muted" />
              Copy Link
            </button>
            <button
              onClick={handleEmail}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-brand-text hover:bg-brand-border"
            >
              <MailIcon className="h-4 w-4 text-brand-muted" />
              Email
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
