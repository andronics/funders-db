import { useState, useEffect } from 'react';
import { ShareIcon, CopyIcon, MailIcon, CheckIcon } from '../ui/Icons';

export function ShareButton({ funderId, funderName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset copied state after delay
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

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

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-md border border-brand-border bg-brand-card py-1 shadow-lg">
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
        </>
      )}
    </div>
  );
}
