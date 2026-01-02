/**
 * Format a number as GBP currency
 */
export function formatCurrency(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format a date string as "Mon YYYY"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

/**
 * Format a large number with abbreviations (1.2M, 500K)
 */
export function formatCompactNumber(num) {
  if (num == null) return '—';
  if (num >= 1000000) {
    return `£${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `£${(num / 1000).toFixed(0)}K`;
  }
  return `£${num}`;
}
