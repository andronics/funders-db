/**
 * Export funders to CSV
 */
export function exportToCSV(funders, filename = 'funders.csv') {
  const headers = [
    'Name',
    'Established',
    'URL',
    'Categories',
    'Beneficiaries',
    'Focus Areas',
    'Locations',
    'Grants to Organisations',
    'Assets',
    'Income',
    'Organisations Supported',
    'Contact Email',
    'Contact Phone',
    'Contact Address'
  ];

  const rows = funders.map(f => [
    f.name || '',
    f.established || '',
    f.url || '',
    (f.categories || []).join('; '),
    (f.beneficiaries || []).join('; '),
    (f.focus || []).join('; '),
    (f.locations || []).join('; '),
    f.financial?.grants_to_organisations || '',
    f.financial?.assets || '',
    f.financial?.income || '',
    f.financial?.organisations_supported || '',
    f.contact?.email || '',
    f.contact?.telephone || '',
    (f.contact?.address || '').replace(/\n/g, ', ')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      row.map(cell => {
        const str = String(cell);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
